// ============================================================
//  SugerenciasDelDia.jsx
//  Se muestra arriba de la carta cuando SUGERENCIAS.length > 0
// ============================================================
import { useRef, useState } from 'react';
import { SUGERENCIAS } from './menuData';

export default function SugerenciasDelDia() {
  if (!SUGERENCIAS || SUGERENCIAS.length === 0) return null;

  return (
    <div className="sug-wrap">
      <div className="sug-header">
        <span className="sug-eyebrow">✦ Sugerencias del día</span>
      </div>
      <div className="sug-track">
        {SUGERENCIAS.map((item, i) => (
          <SugCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function SugCard({ item }) {
  return (
    <div className="sug-card">
      <div className="sug-img-wrap">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} className="sug-img" />
          : <div className="sug-img-placeholder" />
        }
        {item.badge && <span className="sug-badge">{item.badge}</span>}
      </div>
      <div className="sug-info">
        <span className="sug-name">{item.name}</span>
        <span className="sug-price">{item.price}</span>
      </div>
    </div>
  );
}
