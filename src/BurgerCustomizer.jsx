import { useState, useEffect, useMemo } from 'react';
import {
  MEDALLON_EXTRA_PRECIO, MEDALLON_OPCIONES, EXTRAS, DIPS,
} from './burgerConfig';

function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

// ── Sección expandible ───────────────────────────────────────
function Section({ icon, title, subtitle, open, onToggle, badge, children }) {
  return (
    <div className={`bc-section${open ? ' bc-section--open' : ''}`}>
      <button type="button" className="bc-section-head" onClick={onToggle} aria-expanded={open}>
        <span className="bc-section-icon">{icon}</span>
        <span className="bc-section-text">
          <span className="bc-section-title">{title}</span>
          <span className="bc-section-sub">{subtitle}</span>
        </span>
        {badge ? <span className="bc-section-badge">{badge}</span> : null}
        <span className="bc-section-chevron">›</span>
      </button>
      {open && <div className="bc-section-body">{children}</div>}
    </div>
  );
}

// ── Control de cantidad +/− ──────────────────────────────────
function Stepper({ value, onMinus, onPlus, label }) {
  return (
    <div className="bc-stepper">
      {value > 0 && (
        <>
          <button type="button" className="bc-step-btn" onClick={onMinus} aria-label={`Quitar ${label}`}>−</button>
          <span className="bc-step-val" key={value}>{value}</span>
        </>
      )}
      <button type="button" className="bc-step-btn bc-step-btn--add" onClick={onPlus} aria-label={`Sumar ${label}`}>+</button>
    </div>
  );
}

/**
 * Configurador de hamburguesa.
 * Props:
 *   basePrice   → precio base (número)
 *   config      → { ingredientes: string[] } de BURGER_CONFIG
 *   onChange    → ({ extrasTotal, lines }) cada vez que cambia algo
 */
