'use client';

interface Props {
  winner: 'attacker' | 'defender';
  reason: string | null;
  onPlayAgain: () => void;
}

const REASON_LABELS: Record<string, string> = {
  task_complete:    'Task completed successfully',
  health_depleted:  'Attacker health depleted',
  aborted:          'Battle aborted',
};

export function WinnerBanner({ winner, reason, onPlayAgain }: Props) {
  const isAttacker = winner === 'attacker';
  const color = isAttacker ? 'var(--color-attacker)' : 'var(--color-defender)';
  const label = isAttacker ? 'ATTACKER WINS' : 'DEFENDER WINS';
  const reasonText = reason ? (REASON_LABELS[reason] ?? reason) : '';

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-8 animate-fade-in"
      style={{ background: 'rgba(5,5,8,0.97)' }}
    >
      {/* Winner text */}
      <div
        className="font-display text-7xl font-black tracking-widest text-center animate-winner"
        style={{
          color,
          textShadow: `0 0 40px ${color}, 0 0 80px ${color}44`,
        }}
      >
        {label}
      </div>

      {/* Reason */}
      {reasonText && (
        <div
          className="font-game text-xl tracking-widest uppercase"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {reasonText}
        </div>
      )}

      {/* Divider */}
      <div
        className="w-64 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Play again */}
      <button
        onClick={onPlayAgain}
        className="px-12 py-4 rounded font-display text-xl font-bold tracking-widest transition-all duration-200 hover:scale-105"
        style={{
          background: `${color}18`,
          border: `2px solid ${color}`,
          color,
          boxShadow: `0 0 20px ${color}44`,
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  );
}
