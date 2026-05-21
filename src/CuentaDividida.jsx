// ============================================================
//  CuentaDividida.jsx
//  Flujo: categorías → subcategorías → items → ticket personal
// ============================================================

import { useState, useMemo } from 'react';
import {
  CATEGORIAS, SUBCATEGORIAS, MENU, POSTRES, CAFETERIA,
} from './menuData';

// ── helpers ──────────────────────────────────────────────────
function parsePrice(str) {
  return parseFloat((str || '0').replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}
function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

// ── Todos los items del menú aplanados (para reutilizar) ──────
function getAllItems() {
  const all = [];
  // MENU (pizza, calzone, hamburgesas, lomitos, sandwich, papas, sinAlcohol, cervezas, vinos, tragos)
  Object.values(MENU).forEach(sec => {
    (sec.items || []).forEach(it => { if (!it.sep) all.push(it); });
  });
  POSTRES.forEach(it => { if (!it.sep) all.push(it); });
  CAFETERIA.forEach(it => { if (!it.sep) all.push(it); });
  return all;
}

// ── Items de una menuKey específica ──────────────────────────
function getItemsForKey(menuKey) {
  if (menuKey === 'postres')   return POSTRES.filter(i => !i.sep);
  if (menuKey === 'cafeteria') return CAFETERIA.filter(i => !i.sep);
  return (MENU[menuKey]?.items || []).filter(i => !i.sep);
}

// ════════════════════════════════════════════════════════════
//  Icono dividir
// ════════════════════════════════════════════════════════════
export function SplitBillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5"/>
      <rect x="13" y="3" width="8" height="8" rx="1.5"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5"/>
      <path d="M13 17h8M17 13v8"/>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
//  PANEL PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function CuentaDividida({ onClose }) {
  // step: 'cat' | 'subcat' | 'items' | 'ticket'
  const [step, setStep]         = useState('cat');
  const [catId, setCatId]       = useState(null);   // id de CATEGORIAS
  const [menuKey, setMenuKey]   = useState(null);   // clave de MENU
  const [seleccion, setSeleccion] = useState([]);   // [{ _key, name, price, qty }]

  // Agrega / suma 1 unidad
  function agregar(item) {
    const key = item.name;
    setSeleccion(prev => {
      const existe = prev.find(s => s._key === key);
      if (existe) return prev.map(s => s._key === key ? { ...s, qty: s.qty + 1 } : s);
      return [...prev, { _key: key, name: item.name, price: item.price, qty: 1 }];
    });
  }

  // Resta 1 / elimina
  function quitar(key) {
    setSeleccion(prev =>
      prev.map(s => s._key === key ? { ...s, qty: s.qty - 1 } : s)
          .filter(s => s.qty > 0)
    );
  }

  // cantidad de un item en selección
  function qty(name) {
    return seleccion.find(s => s._key === name)?.qty || 0;
  }

  const total = seleccion.reduce((acc, s) => acc + parsePrice(s.price) * s.qty, 0);
  const totalItems = seleccion.reduce((acc, s) => acc + s.qty, 0);

  // ── Categorías que aplican a "dividir cuenta" ─────────────
  // (todas: el cliente elige de cualquier sección)
  const CATS_CON_SUBCAT = new Set(['comidas', 'bebidas']);

  // ── Navegación hacia atrás ────────────────────────────────
  function goBack() {
    if (step === 'cat')    { onClose(); return; }
    if (step === 'subcat') { setStep('cat'); setCatId(null); return; }
    if (step === 'items')  {
      if (CATS_CON_SUBCAT.has(catId)) { setStep('subcat'); }
      else { setStep('cat'); }
      setMenuKey(null);
      return;
    }
    if (step === 'ticket') { setStep('cat'); return; }
  }

  // ── Titulo del panel según step ───────────────────────────
  const panelTitle = {
    cat:    'Mi consumo',
    subcat: CATEGORIAS.find(c => c.id === catId)?.name || '',
    items:  MENU[menuKey]?.title || (menuKey === 'postres' ? 'Postres' : menuKey === 'cafeteria' ? 'Cafetería' : ''),
    ticket: 'Mi cuenta',
  }[step];

  return (
    <>
      <div className="split-backdrop" onClick={onClose} />
      <div className="split-panel">

        {/* ── Header ── */}
        <div className="split-header">
          <button className="split-back-btn" onClick={goBack} aria-label="Volver">
            {step === 'cat' ? '✕' : '←'}
          </button>
          <span className="split-title">{panelTitle}</span>
          {/* Chip de selección */}
          {totalItems > 0 && step !== 'ticket' && (
            <button className="split-chip" onClick={() => setStep('ticket')}>
              {totalItems} · {formatARS(total)}
            </button>
          )}
          {(totalItems === 0 || step === 'ticket') && (
            <span style={{ width: 60 }} />
          )}
        </div>

        {/* ── Contenido según step ── */}
        <div className="split-inner">

          {/* STEP: categorías */}
          {step === 'cat' && (
            <StepCategorias
              onSelect={(cat) => {
                setCatId(cat.id);
                if (CATS_CON_SUBCAT.has(cat.id)) {
                  setStep('subcat');
                } else {
                  // postres / cafeteria / tragos → directo a items
                  setMenuKey(cat.id === 'postres' ? 'postres' : cat.id === 'cafeteria' ? 'cafeteria' : 'tragos');
                  setStep('items');
                }
              }}
              seleccion={seleccion}
            />
          )}

          {/* STEP: subcategorías */}
          {step === 'subcat' && (
            <StepSubcats
              catId={catId}
              onSelect={(key) => { setMenuKey(key); setStep('items'); }}
            />
          )}

          {/* STEP: items */}
          {step === 'items' && (
            <StepItems
              menuKey={menuKey}
              qty={qty}
              onAgregar={agregar}
              onQuitar={quitar}
            />
          )}

          {/* STEP: ticket */}
          {step === 'ticket' && (
            <StepTicket
              seleccion={seleccion}
              total={total}
              onAgregar={() => setStep('cat')}
              onReset={() => { setSeleccion([]); setStep('cat'); }}
              qty={qty}
              onQuitar={quitar}
            />
          )}

        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  STEP 1 — Categorías
// ════════════════════════════════════════════════════════════
function StepCategorias({ onSelect, seleccion }) {
  // Muestra cuántos items de cada cat están en selección (visual nice-to-have)
  return (
    <div className="split-cat-grid">
      {CATEGORIAS.map(cat => (
        <button key={cat.id} className="split-cat-card" onClick={() => onSelect(cat)}>
          {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="split-cat-img" />}
          <div className="split-cat-overlay" />
          <span className="split-cat-name">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  STEP 2 — Subcategorías
// ════════════════════════════════════════════════════════════
function StepSubcats({ catId, onSelect }) {
  const subcats = SUBCATEGORIAS[catId] || [];
  return (
    <div className="split-subcat-list">
      {subcats.map(sub => (
        <button key={sub.menuKey} className="split-subcat-row" onClick={() => onSelect(sub.menuKey)}>
          {sub.imageUrl && <img src={sub.imageUrl} alt={sub.name} className="split-subcat-thumb" />}
          <div className="split-subcat-info">
            <span className="split-subcat-name">{sub.name}</span>
            <span className="split-subcat-desc">{sub.desc}</span>
          </div>
          <span className="split-subcat-arrow">›</span>
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  STEP 3 — Items seleccionables
// ════════════════════════════════════════════════════════════
function StepItems({ menuKey, qty, onAgregar, onQuitar }) {
  const rawItems = useMemo(() => {
    if (menuKey === 'postres')   return POSTRES;
    if (menuKey === 'cafeteria') return CAFETERIA;
    return MENU[menuKey]?.items || [];
  }, [menuKey]);

  return (
    <div className="split-items-list">
      {rawItems.map((item, i) => {
        if (item.sep) {
          return <p key={`sep-${i}`} className="split-sep">{item.sep}</p>;
        }
        const count = qty(item.name);
        return (
          <div key={item.name} className={`split-item-row${count > 0 ? ' split-item-row--active' : ''}`}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="split-item-thumb" />
            )}
            <div className="split-item-info">
              <span className="split-item-name">{item.name}</span>
              <span className="split-item-price">{item.price}</span>
            </div>
            <div className="split-item-controls">
              {count > 0 && (
                <>
                  <button className="split-ctrl split-ctrl--minus" onClick={() => onQuitar(item.name)} aria-label="Quitar">−</button>
                  <span className="split-ctrl-qty">{count}</span>
                </>
              )}
              <button className="split-ctrl split-ctrl--plus" onClick={() => onAgregar(item)} aria-label="Agregar">+</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  STEP 4 — Ticket personal
// ════════════════════════════════════════════════════════════
function StepTicket({ seleccion, total, onAgregar, onReset, onQuitar }) {
  return (
    <div className="split-ticket">

      {/* Encabezado tipo ticket */}
      <div className="split-ticket-header">
        <span className="split-ticket-brand">BRUZZ</span>
        <span className="split-ticket-sub">Pizza & Beer · Carta Digital</span>
        <div className="split-ticket-divider" />
      </div>

      {seleccion.length === 0 ? (
        <p className="split-ticket-empty">No hay items en tu cuenta todavía.</p>
      ) : (
        <>
          <ul className="split-ticket-list">
            {seleccion.map(item => (
              <li key={item._key} className="split-ticket-item">
                <span className="split-ticket-qty">{item.qty}×</span>
                <span className="split-ticket-name">{item.name}</span>
                <span className="split-ticket-price">{formatARS(parsePrice(item.price) * item.qty)}</span>
              </li>
            ))}
          </ul>

          <div className="split-ticket-total-row">
            <div className="split-ticket-divider" />
            <div className="split-ticket-total">
              <span>Total a pagar</span>
              <span className="split-ticket-total-price">{formatARS(total)}</span>
            </div>
          </div>
        </>
      )}

      {/* Acciones */}
      <div className="split-ticket-actions">
        <button className="split-ticket-add-btn" onClick={onAgregar}>
          + Agregar más items
        </button>
        <button className="split-ticket-reset-btn" onClick={onReset}>
          Empezar de cero
        </button>
      </div>

    </div>
  );
}
