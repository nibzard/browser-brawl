import type { SSEEnvelope, SSEEventType } from '@/types/events';
import { getSession } from './game-session-store';

export function emitEvent<T>(
  sessionId: string,
  type: SSEEventType,
  payload: T
): void {
  const session = getSession(sessionId);
  if (!session) return;

  const envelope: SSEEnvelope<T> = {
    type,
    sessionId,
    timestamp: new Date().toISOString(),
    payload,
  };

  const data = `data: ${JSON.stringify(envelope)}\n\n`;

  for (const controller of session.sseClients) {
    try {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(data));
    } catch {
      // Client disconnected — remove it
      session.sseClients.delete(controller);
    }
  }
}
