'use client';

import type { Difficulty } from '@/types/game';

const OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy',      label: 'EASY',      desc: 'Slow, limited disruptions',   color: '#00ff88' },
  { value: 'medium',    label: 'MEDIUM',    desc: 'Moderate pressure',            color: '#ffaa00' },
  { value: 'hard',      label: 'HARD',      desc: 'Fast and aggressive',          color: '#ff6600' },
  { value: 'nightmare', label: 'NIGHTMARE', desc: 'Relentless coordinated chaos', color: '#ff003c' },
];

interface Props {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

export function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-mono tracking-widest mb-1"
        style={{ color: 'var(--color-text-secondary)' }}>
        DEFENDER DIFFICULTY
      </div>
      <div className="flex gap-3">
        {OPTIONS.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded border transition-all duration-200 font-display text-sm font-bold tracking-wider"
              style={{
                borderColor: selected ? opt.color : 'var(--color-border)',
                background: selected ? `${opt.color}18` : 'var(--color-bg-card)',
                color: selected ? opt.color : 'var(--color-text-secondary)',
                boxShadow: selected ? `0 0 12px ${opt.color}44` : 'none',
              }}
            >
              <span>{opt.label}</span>
              <span className="text-xs font-game font-normal tracking-normal normal-case"
                style={{ color: selected ? opt.color : 'var(--color-text-secondary)', opacity: 0.8 }}>
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
