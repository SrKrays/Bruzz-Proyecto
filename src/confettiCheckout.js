// ============================================================
//  confettiCheckout.js — Explosión de confetti dorado al
//  confirmar el pedido. Usa canvas-confetti (CDN / npm).
//  Si la lib no está instalada, no rompe nada (falla silenciosa).
// ============================================================

export function launchConfetti() {
  try {
    // Intenta importar canvas-confetti de window (si está cargado via CDN)
    // o vía npm (import dinámico)
    if (typeof window !== 'undefined' && window.confetti) {
      fire(window.confetti);
      return;
    }
    // npm: canvas-confetti
    import('canvas-confetti').then(({ default: confetti }) => fire(confetti));
  } catch {
    // Silencioso si no está disponible
  }
}

function fire(confetti) {
  // Ráfaga principal desde el centro-inferior
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { x: 0.5, y: 0.75 },
    colors: ['#f5c842', '#c9a230', '#fff8e1', '#ffffff', '#3d8a5a'],
    scalar: 1.1,
    ticks: 180,
  });

  // Segunda ráfaga lateral izquierda con delay
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#f5c842', '#fff', '#2d6b45'],
      ticks: 140,
    });
  }, 120);

  // Lateral derecha
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#f5c842', '#fff', '#2d6b45'],
      ticks: 140,
    });
  }, 200);
}
