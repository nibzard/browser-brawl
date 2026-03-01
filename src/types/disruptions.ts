import type { Difficulty } from './game';

export interface DisruptionOptions {
  targetSelector?: string;
}

export interface DisruptionDefinition {
  id: string;
  name: string;
  description: string;
  minDifficulty: Difficulty;
  healthDamage: number;
  cooldownMs: number;
  generatePayload: (options?: DisruptionOptions) => string;
}
