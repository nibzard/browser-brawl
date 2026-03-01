import WebSocket from 'ws';

/**
 * Inject JavaScript into a browser session via CDP Runtime.evaluate.
 * Opens a temporary WebSocket to the CDP endpoint, sends the evaluate command, and closes.
 *
 * cdpUrl can be https:// (browser-use format) or wss:// format.
 */
export async function injectJS(cdpUrl: string, script: string): Promise<boolean> {
  if (!cdpUrl) {
    console.error('[injectJS] No CDP URL provided');
    return false;
  }

  try {
    // Ensure we have an https:// base for the /json endpoint
    const httpBase = cdpUrl
      .replace('wss://', 'https://')
      .replace('ws://', 'http://');
    const baseUrl = new URL(httpBase);
    const targetsUrl = `${baseUrl.protocol}//${baseUrl.host}/json`;

    const targetsRes = await fetch(targetsUrl);
    if (!targetsRes.ok) {
      console.error('[injectJS] Failed to list CDP targets:', targetsRes.status);
      return false;
    }

    const targets = await targetsRes.json();
    const page = targets.find((t: { type: string; webSocketDebuggerUrl?: string }) => t.type === 'page');
    if (!page?.webSocketDebuggerUrl) {
      console.error('[injectJS] No page target found');
      return false;
    }

    return await evaluateViaCDP(page.webSocketDebuggerUrl, script);
  } catch (err) {
    console.error('[injectJS] error:', err);
    return false;
  }
}

function evaluateViaCDP(wsUrl: string, expression: string): Promise<boolean> {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);
    const timeout = setTimeout(() => {
      ws.close();
      resolve(false);
    }, 5000);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression, awaitPromise: false },
      }));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.id === 1) {
          clearTimeout(timeout);
          ws.close();
          resolve(!msg.error);
        }
      } catch {
        // ignore
      }
    });

    ws.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}
