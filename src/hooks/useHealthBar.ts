'use client';

import { useState, useEffect, useRef } from 'react';

export function useHealthBar(health: number) {
  const [shaking, setShaking] = useState(false);
  const prevHealth = useRef(health);

  useEffect(() => {
    if (health < prevHealth.current) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 450);
      return () => clearTimeout(t);
    }
    prevHealth.current = health;
  }, [health]);

  const color =
    health > 50
      ? 'var(--color-health-high)'
      : health > 20
      ? 'var(--color-health-mid)'
      : 'var(--color-health-low)';

  const isCritical = health < 20;

  return { shaking, color, isCritical };
}
