'use client';

import { useEffect, useRef } from 'react';
import { ArenaHeader } from './ArenaHeader';
import { AttackerPanel } from './AttackerPanel';
import { DefenderPanel } from './DefenderPanel';
import { BrowserFrame } from './BrowserFrame';
import { useArenaTimer } from '@/hooks/useArenaTimer';
import type { ClientGameState } from '@/types/game';

interface Props {
  state: ClientGameState;
  onAbort: () => void;
}

export function ArenaScreen({ state, onAbort }: Props) {
  const { formatted } = useArenaTimer(state.phase === 'arena');
  const prevDisruptionCount = useRef(state.defenderDisruptions.length);
  const isNewHit =
    state.defenderDisruptions.length > prevDisruptionCount.current
    || state.lastHit;

  useEffect(() => {
    prevDisruptionCount.current = state.defenderDisruptions.length;
  }, [state.defenderDisruptions.length]);

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: 'var(--color-bg-deep)' }}
    >
      <ArenaHeader
        health={state.health}
        elapsed={formatted}
        task={state.task}
        attackerStatus={state.attackerStatus}
        defenderStatus={state.defenderStatus}
        onAbort={onAbort}
        mode={state.mode}
        currentTurn={state.currentTurn}
        turnNumber={state.turnNumber}
        attackerStepsThisTurn={state.attackerStepsThisTurn}
        attackerStepsPerTurn={state.attackerStepsPerTurn}
      />

      <main className="flex flex-1 gap-2 p-2 overflow-hidden min-h-0">
        <AttackerPanel
          steps={state.attackerSteps}
          status={state.attackerStatus}
        />
        <BrowserFrame
          liveViewUrl={state.liveViewUrl ?? ''}
          hit={isNewHit}
        />
        <DefenderPanel
          disruptions={state.defenderDisruptions}
          status={state.defenderStatus}
        />
      </main>
    </div>
  );
}
