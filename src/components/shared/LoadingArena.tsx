'use client';

export function LoadingArena() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8"
      style={{ background: 'var(--color-bg-deep)' }}>
      <div className="font-display text-4xl font-black tracking-widest animate-brawl-pulse"
        style={{ color: 'var(--color-attacker)' }}>
        BROWSER BRAWL
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="text-lg font-game tracking-widest"
          style={{ color: 'var(--color-text-secondary)' }}>
          ENTERING THE ARENA...
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                background: i % 2 === 0 ? 'var(--color-attacker)' : 'var(--color-defender)',
                animation: `healthFlicker 0.8s ease-in-out infinite`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
        Spawning browser session...
      </div>
    </div>
  );
}
