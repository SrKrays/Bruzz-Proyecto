// ============================================================
//  Items.jsx — REEMPLAZAR COMPLETAMENTE
//
//  ✅ Si el item tiene imageUrl → muestra la foto del plato
//  ✅ Sin iconos
//  ✅ Texto legible sobre imagen con overlay
// ============================================================

import { MENU, POSTRES } from './menuData';

// ── Card de plato CON imagen ──────────────────────────────
function ItemCardWithImage({ item, delay }) {
  return (
    <div className="item-card item-card--img" style={{ animationDelay: `${delay}ms` }}>
      {/* Imagen del plato */}
      <div className="item-img-wrap">
        <img src={item.imageUrl} alt={item.name} className="item-img" />
        <div className="item-img-overlay" />
      </div>

      {/* Info */}
      <div className="item-info">
        <div className="item-row">
          <span className="item-name">
            {item.name}
            {item.badge && <span className="badge">{item.badge}</span>}
          </span>
          <span className="item-price">{item.price}</span>
        </div>
        {item.desc && <p className="item-desc">{item.desc}</p>}
      </div>
    </div>
  );
}

// ── Card de plato SIN imagen ──────────────────────────────
function ItemCard({ item, delay }) {
  return (
    <div className="item-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="item-row">
        <span className="item-name">
          {item.name}
          {item.badge && <span className="badge">{item.badge}</span>}
        </span>
        <span className="item-price">{item.price}</span>
      </div>
      {item.desc && <p className="item-desc">{item.desc}</p>}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────
export default function Items({ menuKey, onNavigate }) {
  const isPostres = menuKey === 'postres';
  const data      = isPostres ? null    : MENU[menuKey];
  const items     = isPostres ? POSTRES : data?.items ?? [];
  const title     = isPostres ? 'Postres' : data?.title ?? '';
  const backScreen = isPostres ? 'home' : (data?.back ?? 'home');

  let cardIndex = 0;

  return (
    <div className="screen-body fade-up">

      <div className="back-row">
        <button className="back-btn" onClick={() => onNavigate(backScreen)}>
          ← Volver
        </button>
        <span className="screen-title">{title}</span>
      </div>

      <div className="items-list">
        {items.map((item, i) => {

          if (item.sep) {
            return <p key={`sep-${i}`} className="section-sep">{item.sep}</p>;
          }

          const delay = cardIndex * 35;
          cardIndex++;

          // Si el item tiene imagen → card con foto
          if (item.imageUrl) {
            return <ItemCardWithImage key={`${item.name}-${i}`} item={item} delay={delay} />;
          }

          return <ItemCard key={`${item.name}-${i}`} item={item} delay={delay} />;
        })}
      </div>

    </div>
  );
}
