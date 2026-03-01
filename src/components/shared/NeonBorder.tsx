'use client';

interface NeonBorderProps {
  children: React.ReactNode;
  color?: 'cyan' | 'red';
  className?: string;
}

export function NeonBorder({ children, color = 'cyan', className = '' }: NeonBorderProps) {
  const cls = color === 'cyan' ? 'border-neon-cyan' : 'border-neon-red';
  return (
    <div className={`border ${cls} ${className}`}>
      {children}
    </div>
  );
}
