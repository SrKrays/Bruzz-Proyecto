// ============================================================
//  flyToCart.js — Bus de eventos simple para la animación
//  "vuelo al carrito". Evita pasar props por 3 niveles de
//  componentes (App → Items → ExpandableItemCard).
// ============================================================

const EVENT_NAME = 'bruzz:fly-to-cart';

/**
 * Dispara la animación de "vuelo" hacia el carrito.
 * @param {{ rect: DOMRect, imageUrl?: string }} detail
 */
export function emitFlyToCart(detail) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
}

/**
 * Suscribe un handler al evento de vuelo. Devuelve función de limpieza.
 * @param {(detail: { rect: DOMRect, imageUrl?: string }) => void} handler
 */
export function onFlyToCart(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
