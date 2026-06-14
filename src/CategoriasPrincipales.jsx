import { motion } from 'framer-motion';
import { CATEGORIAS } from './menuData';
import TiltCard from './TiltCard';
import RevealText from './RevealText';

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const IG_URL = 'https://www.instagram.com/bruzzok/';

// ── Entrada escalonada de las cards de categorías ──────────
const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 26, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function CategoriasPrincipales({ onNavigate }) {
  return (
    <div className="screen-body">

      <p className="intro-label">
        <RevealText as="span">¿Qué vas a pedir?</RevealText>
      </p>

      <motion.div
        className="card-grid"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {CATEGORIAS.map((cat) => (
          <TiltCard
            key={cat.id}
            className="nav-card"
            variants={cardVariants}
            onClick={() => onNavigate(cat.id)}
          >
            {cat.imageUrl && (
              <img src={cat.imageUrl} alt={cat.name} className="card-bg-img" />
            )}
            <div className="card-overlay" />
            <span className="card-name">{cat.name}</span>
            <span className="card-desc">{cat.desc}</span>
          </TiltCard>
        ))}
      </motion.div>

      {/* Barra inferior: Compartir + Instagram */}
      <div className="bottom-bar">
        <button
          className="share-btn"
          onClick={() =>
            window.open(
              'https://api.whatsapp.com/send?text=Mirá la carta de Bruzz: https://bruzz.com.ar',
              '_blank'
            )
          }
        >
          ↗ Compartir Carta
        </button>

        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ig-btn"
          aria-label="Instagram de Bruzz"
        >
          <IgIcon />
        </a>
      </div>

    </div>
  );
}
