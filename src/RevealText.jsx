// ============================================================
//  RevealText.jsx — Título con efecto "cortina" cinematográfico.
//  Envuelve el texto en un contenedor con overflow:hidden y
//  desliza el contenido desde abajo hacia su posición final.
//
//  Uso:
//    <RevealText as="span" className="screen-title">Pizza</RevealText>
// ============================================================

import { motion } from 'framer-motion';

export default function RevealText({ children, as = 'span', className = '', delay = 0 }) {
  const MotionTag = motion[as] || motion.span;

  return (
    <span className={`reveal-mask ${className}`}>
      <MotionTag
        className="reveal-inner"
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </MotionTag>
    </span>
  );
}
