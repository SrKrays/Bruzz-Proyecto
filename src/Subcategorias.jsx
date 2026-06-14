// ============================================================
//  Subcategorias.jsx — REEMPLAZAR COMPLETAMENTE
//
//  ✅ Imagen via imageUrl (campo en menuData.js)
//  ✅ Sin iconos
//  ✅ Texto legible con overlay degradado oscuro
// ============================================================

import { motion } from 'framer-motion';
import { SUBCATEGORIAS } from './menuData';
import TiltCard from './TiltCard';
import RevealText from './RevealText';

const SECTION_META = {
  comidas: { label: 'Comidas'  },
  bebidas: { label: 'Bebidas'  },
  tragos:  { label: 'Tragos'   },
};

// ── Entrada escalonada de las cards de subcategorías ───────
const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Subcategorias({ seccion, onNavigate, onShowItems }) {
  const subcats = SUBCATEGORIAS[seccion] ?? [];
  const meta    = SECTION_META[seccion]  ?? { label: seccion };

  return (
    <div className="screen-body">

      <div className="back-row">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          ← Inicio
        </button>
        <span className="screen-title">
          <RevealText as="span">{meta.label}</RevealText>
        </span>
      </div>

      <motion.div
        className="card-grid wide"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {subcats.map((sub) => (
          <TiltCard
            key={sub.menuKey}
            className={`nav-card${sub.fullWidth ? ' full-width' : ''}`}
            variants={cardVariants}
            onClick={() => onShowItems(sub.menuKey)}
          >
            {/* Imagen de fondo */}
            {sub.imageUrl && (
              <img
                src={sub.imageUrl}
                alt={sub.name}
                className="card-bg-img"
              />
            )}

            {/* Overlay oscuro para legibilidad */}
            <div className="card-overlay" />

            {/* Texto encima */}
            <span className="card-name">{sub.name}</span>
            <span className="card-desc">{sub.desc}</span>
          </TiltCard>
        ))}
      </motion.div>

    </div>
  );
}
