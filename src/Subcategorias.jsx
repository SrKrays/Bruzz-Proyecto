// ============================================================
//  Subcategorias.jsx — REEMPLAZAR COMPLETAMENTE
//
//  ✅ Imagen via imageUrl (campo en menuData.js)
//  ✅ Sin iconos
//  ✅ Texto legible con overlay degradado oscuro
// ============================================================

import { SUBCATEGORIAS } from './menuData';

const SECTION_META = {
  comidas: { label: 'Comidas'  },
  bebidas: { label: 'Bebidas'  },
  tragos:  { label: 'Tragos'   },
};

export default function Subcategorias({ seccion, onNavigate, onShowItems }) {
  const subcats = SUBCATEGORIAS[seccion] ?? [];
  const meta    = SECTION_META[seccion]  ?? { label: seccion };

  return (
    <div className="screen-body fade-up">

      <div className="back-row">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          ← Inicio
        </button>
        <span className="screen-title">{meta.label}</span>
      </div>

      <div className="card-grid wide">
        {subcats.map((sub) => (
          <button
            key={sub.menuKey}
            className={`nav-card${sub.fullWidth ? ' full-width' : ''}`}
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
          </button>
        ))}
      </div>

    </div>
  );
}
