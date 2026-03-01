'use client';

import { useState } from 'react';
import type { Task } from '@/types/game';
import { TASKS } from '@/lib/tasks';

interface Props {
  value: Task | null;
  onChange: (task: Task) => void;
}

export function TaskSelector({ value, onChange }: Props) {
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomSubmit = () => {
    if (!custom.trim()) return;
    onChange({
      id: 'custom',
      label: 'Custom Task',
      description: custom.trim(),
      startUrl: '',
      tags: [],
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-mono tracking-widest mb-1"
        style={{ color: 'var(--color-text-secondary)' }}>
        SELECT TASK
      </div>
      <div className="flex flex-col gap-2">
        {TASKS.map(task => {
          const selected = value?.id === task.id;
          return (
            <button
              key={task.id}
              onClick={() => { onChange(task); setShowCustom(false); }}
              className="text-left px-4 py-3 rounded border transition-all duration-200"
              style={{
                borderColor: selected ? 'var(--color-attacker)' : 'var(--color-border)',
                background: selected ? 'var(--color-attacker-dim)' : 'var(--color-bg-card)',
                color: selected ? 'var(--color-attacker)' : 'var(--color-text-primary)',
                boxShadow: selected ? '0 0 10px var(--color-attacker-dim)' : 'none',
              }}
            >
              <div className="font-game font-semibold text-sm tracking-wide">{task.label}</div>
              <div className="text-xs mt-0.5 opacity-70 font-mono">{task.description}</div>
            </button>
          );
        })}

        {/* Custom task toggle */}
        <button
          onClick={() => { setShowCustom(s => !s); }}
          className="text-left px-4 py-3 rounded border transition-all duration-200"
          style={{
            borderColor: showCustom ? 'var(--color-attacker)' : 'var(--color-border)',
            background: showCustom ? 'var(--color-attacker-dim)' : 'var(--color-bg-card)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div className="font-game font-semibold text-sm tracking-wide">
            ✎ Custom Task...
          </div>
        </button>

        {showCustom && (
          <div className="flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
              placeholder="Describe the task for the attacker..."
              className="flex-1 px-3 py-2 rounded text-sm font-mono outline-none"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              onClick={handleCustomSubmit}
              className="px-4 py-2 rounded text-sm font-display font-bold tracking-wider"
              style={{
                background: 'var(--color-attacker)',
                color: '#000',
              }}
            >
              SET
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
