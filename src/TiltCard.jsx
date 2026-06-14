// ============================================================
//  TiltCard.jsx — Card con tilt 3D + glow que sigue el cursor.
//  Pensado para envolver los .nav-card (categorías y
//  subcategorías). En mobile/touch el tilt simplemente no
//  se activa (no hay mousemove), así que es 100% progresivo.
// ============================================================

import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function TiltCard({ children, className = '', variants, onClick }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useTransform(py, [0, 1], ['10deg', '-10deg']);
  const rotateY = useTransform(px, [0, 1], ['-10deg', '10deg']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    px.set(nx);
    py.set(ny);
    e.currentTarget.style.setProperty('--mx', `${nx * 100}%`);
    e.currentTarget.style.setProperty('--my', `${ny * 100}%`);
  };

  const handleMouseLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.button
      className={`tilt-card ${className}`}
      variants={variants}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      {children}
      <span className="card-glow" />
    </motion.button>
  );
}
