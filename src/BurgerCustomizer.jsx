import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EXTRAS, DIPS } from './burgerConfig';
import LiveBurger, { emojiOf, typesForIngredient, buildLayers } from './LiveBurger';
import { launchConfetti } from './confettiCheckout';

function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

const buzz = (ms = 12) => {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch { /* noop */ }
};

const NO_DIPS = [];
const KIND_TEXT = {
  burger:   { tab: 'La burger',  title: 'La hamburguesa', small: 'Armá tu',    emoji: '🍔' },
  lomo:     { tab: 'El lomito',  title: 'El lomito',      small: 'Armá tu',    emoji: '🥩' },
  sandwich: { tab: 'El sanguche', title: 'El sándwich',   small: 'Armá tu',    emoji: '🥪' },
  papas:    { tab: 'Las papas',  title: 'Las papas',      small: 'Elegí tus',  emoji: '🍟' },
  pizza:    { tab: 'El plato',   title: 'El plato',       small: 'Mirá tu',    emoji: '🍕' },
};

// Arma las pestañas según lo que el producto permite personalizar
function buildSteps(config, hasPapas) {
  const k = KIND_TEXT[config.kind] || KIND_TEXT.burger;
  const steps = [{ key: 'info', label: k.tab, title: k.title, icon: '📖' }];
  if (config.ingredientes.length) steps.push({ key: 'receta', label: 'Receta', title: 'Tu receta', icon: '🥬' });
  if (config.carne) steps.push({ key: 'carne', label: config.carne.tab, title: config.carne.title, icon: config.carne.icon });
  if (config.extras.length) steps.push({ key: 'extras', label: 'Extras', title: 'Extras', icon: '➕' });
  if (config.dips) steps.push({ key: 'dips', label: 'Dips', title: 'Salsas y dips', icon: '🥣' });
  if (hasPapas) steps.push({ key: 'papas', label: 'Papas', title: 'Papas fritas', icon: '🍟' });
  return steps;
}

