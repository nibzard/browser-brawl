const BU_API = 'https://api.browser-use.com/api/v2';

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Browser-Use-API-Key': process.env.BROWSER_USE_API_KEY!,
  };
}

// ── Browser Management ──────────────────────────────────────────────

export interface BUBrowser {
  id: string;
  status: string;
  cdpUrl: string;
  liveUrl: string;
  timeoutAt: string;
  startedAt: string;
}

export async function createBrowser(timeoutSecs = 900): Promise<BUBrowser> {
  const res = await fetch(`${BU_API}/browsers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ timeout: timeoutSecs }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`browser-use createBrowser failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function stopBrowser(browserId: string): Promise<void> {
  await fetch(`${BU_API}/browsers/${browserId}?action=stop`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ action: 'stop' }),
  });
}

// ── Task Management (kept for future use / browser-use agent mode) ──

export interface BUTask {
  id: string;
  sessionId: string;
}

export interface BUTaskDetails {
  id: string;
  sessionId: string;
  task: string;
  status: 'started' | 'paused' | 'finished' | 'stopped';
  output?: string | null;
  isSuccess?: boolean | null;
  steps?: {
    number: number;
    memory?: string;
    evaluationPreviousGoal?: string;
    nextGoal?: string;
    url?: string;
    actions?: string[];
  }[];
}

export async function startTask(task: string, startUrl?: string): Promise<BUTask> {
  const body: Record<string, unknown> = { task };
  if (startUrl) body.startUrl = startUrl;

  const res = await fetch(`${BU_API}/tasks`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`browser-use startTask failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getTaskDetails(taskId: string): Promise<BUTaskDetails> {
  const res = await fetch(`${BU_API}/tasks/${taskId}`, {
    headers: headers(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`browser-use getTaskDetails failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function stopTask(taskId: string): Promise<void> {
  await fetch(`${BU_API}/tasks/${taskId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ action: 'stop' }),
  });
}
