import Anthropic from '@anthropic-ai/sdk';
import { getSession, type ServerGameSession } from './game-session-store';
import { getDisruptionsForDifficulty, getDisruptionById } from './disruptions';
import { injectJS } from './browserbase';
import { emitEvent } from './sse-emitter';
import { nanoid } from 'nanoid';
import type { DisruptionEvent } from '@/types/game';
import type { DefenderDisruptionPayload, HealthUpdatePayload } from '@/types/events';

const client = new Anthropic();

const DIFFICULTY_INTERVAL: Record<string, number> = {
  easy:      20000,
  medium:    10000,
  hard:      5000,
  nightmare: 2500,
};

const HEALTH_DECAY_PER_SEC: Record<string, number> = {
  easy:      0.05,
  medium:    0.2,
  hard:      0.4,
  nightmare: 0.8,
};

export function startDefenderLoop(gameId: string): void {
  const session = getSession(gameId);
  if (!session) return;

  // Start passive health decay (every second)
  session.healthDecayHandle = setInterval(() => {
    tickHealthDecay(gameId);
  }, 1000);

  // Start defender attack loop
  scheduleNextAttack(gameId);
}

function scheduleNextAttack(gameId: string): void {
  const session = getSession(gameId);
  if (!session || session.phase !== 'arena') return;

  const intervalMs = DIFFICULTY_INTERVAL[session.difficulty] ?? 15000;
  session.defenderLoopHandle = setTimeout(async () => {
    await runDefenderTurn(gameId);
    scheduleNextAttack(gameId);
  }, intervalMs);
}

function tickHealthDecay(gameId: string): void {
  const session = getSession(gameId);
  if (!session || session.phase !== 'arena') return;

  const decayPerSec = HEALTH_DECAY_PER_SEC[session.difficulty] ?? 0.05;
  const prev = session.health;
  const next = Math.max(0, prev - decayPerSec);
  session.health = next;

  if (next <= 0 && prev > 0) {
    endGame(gameId, 'defender', 'health_depleted');
    return;
  }

  // Emit timer tick + health update every second
  const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
  emitEvent(gameId, 'timer_tick', { elapsedSeconds: elapsed });

  // Emit health update when meaningfully changed (every ~5 sec or on big changes)
  if (Math.floor(prev) !== Math.floor(next) || prev - next > 1) {
    emitEvent<HealthUpdatePayload>(gameId, 'health_update', {
      currentHealth: next,
      previousHealth: prev,
      delta: -(prev - next),
      isCritical: next < 20,
    });
  }
}

async function runDefenderTurn(gameId: string): Promise<void> {
  const session = getSession(gameId);
  if (!session || session.phase !== 'arena') return;

  emitEvent(gameId, 'status_update', {
    attackerStatus: session.attackerStatus,
    defenderStatus: 'plotting',
  });
  session.defenderStatus = 'plotting';

  const availableDisruptions = getDisruptionsForDifficulty(session.difficulty);

  // Filter out disruptions on cooldown
  const now = Date.now();
  const ready = availableDisruptions.filter(d => {
    const lastUsed = session.defenderCooldowns.get(d.id) ?? 0;
    return now - lastUsed >= d.cooldownMs;
  });

  if (ready.length === 0) return;

  const recentSteps = session.attackerSteps
    .slice(-3)
    .map(s => `Step ${s.step}: ${s.description}`)
    .join('\n') || 'No steps yet — attacker is just getting started.';

  const disruptionList = ready.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    damage: d.healthDamage,
  }));

  let chosen: { disruptionId: string; reasoning: string } | null = null;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `You are the DEFENDER in Browser Brawl, a game where an AI attacker tries to complete a web task.

TASK THE ATTACKER IS TRYING TO DO:
"${session.task.description}"

ATTACKER'S RECENT STEPS:
${recentSteps}

AVAILABLE DISRUPTIONS:
${JSON.stringify(disruptionList, null, 2)}

Pick ONE disruption most likely to confuse or block the attacker right now, based on where they are in the task.
Respond with JSON only, no markdown: {"disruptionId":"<id>","reasoning":"<1 sentence why>"}`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    // Strip markdown code fences if present
    const clean = text.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
    chosen = JSON.parse(clean);
  } catch (err) {
    // Fallback: pick first available
    chosen = { disruptionId: ready[0].id, reasoning: 'Fallback selection.' };
    console.error('[defender] LLM error, using fallback:', err);
  }

  if (!chosen) return;

  const disruption = getDisruptionById(chosen.disruptionId) ?? ready[0];
  if (!disruption) return;

  session.defenderStatus = 'striking';
  emitEvent(gameId, 'status_update', {
    attackerStatus: session.attackerStatus,
    defenderStatus: 'striking',
  });

  const payload = disruption.generatePayload();
  const success = await injectJS(session.cdpUrl, payload);

  session.defenderCooldowns.set(disruption.id, Date.now());

  const event: DisruptionEvent = {
    id: nanoid(8),
    disruptionId: disruption.id,
    disruptionName: disruption.name,
    description: disruption.description,
    healthDamage: disruption.healthDamage,
    success,
    timestamp: new Date().toISOString(),
    reasoning: chosen.reasoning,
  };
  session.defenderDisruptions.push(event);

  // Damage health
  if (success) {
    const prev = session.health;
    const next = Math.max(0, prev - disruption.healthDamage);
    session.health = next;

    emitEvent<DefenderDisruptionPayload>(gameId, 'defender_disruption', {
      disruptionId: disruption.id,
      disruptionName: disruption.name,
      description: disruption.description,
      healthDamage: disruption.healthDamage,
      success,
      reasoning: chosen.reasoning,
    });

    emitEvent<HealthUpdatePayload>(gameId, 'health_update', {
      currentHealth: next,
      previousHealth: prev,
      delta: -disruption.healthDamage,
      isCritical: next < 20,
    });

    if (next <= 0) {
      endGame(gameId, 'defender', 'health_depleted');
      return;
    }
  }

  session.defenderStatus = 'cooling_down';
  emitEvent(gameId, 'status_update', {
    attackerStatus: session.attackerStatus,
    defenderStatus: 'cooling_down',
  });
}

export function endGame(
  gameId: string,
  winner: 'attacker' | 'defender',
  reason: 'task_complete' | 'health_depleted' | 'aborted'
): void {
  const session = getSession(gameId);
  if (!session || session.phase === 'game_over') return;

  session.phase = 'game_over';
  session.winner = winner;
  session.winReason = reason;
  session.endedAt = new Date().toISOString();

  // Stop loops
  if (session.defenderLoopHandle) clearTimeout(session.defenderLoopHandle);
  if (session.healthDecayHandle) clearInterval(session.healthDecayHandle);
  if (session.attackerAbort) session.attackerAbort.abort();

  const elapsed = Math.floor(
    (Date.now() - new Date(session.startedAt).getTime()) / 1000
  );

  emitEvent(gameId, 'game_over', {
    winner,
    reason,
    finalHealth: session.health,
    elapsedSeconds: elapsed,
  });
}
