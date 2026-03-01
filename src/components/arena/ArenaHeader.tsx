'use client';

import { HealthBar } from './HealthBar';
import { TurnIndicator } from './TurnIndicator';
import type { Task, AttackerStatus, DefenderStatus, GameMode, TurnOwner } from '@/types/game';

interface Props {
  health: number;
  elapsed: string;
  task: Task | null;
  attackerStatus: AttackerStatus;
  defenderStatus: DefenderStatus;
  onAbort: () => void;
  mode: GameMode;
  currentTurn: TurnOwner | null;
  turnNumber: number;
  attackerStepsThisTurn: number;
  attackerStepsPerTurn: number;
}

export function ArenaHeader({ health, elapsed, task, attackerStatus, defenderStatus, onAbort, mode, currentTurn, turnNumber, attackerStepsThisTurn, attackerStepsPerTurn }: Props) {
  return (
    <div className="flex flex-col gap-1 shrink-0 px-4 py-2"
      style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-panel)' }}>

      {/* Top row: labels + timer + abort */}
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-bold tracking-widest neon-cyan">
          ⚔ ATTACKER
        </span>

        <div className="flex items-center gap-4">
          {task && (
            <span className="text-xs font-mono truncate max-w-xs"
              style={{ color: 'var(--color-text-secondary)' }}>
              {task.label}
            </span>
          )}
          <span className="font-display text-sm font-bold tabular-nums"
            style={{ color: 'var(--color-text-primary)' }}>
            ⏱ {elapsed}
          </span>
          <button
            onClick={onAbort}
            className="text-xs font-mono px-2 py-1 rounded border transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            ABORT
          </button>
        </div>

        <span className="font-display text-xs font-bold tracking-widest neon-red">
          DEFENDER 🛡
        </span>
      </div>

      {/* Health bar row */}
      <HealthBar health={health} />

      {/* Turn indicator (turn-based mode only) */}
      {mode === 'turnbased' && currentTurn && (
        <TurnIndicator
          currentTurn={currentTurn}
          turnNumber={turnNumber}
          stepsRemaining={attackerStepsPerTurn - attackerStepsThisTurn}
          stepsPerTurn={attackerStepsPerTurn}
        />
      )}
    </div>
  );
}
