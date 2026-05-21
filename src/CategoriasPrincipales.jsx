import { useState } from 'react';
import { CATEGORIAS } from './menuData';
import CuentaDividida, { SplitBillIcon } from './CuentaDividida';
import PromoDelDia from './PromoDelDia';

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

export default function CategoriasPrincipales({ onNavigate }) {
  const [splitOpen, setSplitOpen] = useState(false);

  return (
    <div className="screen-body fade-up">

      {/* ── Promo del día ── */}
      <PromoDelDia />

      <p className="intro-label">¿Qué vas a pedir?</p>

      <div className="card-grid">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            className="nav-card"
            onClick={() => onNavigate(cat.id)}
          >
            {cat.imageUrl && (
              <img src={cat.imageUrl} alt={cat.name} className="card-bg-img" />
            )}
            <div className="card-overlay" />
            <span className="card-name">{cat.name}</span>
            <span className="card-desc">{cat.desc}</span>
          </button>
        ))}
      </div>

      {/* Barra inferior */}
      <div className="bottom-bar">

        <button
          className="split-bill-btn"
          onClick={() => setSplitOpen(true)}
          aria-label="Dividir cuenta"
          title="¿Cada uno paga lo suyo?"
        >
          <SplitBillIcon />
        </button>

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

      {splitOpen && (
        <CuentaDividida onClose={() => setSplitOpen(false)} />
      )}

    </div>
  );
}