export default function BurgerCustomizer({ basePrice, config, onChange }) {
  const [open, setOpen]         = useState({ receta: true, medallones: false, extras: false, dips: false });
  const [quitados, setQuitados] = useState([]);          // ingredientes removidos
  const [medallones, setMedallones] = useState(1);       // total de carnes
  const [extras, setExtras]     = useState({});          // { id: cantidad }
  const [dips, setDips]         = useState({});          // { id: cantidad }

  const toggleOpen = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const toggleIngrediente = (ing) =>
    setQuitados((q) => (q.includes(ing) ? q.filter((x) => x !== ing) : [...q, ing]));
  const changeQty = (setter) => (id, delta) =>
    setter((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[id]; else copy[id] = next;
      return copy;
    });
  const changeExtra = changeQty(setExtras);
  const changeDip   = changeQty(setDips);

  // ── Cálculo de precio y líneas para el pedido ─────────────
  const { extrasTotal, lines, medallonesExtra } = useMemo(() => {
    const medExtra = Math.max(0, medallones - 1);
    let total = medExtra * MEDALLON_EXTRA_PRECIO;
    const out = [];

    if (medallones > 1) {
      out.push(`${medallones} medallones de carne (+${medExtra} extra)`);
    }
    quitados.forEach((ing) => out.push(`Sin ${ing.toLowerCase()}`));
    EXTRAS.forEach((e) => {
      const n = extras[e.id] || 0;
      if (n > 0) { total += n * e.precio; out.push(`${e.name} x${n}`); }
    });
    DIPS.forEach((d) => {
      const n = dips[d.id] || 0;
      if (n > 0) { total += n * d.precio; out.push(`${d.name} x${n}`); }
    });

    return { extrasTotal: total, lines: out, medallonesExtra: medExtra };
  }, [medallones, quitados, extras, dips]);

  useEffect(() => { onChange({ extrasTotal, lines }); }, [extrasTotal, lines]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalUnidad = basePrice + extrasTotal;

  return (
    <div className="bc-wrap">
      <div className="bc-head">
        <span className="bc-head-title">Personalizá tu Bruzz</span>
        <span className="bc-head-sub">Hacé que sea exactamente como te gusta.</span>
      </div>

      {/* 01 · Receta original */}
      <Section
        icon="✅" title="Tu receta original" subtitle="Ingredientes incluidos y opción de quitarlos."
        open={open.receta} onToggle={() => toggleOpen('receta')}
        badge={quitados.length ? `${quitados.length} sin` : ''}
      >
        <div className="bc-chips">
          {config.ingredientes.map((ing) => {
            const off = quitados.includes(ing);
            return (
              <button
                type="button" key={ing}
                className={`bc-chip${off ? ' bc-chip--off' : ''}`}
                onClick={() => toggleIngrediente(ing)}
                aria-pressed={!off}
              >
                <span className="bc-chip-mark">{off ? '✕' : '✓'}</span>
                {ing}
              </button>
            );
          })}
        </div>
        <p className="bc-hint">Tocá un ingrediente para quitarlo. Los que quitás no se cobran ni se descuentan.</p>
      </Section>

      {/* 02 · Medallones */}
      <Section
        icon="🍔" title="Sumá medallones" subtitle="Simple, doble o triple, con precio actualizado."
        open={open.medallones} onToggle={() => toggleOpen('medallones')}
        badge={medallonesExtra ? `+${formatARS(medallonesExtra * MEDALLON_EXTRA_PRECIO)}` : ''}
      >
        <div className="bc-medallones">
          {MEDALLON_OPCIONES.map((o) => {
            const active = medallones === o.total;
            const extra = (o.total - 1) * MEDALLON_EXTRA_PRECIO;
            return (
              <button
                type="button" key={o.total}
                className={`bc-med${active ? ' bc-med--active' : ''}`}
                onClick={() => setMedallones(o.total)}
                aria-pressed={active}
              >
                <span className="bc-med-name">{o.name}</span>
                <span className="bc-med-desc">{o.desc}</span>
                <span className="bc-med-price">{extra > 0 ? `+${formatARS(extra)}` : 'Incluido'}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 03 · Extras */}
      <Section
        icon="➕" title="Extras e ingredientes" subtitle="Cheddar, panceta, huevo y cantidades."
        open={open.extras} onToggle={() => toggleOpen('extras')}
      >
        <div className="bc-cards">
          {EXTRAS.map((e) => (
            <div key={e.id} className={`bc-card${extras[e.id] ? ' bc-card--active' : ''}`}>
              <span className="bc-card-icon">{e.icon}</span>
              <span className="bc-card-text">
                <span className="bc-card-name">{e.name}</span>
                <span className="bc-card-desc">{e.desc}</span>
              </span>
              <span className="bc-card-price">+{formatARS(e.precio)}</span>
              <Stepper
                value={extras[e.id] || 0} label={e.name}
                onMinus={() => changeExtra(e.id, -1)} onPlus={() => changeExtra(e.id, 1)}
              />
            </div>
          ))}
        </div>
        <p className="bc-hint">Las verduras (lechuga, tomate, cebolla) no se ofrecen como extras pagos.</p>
      </Section>

      {/* 04 · Salsas y dips */}
      <Section
        icon="🥣" title="Salsas y dips" subtitle="Agregados opcionales."
        open={open.dips} onToggle={() => toggleOpen('dips')}
      >
        <div className="bc-cards">
          {DIPS.map((d) => (
            <div key={d.id} className={`bc-card${dips[d.id] ? ' bc-card--active' : ''}`}>
              <span className="bc-card-icon">{d.icon}</span>
              <span className="bc-card-text">
                <span className="bc-card-name">{d.name}</span>
                <span className="bc-card-desc">{d.desc}</span>
              </span>
              <span className="bc-card-price">+{formatARS(d.precio)}</span>
              <Stepper
                value={dips[d.id] || 0} label={d.name}
                onMinus={() => changeDip(d.id, -1)} onPlus={() => changeDip(d.id, 1)}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Resumen de precio */}
      <div className="bc-summary">
        <div className="bc-sum-row"><span>Precio de la hamburguesa</span><span>{formatARS(basePrice)}</span></div>
        <div className="bc-sum-row">
          <span>Extras y modificaciones</span>
          <span>+{formatARS(extrasTotal)}</span>
        </div>
        <div className="bc-sum-total">
          <span>Total por unidad</span>
          <span className="bc-sum-total-val" key={totalUnidad}>{formatARS(totalUnidad)}</span>
        </div>
      </div>
    </div>
  );
}
