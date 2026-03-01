'use client';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function StartButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-5 rounded font-display text-2xl font-black tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      style={
        disabled
          ? { background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)' }
          : {
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(255,0,60,0.15))',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
              color: 'white',
            }
      }
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.animation = 'brawl-pulse 1s ease-in-out infinite';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.animation = '';
      }}
    >
      <span className="neon-cyan">⚡</span>
      {' '}BRAWL{' '}
      <span className="neon-red">⚡</span>
    </button>
  );
}
