import { PROMO_DEL_DIA } from './menuData';

export default function PromoDelDia() {
  if (!PROMO_DEL_DIA) return null;

  return (
    <div className="promo-wrap">

      {/* Encabezado */}
      <div className="promo-section-header">
        <span className="promo-pill">🔥 Promo del día</span>
        <span className="promo-local-tag">· Consumo en local</span>
      </div>

      {/* Card tall */}
      <div className="promo-card">
        <div className="promo-img-wrap">
          {PROMO_DEL_DIA.imageUrl
            ? <img src={PROMO_DEL_DIA.imageUrl} alt={PROMO_DEL_DIA.name} className="promo-img" />
            : <div className="promo-img-placeholder" />
          }
          <div className="promo-img-grad" />
        </div>

        <div className="promo-info">
          <span className="promo-name">{PROMO_DEL_DIA.name}</span>
          {PROMO_DEL_DIA.desc && (
            <span className="promo-desc">{PROMO_DEL_DIA.desc}</span>
          )}
          <div className="promo-bottom">
            <span className="promo-price">{PROMO_DEL_DIA.price}</span>
            <span className="promo-solo-hoy">Solo hoy</span>
          </div>
        </div>
      </div>

    </div>
  );
}
