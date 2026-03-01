import type { AttackerStatus, DefenderStatus, TurnOwner } from './game';

export type SSEEventType =
  | 'connection_established'
  | 'attacker_step'
  | 'defender_disruption'
  | 'health_update'
  | 'status_update'
  | 'timer_tick'
  | 'turn_change'
  | 'game_over';

export interface SSEEnvelope<T = unknown> {
  type: SSEEventType;
  sessionId: string;
  timestamp: string;
  payload: T;
}

export interface AttackerStepPayload {
  step: number;
  description: string;
  agentStatus: AttackerStatus;
  isComplete?: boolean;
}

export interface DefenderDisruptionPayload {
  disruptionId: string;
  disruptionName: string;
  description: string;
  healthDamage: number;
  success: boolean;
  reasoning: string;
}

export interface HealthUpdatePayload {
  currentHealth: number;
  previousHealth: number;
  delta: number;
  isCritical: boolean;
}

export interface TimerTickPayload {
  elapsedSeconds: number;
}

export interface StatusUpdatePayload {
  attackerStatus: AttackerStatus;
  defenderStatus: DefenderStatus;
}

export interface TurnChangePayload {
  currentTurn: TurnOwner;
  turnNumber: number;
  attackerStepsRemaining: number;
  attackerStepsPerTurn: number;
}

export interface GameOverPayload {
  winner: 'attacker' | 'defender';
  reason: string;
  finalHealth: number;
  elapsedSeconds: number;
}
