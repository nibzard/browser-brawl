import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/game-session-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    gameId: session.gameId,
    phase: session.phase,
    health: session.health,
    attackerStatus: session.attackerStatus,
    defenderStatus: session.defenderStatus,
    task: session.task,
    difficulty: session.difficulty,
    winner: session.winner,
    winReason: session.winReason,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    liveViewUrl: session.liveViewUrl,
    attackerSteps: session.attackerSteps,
    defenderDisruptions: session.defenderDisruptions,
  });
}
