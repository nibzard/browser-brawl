'use client';

import { useRef, useEffect } from 'react';
import type { AgentEvent, AttackerStatus } from '@/types/game';

const STATUS_LABELS: Record<AttackerStatus, string> = {
  idle:     'IDLE',
  thinking: 'THINKING',
  acting:   'ACTING',
  complete: 'DONE',
  failed:   'FAILED',
};

const STATUS_COLORS: Record<AttackerStatus, string> = {
  idle:     'var(--color-text-secondary)',
  thinking: '#ffaa00',
  acting:   'var(--color-attacker)',
  complete: 'var(--color-health-high)',
  failed:   'var(--color-health-low)',
};

interface Props {
  steps: AgentEvent[];
  status: AttackerStatus;
}

export function AttackerPanel({ steps, status }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps.length]);

  return (
    <div className="flex flex-col h-full w-72 shrink-0 rounded overflow-hidden"
      style={{ border: '1px solid rgba(0,212,255,0.25)', background: 'var(--color-bg-panel)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(0,212,255,0.15)' }}>
        <span className="font-display text-sm font-bold tracking-widest neon-cyan">
          ATTACKER
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{
            color: STATUS_COLORS[status],
            background: `${STATUS_COLORS[status]}22`,
            border: `1px solid ${STATUS_COLORS[status]}44`,
          }}
        >
          ● {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 feed-scroll"
      >
        {steps.length === 0 ? (
          <div className="text-xs font-mono mt-4 text-center opacity-40"
            style={{ color: 'var(--color-text-secondary)' }}>
            Waiting for attacker...
          </div>
        ) : (
          steps.map((step, i) => (
            <div
              key={step.id}
              className={`mb-2 ${i === steps.length - 1 ? 'animate-slide-left' : ''}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono shrink-0 mt-0.5"
                  style={{ color: 'var(--color-attacker)', opacity: 0.6 }}>
                  {String(step.step).padStart(2, '0')}
                </span>
                <span className="text-xs font-mono leading-relaxed"
                  style={{ color: 'var(--color-text-mono)' }}>
                  {step.description}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 shrink-0 text-xs font-mono"
        style={{ borderTop: '1px solid rgba(0,212,255,0.1)', color: 'var(--color-text-secondary)' }}>
        {steps.length} step{steps.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
