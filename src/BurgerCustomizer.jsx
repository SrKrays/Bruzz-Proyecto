import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MEDALLON_EXTRA_PRECIO, MEDALLON_OPCIONES, EXTRAS, DIPS,
} from './burgerConfig';
import LiveBurger, { emojiOf } from './LiveBurger';
import { launchConfetti } from './confettiCheckout';

function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

const buzz = (ms = 12) => {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch { /* noop */ }
};

const STEPS = [
  { key: 'receta',     label: 'Tu hamburguesa', short: 'Receta' },
  { key: 'medallones', label: 'Medallones',     short: 'Carne' },
  { key: 'extras',     label: 'Extras',         short: 'Extras' },
  { key: 'dips',       label: 'Salsas y dips',  short: 'Dips' },
];

// ── Precio que "rueda" al cambiar ────────────────────────────
function RollPrice({ value, className = '' }) {
  return (
    <span className={`bw-roll ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="bw-roll-inner"
          initial={{ y: 18, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -18, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
        >
          {formatARS(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ── Control de cantidad +/− ──────────────────────────────────
function Stepper({ value, onMinus, onPlus, label }) {
  return (
    <div className="bw-stepper">
      <AnimatePresence initial={false}>
        {value > 0 && (
          <motion.div
            className="bw-stepper-left"
            initial={{ opacity: 0, width: 0, scale: 0.5 }}
            animate={{ opacity: 1, width: 'auto', scale: 1 }}
            exit={{ opacity: 0, width: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          >
            <button type="button" className="bw-step-btn" onClick={onMinus} aria-label={`Quitar ${label}`}>−</button>
            <motion.span
              key={value}
              className="bw-step-val"
              initial={{ scale: 1.9, color: '#fff' }}
              animate={{ scale: 1, color: '#f5c842' }}
              transition={{ type: 'spring', stiffness: 500, damping: 16 }}
            >
              {value}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button" className="bw-step-btn bw-step-btn--add"
        whileTap={{ scale: 0.8, rotate: 90 }} onClick={onPlus} aria-label={`Sumar ${label}`}
      >
        +
      </motion.button>
    </div>
  );
}

// ── Mini pila de medallones (para las tarjetas del paso 2) ───
function MiniPatties({ n }) {
  return (
    <span className="bw-mini">
      {Array.from({ length: n }).map((_, i) => <span key={i} className="bw-mini-patty" />)}
    </span>
  );
}

/**
 * Personalizador de hamburguesas — wizard inmersivo.
 * Props:
 *   name        → nombre de la hamburguesa
 *   basePrice   → precio base (número)
 *   config      → { ingredientes: string[] }
 *   onChange    → ({ extrasTotal, lines }) cada vez que cambia algo
 */
export default function BurgerCustomizer({ name, basePrice, config, onChange }) {
  const reduce = useReducedMotion();
  const [open, setOpen]           = useState(false);
  const [step, setStep]           = useState(0);
  const [dir, setDir]             = useState(1);
  const [quitados, setQuitados]   = useState([]);
  const [medallones, setMedallones] = useState(1);
  const [extras, setExtras]       = useState({});
  const [dips, setDips]           = useState({});
  const [bounceKey, setBounceKey] = useState(0);
  const [bursts, setBursts]       = useState([]);

  const bump = useCallback(() => setBounceKey((k) => k + 1), []);

  const spawnBurst = useCallback((emoji) => {
    if (reduce) return;
    const id = Date.now() + Math.random();
    const parts = Array.from({ length: 7 }).map((_, i) => ({
      id: `${id}-${i}`, emoji,
      dx: (Math.random() - 0.5) * 240,
      dy: 240 + Math.random() * 120,
      rot: (Math.random() - 0.5) * 220,
      delay: i * 0.03,
    }));
    setBursts((b) => [...b, ...parts]);
    setTimeout(() => setBursts((b) => b.filter((p) => !parts.some((q) => q.id === p.id))), 1300);
  }, [reduce]);

  const toggleIngrediente = (ing) => {
    setQuitados((q) => (q.includes(ing) ? q.filter((x) => x !== ing) : [...q, ing]));
    bump(); buzz(10);
  };
  const changeQty = (setter, emoji) => (id, delta) => {
    setter((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[id]; else copy[id] = next;
      return copy;
    });
    if (delta > 0) spawnBurst(emoji);
    bump(); buzz(delta > 0 ? 14 : 8);
  };
  const changeExtra = (id, d) => changeQty(setExtras, EXTRAS.find((e) => e.id === id)?.icon || '🍔')(id, d);
  const changeDip   = (id, d) => changeQty(setDips,   DIPS.find((e) => e.id === id)?.icon || '🥣')(id, d);

  const pickMedallones = (total) => {
    if (total === medallones) return;
    setMedallones(total);
    if (total > medallones) spawnBurst('🍔');
    bump(); buzz(18);
  };

  // ── Cálculo de precio y líneas para el pedido ─────────────
  const { extrasTotal, lines, medallonesExtra } = useMemo(() => {
    const medExtra = Math.max(0, medallones - 1);
    let total = medExtra * MEDALLON_EXTRA_PRECIO;
    const out = [];

    if (medallones > 1) out.push(`${medallones} medallones de carne (+${medExtra} extra)`);
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

  // ── Wizard: abrir / cerrar / navegar ──────────────────────
  const openWizard = () => { setStep(0); setDir(1); setOpen(true); buzz(15); };
  const closeWizard = useCallback(() => setOpen(false), []);
  const goTo = (n) => { if (n === step) return; setDir(n > step ? 1 : -1); setStep(n); buzz(8); };
  const next = () => {
    if (step < STEPS.length - 1) { goTo(step + 1); return; }
    launchConfetti(); buzz(35); setOpen(false);
  };

  // Bloquear scroll del fondo + cerrar con ESC
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') closeWizard(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, closeWizard]);

  const stepVariants = {
    enter:  (d) => ({ x: d > 0 ? 70 : -70, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? -70 : 70, opacity: 0 }),
  };

  // ── Contenido de cada paso ────────────────────────────────
  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          <p className="bw-step-intro">Estos ingredientes vienen incluidos. <b>Tocá los que no querés</b> y salen de tu hamburguesa.</p>
          <div className="bw-tiles">
            {config.ingredientes.map((ing, i) => {
              const off = quitados.includes(ing);
              return (
                <motion.button
                  type="button" key={ing}
                  className={`bw-tile${off ? ' bw-tile--off' : ''}`}
                  onClick={() => toggleIngrediente(ing)}
                  aria-pressed={!off}
                  initial={{ opacity: 0, y: 18, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 380, damping: 22 }}
                  whileTap={{ scale: 0.9, rotate: off ? 0 : -3 }}
                >
                  <span className="bw-tile-emoji">{emojiOf(ing)}</span>
                  <span className="bw-tile-name">{ing}</span>
                  <motion.span
                    className="bw-tile-badge"
                    key={off ? 'off' : 'on'}
                    initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                  >
                    {off ? '✕' : '✓'}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
          <p className="bw-hint">Los ingredientes que quitás no se cobran ni se descuentan.</p>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <p className="bw-step-intro">Elegí cuántos medallones de carne querés. <b>Cada uno extra suma {formatARS(MEDALLON_EXTRA_PRECIO)}.</b></p>
          <div className="bw-meds">
            {MEDALLON_OPCIONES.map((o, i) => {
              const active = medallones === o.total;
              const extra = (o.total - 1) * MEDALLON_EXTRA_PRECIO;
              return (
                <motion.button
                  type="button" key={o.total}
                  className={`bw-med${active ? ' bw-med--active' : ''}`}
                  onClick={() => pickMedallones(o.total)}
                  aria-pressed={active}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, type: 'spring', stiffness: 360, damping: 24 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {active && <motion.span layoutId="bw-med-glow" className="bw-med-glow" transition={{ type: 'spring', stiffness: 420, damping: 30 }} />}
                  <MiniPatties n={o.total} />
                  <span className="bw-med-text">
                    <span className="bw-med-name">{o.name}</span>
                    <span className="bw-med-desc">{o.desc}</span>
                  </span>
                  <span className="bw-med-price">{extra > 0 ? `+${formatARS(extra)}` : 'Incluido'}</span>
                </motion.button>
              );
            })}
          </div>
        </>
      );
    }

    const list = step === 2 ? EXTRAS : DIPS;
    const values = step === 2 ? extras : dips;
    const change = step === 2 ? changeExtra : changeDip;
    return (
      <>
        <p className="bw-step-intro">
          {step === 2
            ? <>Sumá lo que quieras. <b>No hay límite de cantidad.</b></>
            : <>Agregá un dip o salsa extra. <b>Es opcional.</b></>}
        </p>
        <div className="bw-cards">
          {list.map((e, i) => {
            const n = values[e.id] || 0;
            return (
              <motion.div
                key={e.id}
                className={`bw-card${n ? ' bw-card--active' : ''}`}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 360, damping: 24 }}
              >
                <motion.span
                  className="bw-card-emoji"
                  animate={n ? { rotate: [0, -12, 12, 0], scale: [1, 1.25, 1] } : { rotate: 0, scale: 1 }}
                  transition={{ duration: 0.45 }}
                  key={n}
                >
                  {e.icon}
                </motion.span>
                <span className="bw-card-text">
                  <span className="bw-card-name">{e.name}</span>
                  <span className="bw-card-desc">{e.desc}</span>
                  <span className="bw-card-price">+{formatARS(e.precio)} c/u</span>
                </span>
                <Stepper
                  value={n} label={e.name}
                  onMinus={() => change(e.id, -1)} onPlus={() => change(e.id, 1)}
                />
              </motion.div>
            );
          })}
        </div>

        {step === 3 && (
          <motion.div className="bw-recap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bw-recap-title">Tu pedido</div>
            <ul className="bw-recap-list">
              <li>🍔 {name} · {medallones === 1 ? 'Simple' : medallones === 2 ? 'Doble' : 'Triple'}</li>
              <AnimatePresence initial={false}>
                {lines.filter((l) => !/medallones de carne/.test(l)).map((l) => (
                  <motion.li
                    key={l}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  >
                    {l.startsWith('Sin ') ? '🚫' : '➕'} {l}
                  </motion.li>
                ))}
              </AnimatePresence>
              {lines.length === 0 && <li className="bw-recap-empty">Tal cual la receta original ✨</li>}
            </ul>
          </motion.div>
        )}
      </>
    );
  };

  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* ── Botón que abre el personalizador ── */}
      <div className="bl-wrap">
        <motion.button
          type="button" className="bl-btn" onClick={openWizard}
          whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.015 }}
        >
          <span className="bl-shine" />
          <span className="bl-emoji">🍔</span>
          <span className="bl-text">
            <span className="bl-title">Personalizá tu hamburguesa</span>
            <span className="bl-sub">Quitá ingredientes · medallones · extras · dips</span>
          </span>
          <span className="bl-cta">{lines.length ? 'Editar' : 'Armar'} <span>→</span></span>
        </motion.button>

        <AnimatePresence initial={false}>
          {lines.length > 0 && (
            <motion.div
              className="bl-summary"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            >
              <div className="bl-chips">
                {lines.map((l) => <span key={l} className="bl-chip">{l}</span>)}
              </div>
              <div className="bl-total">
                <span>Total por unidad</span>
                <RollPrice value={totalUnidad} className="bl-total-val" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Wizard a pantalla completa ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="bw-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <motion.div
                className="bw-shell" role="dialog" aria-modal="true" aria-label={`Personalizá tu ${name}`}
                initial={{ y: 80, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 80, scale: 0.97, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                {/* Header */}
                <header className="bw-header">
                  <div className="bw-title">
                    <span className="bw-title-small">Personalizá tu</span>
                    <span className="bw-title-name">{name}</span>
                  </div>
                  <button type="button" className="bw-close" onClick={closeWizard} aria-label="Cerrar">✕</button>
                </header>

                {/* Progreso */}
                <div className="bw-progress">
                  <div className="bw-segments">
                    {STEPS.map((s, i) => (
                      <button type="button" key={s.key} className="bw-seg" onClick={() => goTo(i)} aria-label={`Ir al paso ${i + 1}: ${s.label}`}>
                        <motion.span
                          className="bw-seg-fill"
                          initial={false}
                          animate={{ scaleX: i <= step ? 1 : 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="bw-step-label">
                    <span className="bw-step-num">Paso {step + 1} de {STEPS.length}</span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={step} className="bw-step-name"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16 }}
                      >
                        {STEPS[step].label}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Cuerpo: escenario + panel */}
                <div className="bw-body">
                  <div className="bw-stage-col">
                    <LiveBurger
                      ingredientes={config.ingredientes}
                      quitados={quitados}
                      medallones={medallones}
                      extras={extras}
                      dips={dips}
                      bounceKey={bounceKey}
                    />
                  </div>

                  <div className="bw-panel-col">
                    <AnimatePresence mode="wait" custom={dir} initial={false}>
                      <motion.div
                        key={step} custom={dir} variants={stepVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ type: 'spring', stiffness: 340, damping: 32, duration: 0.2 }}
                        className="bw-step"
                      >
                        <h3 className="bw-step-heading"><span className="bw-step-n">{step + 1}.</span> {STEPS[step].label}</h3>
                        {renderStep()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer fijo */}
                <footer className="bw-footer">
                  <div className="bw-footer-price">
                    <span className="bw-footer-label">Total por unidad</span>
                    <RollPrice value={totalUnidad} className="bw-footer-val" />
                    <span className="bw-footer-sub">
                      {medallonesExtra || extrasTotal ? `Base ${formatARS(basePrice)} · +${formatARS(extrasTotal)}` : `Base ${formatARS(basePrice)}`}
                    </span>
                  </div>
                  {step > 0 && (
                    <button type="button" className="bw-btn-back" onClick={() => goTo(step - 1)}>←</button>
                  )}
                  <motion.button type="button" className="bw-btn-next" onClick={next} whileTap={{ scale: 0.95 }}>
                    <span className="bw-btn-shine" />
                    {isLast ? 'Listo ✓' : 'Siguiente →'}
                  </motion.button>
                </footer>

                {/* Partículas al sumar cosas */}
                <div className="bw-burst" aria-hidden="true">
                  {bursts.map((p) => (
                    <motion.span
                      key={p.id} className="bw-burst-p"
                      initial={{ y: 0, x: 0, opacity: 0, scale: 0.4, rotate: 0 }}
                      animate={{ y: -p.dy, x: p.dx, opacity: [0, 1, 1, 0], scale: [0.4, 1.4, 1, 0.7], rotate: p.rot }}
                      transition={{ duration: 1.05, delay: p.delay, ease: 'easeOut' }}
                    >
                      {p.emoji}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
