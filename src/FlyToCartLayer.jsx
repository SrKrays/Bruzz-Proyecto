// ============================================================
//  FlyToCartLayer.jsx — Overlay que dibuja la miniatura
//  "volando" desde el botón Agregar hasta el ícono del carrito.
//  Se monta una sola vez en App.jsx.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { onFlyToCart } from './flyToCart';

export default function FlyToCartLayer() {
  const [flights, setFlights] = useState([]);

  const remove = useCallback((id) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const bumpCart = useCallback(() => {
    const el = document.querySelector('.cart-fab-header');
    if (!el) return;
    el.classList.add('cart-bump');
    setTimeout(() => el.classList.remove('cart-bump'), 420);
  }, []);

  useEffect(() => {
    return onFlyToCart(({ rect, imageUrl }) => {
      const target = document.querySelector('.cart-fab-header');
      if (!rect || !target) return;
      const tRect = target.getBoundingClientRect();

      const size = 42;
      const id = `${Date.now()}-${Math.random()}`;

      setFlights((prev) => [
        ...prev,
        {
          id,
          imageUrl,
          start: {
            x: rect.left + rect.width / 2 - size / 2,
            y: rect.top + rect.height / 2 - size / 2,
          },
          end: {
            x: tRect.left + tRect.width / 2 - size / 2,
            y: tRect.top + tRect.height / 2 - size / 2,
          },
        },
      ]);
    });
  }, []);

  return (
    <div className="fly-to-cart-layer" aria-hidden="true">
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="fly-item"
          initial={{ x: f.start.x, y: f.start.y, scale: 1, opacity: 1, rotate: 0 }}
          animate={{ x: f.end.x, y: f.end.y, scale: 0.15, opacity: 0, rotate: 25 }}
          transition={{ duration: 0.65, ease: [0.55, 0, 0.1, 1] }}
          onAnimationComplete={() => {
            remove(f.id);
            bumpCart();
          }}
        >
          {f.imageUrl ? (
            <img src={f.imageUrl} alt="" />
          ) : (
            <span className="fly-item-dot" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
