// ============================================================
//  EmberParticles.jsx — Partículas doradas ambiente
//  (brasas / burbujas). Capa decorativa fija de fondo,
//  no interactiva, muy bajo costo de performance.
// ============================================================

import { useMemo } from 'react';

const EMBER_COUNT = 16;

export default function EmberParticles() {
  const embers = useMemo(
    () =>
      Array.from({ length: EMBER_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 16 + Math.random() * 18,
        delay: -(Math.random() * 30),
        drift: (Math.random() - 0.5) * 90,
        opacity: 0.25 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div className="ember-layer" aria-hidden="true">
      {embers.map((e) => (
        <span
          key={e.id}
          className="ember"
          style={{
            left: `${e.left}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            opacity: e.opacity,
            '--drift': `${e.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