// ── Hero con foto (pizza, calzone, papas): sin capas, solo muestra ──
function ProductHero({ imageUrl, name, token, emoji, papas, dipCount, bounceKey }) {
  return (
    <div className="ph-stage">
      <div className="lb-glow" />
      <motion.div
        key={bounceKey}
        className="ph-photo-wrap"
        initial={{ scale: 0.9, rotate: -4, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
      >
        {imageUrl ? <img className="ph-photo" src={imageUrl} alt={name} /> : <span className="ph-fallback">{emoji}</span>}
        <AnimatePresence mode="wait">
          {token && (
            <motion.span
              key={token.label}
              className="ph-pop"
              initial={{ opacity: 0, scale: 0.3, y: 30, rotate: -25 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.4, y: -30 }}
              transition={{ type: 'spring', stiffness: 360, damping: 16 }}
            >
              <span className="ph-pop-emoji">{token.emoji}</span>
              <span className="ph-pop-label">{token.label}</span>
            </motion.span>
          )}
        </AnimatePresence>
        {papas === 'sazonadas' && <span className="ph-tag ph-tag--hot">🧡 Sazonadas</span>}
        {dipCount > 0 && <span className="ph-tag ph-tag--dip">🥣 x{dipCount}</span>}
      </motion.div>
    </div>
  );
}

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

// ── Mini pila de medallones (para las tarjetas de carne) ─────
function MiniPatties({ n }) {
  return (
    <span className="bw-mini">
      {Array.from({ length: n }).map((_, i) => <span key={i} className="bw-mini-patty" />)}
    </span>
  );
}

/**
 * Panel de la hamburguesa — vista principal para ver y personalizar.
 * Props:
 *   name, desc, imageUrl, badge → datos del producto
 *   basePrice     → precio base (número)
 *   config        → { ingredientes: string[] }
 *   qty / onQtyChange   → cantidad
 *   note / onNoteChange → observaciones
 *   open / onClose / onConfirm
 *   onChange      → ({ extrasTotal, lines }) cada vez que cambia algo
 *   papasOptions / papasStyle / onPapasChange → estilo de papas (suma una pestaña)
 *   resetKey      → al cambiar, vuelve todo a la receta original
 */
export default function BurgerCustomizer({
  name, desc, imageUrl, badge, basePrice, config,
  qty = 1, onQtyChange, note = '', onNoteChange,
  open, onClose, onConfirm, onChange,
  papasOptions, papasStyle, onPapasChange, resetKey = 0,
}) {
  const isPhoto = config.visual === 'photo';
  const kindText = KIND_TEXT[config.kind] || KIND_TEXT.burger;
  const steps = useMemo(() => buildSteps(config, !!papasOptions), [config, papasOptions]);
  const extrasList = useMemo(() => EXTRAS.filter((e) => config.extras.includes(e.id)), [config]);
  const dipsList = config.dips ? DIPS : NO_DIPS;
  const carne = config.carne;
  const mainType = config.main;
  // Sin proteína (p. ej. Tostato) no hay capa principal que contar
  const [step, setStep]           = useState(0);
  const [dir, setDir]             = useState(1);
  const [quitados, setQuitados]   = useState([]);
  const [medallones, setMedallones] = useState(1);
  const [extras, setExtras]       = useState({});
  const [dips, setDips]           = useState({});
  const [bounceKey, setBounceKey] = useState(0);
  const [bursts, setBursts]       = useState([]);

  // Exploración de ingredientes
  const [chipHl, setChipHl]       = useState(null);     // capas resaltadas por tap
  const [friesHl, setFriesHl]     = useState(false);
  const [tourOn, setTourOn]       = useState(false);
  const [tourIdx, setTourIdx]     = useState(-1);
  const [explodedManual, setExplodedManual] = useState(false);
  const [photoZoom, setPhotoZoom] = useState(false);
  const tourTimer = useRef(null);
  const hlTimer   = useRef(null);

  // ── Capas actuales (para el recorrido) ────────────────────
  const [heroPop, setHeroPop]   = useState(null);          // chip tocado (hero con foto)
  const layers = useMemo(
    () => (isPhoto ? [] : buildLayers({ ingredientes: config.ingredientes, quitados, medallones, extras, mainType })),
    [isPhoto, config.ingredientes, quitados, medallones, extras, mainType],
  );
  const tourTokens = useMemo(() => {
    if (isPhoto) return config.infoChips;
    const seen = [];
    layers.forEach((l) => { if (!seen.includes(l.type)) seen.push(l.type); });
    if (papasOptions) seen.push('fries');
    return seen;
  }, [isPhoto, config.infoChips, layers, papasOptions]);

  const stopTour = useCallback(() => {
    if (tourTimer.current) { clearInterval(tourTimer.current); tourTimer.current = null; }
    setTourOn(false); setTourIdx(-1);
  }, []);
  const startTour = useCallback(() => {
    if (tourTimer.current) clearInterval(tourTimer.current);
    setChipHl(null); setFriesHl(false);
    setTourOn(true); setTourIdx(0);
    let i = 0;
    tourTimer.current = setInterval(() => { i += 1; setTourIdx(i); }, 760);
  }, []);
  useEffect(() => {
    if (tourOn && tourIdx >= tourTokens.length) stopTour();
  }, [tourOn, tourIdx, tourTokens.length, stopTour]);

  const flashHighlight = useCallback((types, fries = false) => {
    stopTour();
    setChipHl(types); setFriesHl(fries);
    if (hlTimer.current) clearTimeout(hlTimer.current);
    hlTimer.current = setTimeout(() => { setChipHl(null); setFriesHl(false); setHeroPop(null); }, 1700);
  }, [stopTour]);
  const flashHero = useCallback((n) => {
    stopTour();
    setHeroPop(n);
    if (hlTimer.current) clearTimeout(hlTimer.current);
    hlTimer.current = setTimeout(() => setHeroPop(null), 1700);
  }, [stopTour]);

  const bump = useCallback(() => setBounceKey((k) => k + 1), []);

  const spawnBurst = useCallback((emoji) => {
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
  }, []);

  const toggleIngrediente = (ing) => {
    stopTour();
    setQuitados((q) => (q.includes(ing) ? q.filter((x) => x !== ing) : [...q, ing]));
    bump(); buzz(10);
  };
  const changeQty = (setter, emoji) => (id, delta) => {
    stopTour();
    setter((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[id]; else copy[id] = next;
      return copy;
    });
    if (delta > 0) spawnBurst(emoji);
    bump(); buzz(delta > 0 ? 14 : 8);
  };
  const changeExtra = (id, d) => changeQty(setExtras, EXTRAS.find((e) => e.id === id)?.icon || '➕')(id, d);
  const changeDip   = (id, d) => changeQty(setDips,   DIPS.find((e) => e.id === id)?.icon || '🥣')(id, d);

  const pickMedallones = (total) => {
    if (total === medallones) return;
    stopTour();
    setMedallones(total);
    if (total > medallones) spawnBurst(carne?.icon || '🍔');
    bump(); buzz(18);
  };
  const pickPapas = (id) => {
    if (id === papasStyle) return;
    stopTour();
    onPapasChange && onPapasChange(id);
    if (id === 'sazonadas') spawnBurst('🧡');
    bump(); buzz(16);
  };

  // ── Cálculo de precio y líneas para el pedido ─────────────
  const { extrasTotal, lines, medallonesExtra } = useMemo(() => {
    const medExtra = carne ? Math.max(0, medallones - 1) : 0;
    let total = carne ? medExtra * carne.extraPrecio : 0;
    const out = [];

    if (carne && medallones > 1) out.push(carne.line(medallones));
    quitados.forEach((ing) => out.push(`Sin ${ing.toLowerCase()}`));
    extrasList.forEach((e) => {
      const n = extras[e.id] || 0;
      if (n > 0) { total += n * e.precio; out.push(`${e.name} x${n}`); }
    });
    dipsList.forEach((d) => {
      const n = dips[d.id] || 0;
      if (n > 0) { total += n * d.precio; out.push(`${d.name} x${n}`); }
    });
    return { extrasTotal: total, lines: out, medallonesExtra: medExtra };
  }, [medallones, quitados, extras, dips, carne, extrasList, dipsList]);
  const carneLine = carne && medallones > 1 ? carne.line(medallones) : null;

  useEffect(() => { onChange({ extrasTotal, lines }); }, [extrasTotal, lines]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalUnidad = basePrice + extrasTotal;

  // ── Reset tras agregar al pedido ──────────────────────────
  useEffect(() => {
    setQuitados([]); setMedallones(1); setExtras({}); setDips({});
    setStep(0); setDir(1); setExplodedManual(false); setPhotoZoom(false); setHeroPop(null);
  }, [resetKey]);

  // ── Abrir: arranca en la pestaña de info + recorrido de ingredientes ──
  useEffect(() => {
    if (!open) {
      stopTour(); setChipHl(null); setFriesHl(false);
      return undefined;
    }
    setStep(0); setDir(1); buzz(15);
    const t = setTimeout(startTour, 650);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    if (tourTimer.current) clearInterval(tourTimer.current);
    if (hlTimer.current) clearTimeout(hlTimer.current);
  }, []);

  const closeWizard = useCallback(() => onClose && onClose(), [onClose]);
  const goTo = (n) => {
    if (n === step || n < 0 || n >= steps.length) return;
    stopTour();
    setDir(n > step ? 1 : -1); setStep(n); buzz(8);
  };
  const confirm = () => {
    stopTour();
    launchConfetti(); buzz(35);
    onConfirm && onConfirm();
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

  // ── Resaltado que le llega a la hamburguesa ───────────────
  const tokenNow = tourOn && tourIdx >= 0 && tourIdx < tourTokens.length ? tourTokens[tourIdx] : null;
  const highlight = !isPhoto && tokenNow && tokenNow !== 'fries' ? [tokenNow] : (tourOn ? null : chipHl);
  const friesHighlight = tokenNow === 'fries' || (!tourOn && friesHl);
  const exploded = tourOn || explodedManual;
  const heroToken = isPhoto
    ? (() => { const n = tourOn ? tokenNow : heroPop; return n ? { label: n, emoji: emojiOf(n) } : null; })()
    : null;
  const dipTotal = Object.values(dips).reduce((s, n) => s + n, 0);

  // Indicadores (punto) de pestañas con cambios
  const tabChanged = (key) => (
    key === 'receta' ? quitados.length > 0
    : key === 'carne' ? medallones > 1
    : key === 'extras' ? Object.keys(extras).length > 0
    : key === 'dips' ? Object.keys(dips).length > 0
    : key === 'papas' ? papasStyle === 'sazonadas'
    : false
  );

  const isLast = step === steps.length - 1;
  const stepKey = steps[step].key;
  const nextStep = steps[step + 1];

  // ── Resumen final ("Tu pedido") + observaciones ──────────
  const recap = (
    <>
      <motion.div className="bw-recap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bw-recap-title">Tu pedido{qty > 1 ? ` · ${qty} unidades iguales` : ''}</div>
        <ul className="bw-recap-list">
          <li>
            {kindText.emoji} {name}
            {carne ? ` · ${carne.options.find((o) => o.total === medallones)?.name || ''}` : ''}
          </li>
          <AnimatePresence initial={false}>
            {lines.filter((l) => l !== carneLine).map((l) => (
              <motion.li
                key={l}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              >
                {l.startsWith('Sin ') ? '🚫' : '➕'} {l}
              </motion.li>
            ))}
          </AnimatePresence>
          {papasOptions && <li>🍟 Papas {papasStyle === 'sazonadas' ? 'sazonadas 🧡' : 'clásicas'}</li>}
          {lines.length === 0 && !papasOptions && <li className="bw-recap-empty">Tal cual la receta original ✨</li>}
          {config.sides.map((s) => <li key={s.label}>{s.emoji} {s.label} incluido</li>)}
        </ul>
      </motion.div>
      <label className="bw-note">
        <span className="bw-note-label">Observaciones <em>{note.length} / 150</em></span>
        <textarea
          className="exp-textarea" rows={2} maxLength={150} value={note}
          placeholder="Alguna aclaración para tu pedido…"
          onChange={(e) => onNoteChange && onNoteChange(e.target.value)}
        />
      </label>
    </>
  );

  const nextInline = nextStep ? (
    <motion.button
      type="button" className="bw-next-inline" onClick={() => goTo(step + 1)} whileTap={{ scale: 0.96 }}
    >
      Siguiente: {nextStep.title} <span>→</span>
    </motion.button>
  ) : null;

  // ── Contenido de cada pestaña ─────────────────────────────
  const renderStep = () => {
    if (stepKey === 'info') {
      const chips = isPhoto
        ? config.infoChips.map((n) => ({ n, base: false }))
        : [
          ...config.base.map((n) => ({ n, base: true })),
          ...config.ingredientes.map((n) => ({ n, base: false })),
        ];
      const onChip = (n) => (isPhoto ? flashHero(n) : flashHighlight(typesForIngredient(n)));
      return (
        <>
          {badge && <span className="badge badge--pulse bw-info-badge">{badge}</span>}
          <p className="bw-info-desc">{desc}</p>

          <div className="bw-info-block">
            <div className="bw-info-sub">
              Ingredientes <em>· tocá uno para {isPhoto ? 'destacarlo' : 'verlo en el plato'}</em>
            </div>
            <div className="bw-ing-grid">
              {chips.map(({ n, base }, i) => {
                const off = quitados.includes(n);
                const live = isPhoto && (tourOn ? tokenNow : heroPop) === n;
                return (
                  <motion.button
                    type="button" key={n}
                    className={`bw-ing${off ? ' bw-ing--off' : ''}${live ? ' bw-ing--live' : ''}`}
                    onClick={() => onChip(n)}
                    initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 380, damping: 20 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="bw-ing-emoji">{emojiOf(n)}</span>
                    <span className="bw-ing-name">{n}</span>
                    {off && <span className="bw-ing-tag">sin</span>}
                    {base && !off && <span className="bw-ing-tag bw-ing-tag--base">base</span>}
                  </motion.button>
                );
              })}
              {config.sides.map((s, i) => (
                <motion.button
                  type="button" key={s.label} className="bw-ing"
                  onClick={() => flashHighlight(null)}
                  initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: (chips.length + i) * 0.04, type: 'spring', stiffness: 380, damping: 20 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="bw-ing-emoji">{s.emoji}</span>
                  <span className="bw-ing-name">{s.label}</span>
                  <span className="bw-ing-tag bw-ing-tag--base">incl.</span>
                </motion.button>
              ))}
              {papasOptions && config.kind !== 'papas' && (
                <motion.button
                  type="button" className="bw-ing"
                  onClick={() => flashHighlight(null, true)}
                  initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: chips.length * 0.04, type: 'spring', stiffness: 380, damping: 20 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="bw-ing-emoji">🍟</span>
                  <span className="bw-ing-name">Papas fritas</span>
                  <span className="bw-ing-tag bw-ing-tag--base">incl.</span>
                </motion.button>
              )}
            </div>
          </div>

          <div className="bw-info-actions">
            {tourTokens.length > 0 && (
              <motion.button type="button" className="bw-tour-btn" onClick={tourOn ? stopTour : startTour} whileTap={{ scale: 0.96 }}>
                {tourOn ? '⏹ Detener recorrido' : '▶ Ver ingredientes uno por uno'}
              </motion.button>
            )}
            {!isPhoto && (
              <button
                type="button" className={`bw-tour-btn bw-tour-btn--ghost${explodedManual ? ' bw-tour-btn--on' : ''}`}
                onClick={() => { stopTour(); setExplodedManual((v) => !v); buzz(8); }}
              >
                🔍 {explodedManual ? 'Juntar capas' : 'Separar capas'}
              </button>
            )}
          </div>

          {imageUrl && !isPhoto && (
            <motion.button
              type="button" className={`bw-photo${photoZoom ? ' bw-photo--zoom' : ''}`}
              onClick={() => setPhotoZoom((v) => !v)} layout
            >
              <img src={imageUrl} alt={`Foto real de ${name}`} />
              <span className="bw-photo-tag">📷 Foto real · tocá para {photoZoom ? 'achicar' : 'agrandar'}</span>
            </motion.button>
          )}

          {isLast ? recap : nextInline}
        </>
      );
    }

    if (stepKey === 'receta') {
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
          {nextInline}
        </>
      );
    }

    if (stepKey === 'carne') {
      return (
        <>
          <p className="bw-step-intro">{carne.intro} <b>Cada {carne.unit} extra suma {formatARS(carne.extraPrecio)}.</b></p>
          <div className="bw-meds">
            {carne.options.map((o, i) => {
              const active = medallones === o.total;
              const extra = (o.total - 1) * carne.extraPrecio;
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
          {nextInline}
        </>
      );
    }

    if (stepKey === 'papas') {
      return (
        <>
          {config.kind === 'papas'
            ? <p className="bw-step-intro">Elegí el estilo de tus papas. <b>Sazonadas es gratis</b> 🧡</p>
            : <p className="bw-step-intro">Tus papas fritas vienen incluidas. <b>¿Las querés sazonadas?</b> Es gratis 🧡</p>}
          <div className="bw-meds">
            {papasOptions.map((o, i) => {
              const active = papasStyle === o.id;
              const hot = o.id === 'sazonadas';
              return (
                <motion.button
                  type="button" key={o.id}
                  className={`bw-med bw-papa${active ? ' bw-med--active' : ''}${hot ? ' bw-papa--hot' : ''}`}
                  onClick={() => pickPapas(o.id)}
                  aria-pressed={active}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 360, damping: 24 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {active && <motion.span layoutId="bw-papa-glow" className="bw-med-glow" transition={{ type: 'spring', stiffness: 420, damping: 30 }} />}
                  <span className="bw-papa-emoji">{hot ? '🍟🧡' : '🍟'}</span>
                  <span className="bw-med-text">
                    <span className="bw-med-name">
                      {o.name}
                      {o.badge && <span className="badge badge--pulse" style={{ marginLeft: 8 }}>{o.badge}</span>}
                    </span>
                    <span className="bw-med-desc">{o.desc}</span>
                  </span>
                  <span className="bw-med-price">{hot ? 'Gratis' : 'Incluidas'}</span>
                </motion.button>
              );
            })}
          </div>
          {isLast ? recap : nextInline}
        </>
      );
    }

    // extras / dips
    const list = stepKey === 'extras' ? extrasList : dipsList;
    const values = stepKey === 'extras' ? extras : dips;
    const change = stepKey === 'extras' ? changeExtra : changeDip;
    return (
      <>
        <p className="bw-step-intro">
          {stepKey === 'extras'
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
        {isLast ? recap : nextInline}
      </>
    );
  };

  return (
    typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="bw-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              className={`bw-shell${steps.length === 1 ? ' bw-shell--single' : ''}`} role="dialog" aria-modal="true" aria-label={`${kindText.small} ${name}`}
              initial={{ y: 80, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 80, scale: 0.97, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {/* Header */}
              <header className="bw-header">
                <div className="bw-title">
                  <span className="bw-title-small">{kindText.small}</span>
                  <span className="bw-title-name">{name}</span>
                </div>
                <span className="bw-header-price">{formatARS(basePrice)}</span>
                <button type="button" className="bw-close" onClick={closeWizard} aria-label="Cerrar">✕</button>
              </header>

              {/* Pestañas */}
              <div className="bw-tabs" role="tablist" hidden={steps.length === 1}>
                {steps.map((s, i) => (
                  <button
                    type="button" key={s.key} role="tab" aria-selected={i === step}
                    className={`bw-tab${i === step ? ' bw-tab--on' : ''}`}
                    onClick={() => goTo(i)}
                  >
                    <span className="bw-tab-icon">{s.icon}</span>
                    <span className="bw-tab-label">{s.label}</span>
                    {tabChanged(s.key) && <motion.span className="bw-tab-dot" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
                    {i === step && <motion.span layoutId="bw-tab-ind" className="bw-tab-ind" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                  </button>
                ))}
              </div>
              <div className="bw-bar" hidden={steps.length === 1}>
                <motion.span
                  className="bw-bar-fill" initial={false}
                  animate={{ scaleX: (step + 1) / steps.length }}
                  transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                />
              </div>

              {/* Cuerpo: escenario + panel */}
              <div className="bw-body">
                <div className="bw-stage-col">
                  {isPhoto ? (
                    <ProductHero
                      imageUrl={imageUrl} name={name} emoji={kindText.emoji}
                      token={heroToken} bounceKey={bounceKey}
                      papas={papasOptions ? papasStyle : null} dipCount={dipTotal}
                    />
                  ) : (
                    <>
                      <LiveBurger
                        ingredientes={config.ingredientes}
                        quitados={quitados}
                        medallones={medallones}
                        extras={extras}
                        dips={dips}
                        papas={papasOptions ? papasStyle : null}
                        bounceKey={bounceKey}
                        highlight={highlight}
                        exploded={exploded}
                        friesHighlight={friesHighlight}
                        pan={config.pan}
                        mainType={mainType}
                      />
                      <button
                        type="button" className={`bw-explode${exploded ? ' bw-explode--on' : ''}`}
                        onClick={() => { stopTour(); setExplodedManual((v) => !v); buzz(8); }}
                      >
                        🔍 {exploded ? 'Juntar capas' : 'Ver capas'}
                      </button>
                    </>
                  )}
                  <div className="bw-caption">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={tokenNow || 'idle'} className="bw-caption-text"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {tourOn ? 'Mirá cada ingrediente…' : desc}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="bw-panel-col">
                  <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                      key={step} custom={dir} variants={stepVariants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ type: 'spring', stiffness: 340, damping: 32, duration: 0.2 }}
                      className="bw-step"
                    >
                      <h3 className="bw-step-heading"><span className="bw-step-n">{step + 1}.</span> {steps[step].title}</h3>
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer fijo: precio + cantidad + agregar (siempre disponible) */}
              <footer className="bw-footer">
                <div className="bw-footer-price">
                  <span className="bw-footer-label">Total por unidad</span>
                  <RollPrice value={totalUnidad} className="bw-footer-val" />
                  <span className="bw-footer-sub">
                    {medallonesExtra || extrasTotal ? `Base ${formatARS(basePrice)} · +${formatARS(extrasTotal)}` : `Base ${formatARS(basePrice)}`}
                  </span>
                </div>
                <div className="bw-qty">
                  <button type="button" className="bw-qty-btn" onClick={() => onQtyChange && onQtyChange(Math.max(1, qty - 1))} aria-label="Menos">−</button>
                  <motion.span key={qty} className="bw-qty-val" initial={{ scale: 1.5 }} animate={{ scale: 1 }}>{qty}</motion.span>
                  <button type="button" className="bw-qty-btn" onClick={() => onQtyChange && onQtyChange(qty + 1)} aria-label="Más">+</button>
                </div>
                <motion.button type="button" className="bw-btn-next" onClick={confirm} whileTap={{ scale: 0.95 }}>
                  <span className="bw-btn-shine" />
                  Agregar · {formatARS(totalUnidad * qty)}
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
      document.body,
    )
  );
}
