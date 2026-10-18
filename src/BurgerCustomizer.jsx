import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EXTRAS, DIPS } from './burgerConfig';
import LiveBurger, { emojiOf, typesForIngredient, buildLayers } from './LiveBurger';
import { launchConfetti } from './confettiCheckout';

function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

// Celulares / pantallas táctiles: mismas animaciones pero con menos partículas
const isLite = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;

const buzz = (ms = 12) => {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch { /* noop */ }
};

const NO_DIPS = [];
const KIND_TEXT = {
  burger:   { tab: 'La burger',  title: 'Así viene tu hamburguesa', small: 'Armá tu',    emoji: '🍔' },
  lomo:     { tab: 'El lomito',  title: 'Así viene tu lomito',      small: 'Armá tu',    emoji: '🥩' },
  sandwich: { tab: 'El sanguche', title: 'Así viene tu sándwich',   small: 'Armá tu',    emoji: '🥪' },
  papas:    { tab: 'Las papas',  title: 'Así vienen tus papas',      small: 'Elegí tus',  emoji: '🍟' },
  pizza:    { tab: 'El plato',   title: 'Así viene tu plato',       small: 'Mirá tu',    emoji: '🍕' },
};

// Arma las pestañas según lo que el producto permite personalizar
function buildSteps(config, hasPapas, ingList) {
  const k = KIND_TEXT[config.kind] || KIND_TEXT.burger;
  const steps = [{ key: 'info', title: k.title }];
  if (config.variants) steps.push({ key: 'variante', title: config.variants.question });
  if (ingList.length || config.variants?.byId) steps.push({ key: 'sacar', title: '¿Querés sacar algún ingrediente?' });
  if (config.carne) steps.push({ key: 'carne', title: config.carne.question });
  if (config.extras.length) steps.push({ key: 'extras', title: '¿Querés agregarle algo más?' });
  if (config.dips) steps.push({ key: 'dips', title: '¿Querés una salsa aparte?' });
  if (hasPapas) steps.push({ key: 'papas', title: '¿Cómo querés las papas?' });
  steps.push({ key: 'resumen', title: 'Revisá tu pedido' });
  return steps;
}

// ── Hero con foto (pizza, calzone, papas): plato giratorio con los
//    ingredientes orbitando, vapor, y reacciones a cada cambio ──────────
function ProductHero({ imageUrl, name, token, emoji, papas, orbit, rain, bounceKey }) {
  const n = orbit.length;
  return (
    <div className="ph-stage">
      <div className="lb-glow" />
      <div className="fx-steam fx-steam--hero" aria-hidden="true"><span /><span /><span /></div>
      {rain && (
        <div className="ph-rain" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => <span key={i} style={{ '--i': i }}>{rain}</span>)}
        </div>
      )}
      <motion.div
        key={bounceKey}
        className={`ph-photo-wrap${papas === 'sazonadas' ? ' ph-photo-wrap--hot' : ''}`}
        initial={{ scale: 0.82, rotate: -8, opacity: 0.6 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 13 }}
      >
        {imageUrl ? <img className="ph-photo" src={imageUrl} alt={name} decoding="async" /> : <span className="ph-fallback">{emoji}</span>}
        {papas === 'sazonadas' && (
          <div className="ph-sparks" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => <span key={i} style={{ '--i': i }}>✨</span>)}
          </div>
        )}
      </motion.div>

      {/* Anillo de ingredientes que orbitan */}
      <div className="ph-orbit" aria-hidden="true">
        <AnimatePresence>
          {orbit.map((o, i) => (
            <motion.div
              key={o.id} className="ph-orbit-slot"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: token && token.label === o.label ? 1.45 : 1 }}
              exit={{ opacity: 0, scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            >
              <span className={`ph-orbit-item${token && token.label === o.label ? ' ph-orbit-item--on' : ''}`} style={{ '--a': `${(360 / Math.max(n, 1)) * i}deg` }}>
                <span className="ph-orbit-icon">{o.emoji}</span>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
  variantValue, onVariantChange,
}) {
  const isPhoto = config.visual === 'photo';
  const kindText = KIND_TEXT[config.kind] || KIND_TEXT.burger;
  const vcfg = config.variants;
  // Ingredientes quitables: en Sin T.A.C.C. dependen de la variedad elegida
  const ingList = useMemo(
    () => (vcfg?.byId ? (vcfg.byId[variantValue] || NO_DIPS) : config.ingredientes),
    [vcfg, variantValue, config.ingredientes],
  );
  const infoChips = vcfg?.byId && vcfg.byId[variantValue] ? vcfg.byId[variantValue] : config.infoChips;
  const steps = useMemo(() => buildSteps(config, !!papasOptions, ingList), [config, papasOptions, ingList]);
  const [variantErr, setVariantErr] = useState('');
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
    () => (isPhoto ? [] : buildLayers({ ingredientes: ingList, quitados, medallones, extras, mainType })),
    [isPhoto, ingList, quitados, medallones, extras, mainType],
  );
  const tourTokens = useMemo(() => {
    if (isPhoto) return [...config.base, ...infoChips];
    const seen = [];
    layers.forEach((l) => { if (!seen.includes(l.type)) seen.push(l.type); });
    if (papasOptions) seen.push('fries');
    return seen;
  }, [isPhoto, infoChips, config.base, layers, papasOptions]);

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
  useEffect(() => { if (vcfg?.byId) setQuitados([]); }, [variantValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const spawnBurst = useCallback((emoji) => {
    const id = Date.now() + Math.random();
    const parts = Array.from({ length: isLite() ? 4 : 7 }).map((_, i) => ({
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
  // La variante (medallón / variedad) es obligatoria: si falta, lleva a esa pantalla
  const variantMissing = () => !!vcfg && variantCount < (vcfg.multi ? qty : 1);
  const failVariant = () => {
    const need = vcfg.multi ? qty : 1;
    setVariantErr(vcfg.multi ? `Elegí ${need} medallón${need > 1 ? 'es' : ''} para continuar` : 'Elegí una opción para continuar');
    const vi = steps.findIndex((x) => x.key === 'variante');
    if (vi >= 0 && vi !== step) { setDir(vi > step ? 1 : -1); setStep(vi); }
    buzz(30);
  };
  const goNext = () => {
    if (stepKey === 'variante' && variantMissing()) { failVariant(); return; }
    goTo(step + 1);
  };
  const confirm = () => {
    stopTour();
    if (variantMissing()) { failVariant(); return; }
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
  const variantCount = vcfg?.multi
    ? Object.values(variantValue || {}).reduce((s, n) => s + n, 0)
    : (variantValue ? 1 : 0);
  // Ingredientes que orbitan alrededor del plato (los quitados desaparecen; los extras aparecen)
  const orbit = isPhoto
    ? [
      ...[...config.base, ...infoChips].filter((x) => !quitados.includes(x)).map((x) => ({ id: x, label: x, emoji: emojiOf(x) })),
      ...Array.from({ length: extras.muzza || 0 }).map((_, i) => ({ id: `muzza-${i}`, label: 'Muzza extra', emoji: '🧀' })),
      ...Array.from({ length: dips.mayo || 0 }).map((_, i) => ({ id: `dip-${i}`, label: 'Dip de mayo', emoji: '🥣' })),
    ].slice(0, 12)
    : [];
  const dipTotal = Object.values(dips).reduce((s, n) => s + n, 0);

  const isLast = step === steps.length - 1;
  const stepKey = steps[step].key;

  // Texto del botón principal: claro sobre qué pasa si no se toca nada
  const nextLabel = (() => {
    if (isLast) return `✅ Agregar al pedido · ${formatARS(totalUnidad * qty)}`;
    const touched = (
      stepKey === 'sacar' ? quitados.length > 0
      : stepKey === 'carne' ? medallones > 1
      : stepKey === 'extras' ? Object.keys(extras).length > 0
      : stepKey === 'dips' ? Object.keys(dips).length > 0
      : true
    );
    if (touched) return 'Siguiente →';
    return stepKey === 'sacar' ? 'Dejarlo así →' : stepKey === 'carne' ? 'Así está bien →' : 'No, gracias →';
  })();

  // ── Resumen final ────────────────────────────────────────
  const recap = (
    <>
      <motion.div className="bw-recap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bw-recap-title">{kindText.emoji} {name}</div>
        <ul className="bw-recap-list">
          {carne && <li>🍔 {carne.options.find((o) => o.total === medallones)?.name}</li>}
          {vcfg && variantCount > 0 && (
            <li>
              {vcfg.icon}{' '}
              {vcfg.multi
                ? Object.entries(variantValue).map(([id, n]) => `${n > 1 ? `${n}x ` : ''}${vcfg.options.find((o) => o.id === id)?.name}`).join(', ')
                : vcfg.options.find((o) => o.id === variantValue)?.name}
            </li>
          )}
          <AnimatePresence initial={false}>
            {lines.filter((l) => l !== carneLine).map((l) => (
              <motion.li
                key={l}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              >
                {l.startsWith('Sin ') ? '❌' : '➕'} {l}
              </motion.li>
            ))}
          </AnimatePresence>
          {papasOptions && <li>🍟 Papas {papasStyle === 'sazonadas' ? 'sazonadas 🧡' : 'clásicas'}</li>}
          {config.sides.map((sd) => <li key={sd.label}>{sd.emoji} {sd.label} incluido</li>)}
          {lines.length === 0 && <li className="bw-recap-empty">✅ Tal cual la receta original</li>}
        </ul>
      </motion.div>

      <div className="bw-qty-row">
        <span className="bw-qty-label">¿Cuántos querés?</span>
        <div className="bw-qty">
          <button type="button" className="bw-qty-btn" onClick={() => onQtyChange && onQtyChange(Math.max(1, qty - 1))} aria-label="Menos">−</button>
          <motion.span key={qty} className="bw-qty-val" initial={{ scale: 1.5 }} animate={{ scale: 1 }}>{qty}</motion.span>
          <button type="button" className="bw-qty-btn" onClick={() => onQtyChange && onQtyChange(qty + 1)} aria-label="Más">+</button>
        </div>
      </div>
    </>
  );

  // ── Pantallas (una decisión por vez) ─────────────────────
  const sectionVariant = () => {
    const need = vcfg.multi ? qty : 1;
    const setSingle = (id) => { stopTour(); onVariantChange(id); setVariantErr(''); bump(); buzz(14); };
    const setMulti = (id, d) => {
      stopTour();
      const cur = variantValue || {};
      if (d > 0 && variantCount >= need) return;
      const next = { ...cur, [id]: Math.max(0, (cur[id] || 0) + d) };
      if (!next[id]) delete next[id];
      onVariantChange(next); setVariantErr(''); bump(); buzz(12);
    };
    return (
      <>
        <p className="bw-step-intro">
          {vcfg.multi
            ? <>Tocá el <b>+</b> para elegir{need > 1 ? ` (${variantCount} de ${need})` : ''}.</>
            : <>Tocá una opción para elegirla.</>}
        </p>
        {variantErr && <p className="medallon-error">⚠ {variantErr}</p>}
        <div className="bw-cards">
          {vcfg.options.map((o, i) => {
            const n = vcfg.multi ? ((variantValue || {})[o.id] || 0) : (variantValue === o.id ? 1 : 0);
            return (
              <motion.div
                key={o.id} className={`bw-card${n ? ' bw-card--active' : ''}`}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 360, damping: 26 }}
                onClick={vcfg.multi ? undefined : () => setSingle(o.id)}
                style={vcfg.multi ? undefined : { cursor: 'pointer' }}
              >
                <span className="bw-card-emoji">{vcfg.icon}</span>
                <span className="bw-card-text">
                  <span className="bw-card-name">{o.name}</span>
                  <span className="bw-card-desc">{o.desc}</span>
                </span>
                {vcfg.multi ? (
                  <Stepper value={n} label={o.name} onMinus={() => setMulti(o.id, -1)} onPlus={() => setMulti(o.id, 1)} />
                ) : (
                  <span className={`sintacc-radio${n ? ' sintacc-radio--on' : ''}`}>{n ? <span className="sintacc-radio-dot" /> : null}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </>
    );
  };

  // Pantalla 1: solo mirar (qué lleva), sin botones que confundan
  const sectionLleva = () => {
    const chips = isPhoto
      ? [...config.base.map((n) => ({ n, base: true })), ...infoChips.map((n) => ({ n, base: false }))]
      : [...config.base.map((n) => ({ n, base: true })), ...ingList.map((n) => ({ n, base: false }))];
    const onChip = (n) => (isPhoto ? flashHero(n) : flashHighlight(typesForIngredient(n)));
    const sideChip = (key, emojiStr, label, i, onClick) => (
      <motion.div className="bw-ing-wrap" key={key} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (chips.length + i) * 0.03 }}>
        <button type="button" className="bw-ing" onClick={onClick}>
          <span className="bw-ing-emoji">{emojiStr}</span>
          <span className="bw-ing-name">{label}</span>
          <span className="bw-ing-tag bw-ing-tag--base">incluido</span>
        </button>
      </motion.div>
    );
    return (
      <div className="bw-sec">
        <div className="bw-sec-title">Lleva <em>· tocá uno para verlo</em></div>
        <div className="bw-ing-grid">
          {chips.map(({ n, base }, i) => {
            const live = isPhoto && (tourOn ? tokenNow : heroPop) === n;
            return (
              <motion.div
                className="bw-ing-wrap" key={n}
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 380, damping: 24 }}
              >
                <button type="button" className={`bw-ing${live ? ' bw-ing--live' : ''}`} onClick={() => onChip(n)}>
                  <span className="bw-ing-emoji">{emojiOf(n)}</span>
                  <span className="bw-ing-name">{n}</span>
                  {base && <span className="bw-ing-tag bw-ing-tag--base">base</span>}
                </button>
              </motion.div>
            );
          })}
          {config.sides.map((sd, i) => sideChip(sd.label, sd.emoji, sd.label, i, () => flashHighlight(null)))}
          {papasOptions && config.kind !== 'papas' && sideChip('papas', '🍟', 'Papas fritas', config.sides.length, () => flashHighlight(null, true))}
        </div>
      </div>
    );
  };

  // Pantalla "sacar": mosaicos grandes, tocar = sacar
  const sectionSacar = () => (
    <>
      <p className="bw-step-intro">Tocá los que <b>NO querés</b>. Es gratis. Si querés todo, seguí con el botón de abajo.</p>
      {ingList.length === 0 && <p className="bw-hint">Primero elegí la opción anterior.</p>}
      <div className="bw-tiles">
        {ingList.map((ing, i) => {
          const off = quitados.includes(ing);
          return (
            <motion.button
              type="button" key={ing}
              className={`bw-tile${off ? ' bw-tile--off' : ''}`}
              onClick={() => toggleIngrediente(ing)}
              aria-pressed={!off}
              initial={{ opacity: 0, y: 18, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 380, damping: 22 }}
              whileTap={{ scale: 0.92 }}
            >
              <span className="bw-tile-emoji">{emojiOf(ing)}</span>
              <span className="bw-tile-name">{ing}</span>
              <span className="bw-tile-state">{off ? 'SIN' : 'LLEVA'}</span>
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
    </>
  );

  const sectionCarne = () => (
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
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 360, damping: 26 }}
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

  const sectionCards = (intro, list, values, change) => (
    <>
      <p className="bw-step-intro">{intro}</p>
      <div className="bw-cards">
        {list.map((e, i) => {
          const n = values[e.id] || 0;
          return (
            <motion.div
              key={e.id}
              className={`bw-card${n ? ' bw-card--active' : ''}`}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 360, damping: 26 }}
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
              <Stepper value={n} label={e.name} onMinus={() => change(e.id, -1)} onPlus={() => change(e.id, 1)} />
            </motion.div>
          );
        })}
      </div>
    </>
  );

  const sectionPapas = () => (
    <>
      <p className="bw-step-intro">
        {config.kind === 'papas' ? 'Elegí el estilo de tus papas.' : 'Tus papas fritas ya vienen incluidas.'} <b>Sazonadas es gratis</b> 🧡
      </p>
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
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 360, damping: 26 }}
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
    </>
  );

  const renderStep = () => {
    if (stepKey === 'info') {
      return (
        <>
          {badge && <span className="badge badge--pulse bw-info-badge">{badge}</span>}
          <p className="bw-info-desc">{desc}</p>
          {sectionLleva()}
          <div className="bw-info-actions">
            {tourTokens.length > 0 && (
              <motion.button type="button" className="bw-tour-btn" onClick={tourOn ? stopTour : startTour} whileTap={{ scale: 0.96 }}>
                {tourOn ? '⏹ Detener' : '▶ Ver ingrediente por ingrediente'}
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
          <button type="button" className="bw-skip" onClick={() => goTo(steps.length - 1)}>
            ⚡ La quiero tal cual viene
          </button>
        </>
      );
    }
    if (stepKey === 'variante') return sectionVariant();
    if (stepKey === 'sacar') return sectionSacar();
    if (stepKey === 'carne') return sectionCarne();
    if (stepKey === 'extras') return sectionCards('Sumá lo que quieras con el botón +. No hay límite.', extrasList, extras, changeExtra);
    if (stepKey === 'dips') return sectionCards('Agregá una salsa o dip aparte. Es opcional.', dipsList, dips, changeDip);
    if (stepKey === 'papas') return sectionPapas();
    return recap;
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
              className="bw-shell" role="dialog" aria-modal="true" aria-label={`${kindText.small} ${name}`}
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

              {/* Progreso */}
              <div className="bw-progress">
                <span className="bw-progress-text">Paso {step + 1} de {steps.length}</span>
                <div className="bw-bar">
                  <motion.span
                    className="bw-bar-fill" initial={false}
                    animate={{ scaleX: (step + 1) / steps.length }}
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                  />
                </div>
              </div>

              {/* Cuerpo: escenario + panel */}
              <div className="bw-body">
                <div className="bw-stage-col">
                  {isPhoto ? (
                    <ProductHero
                      imageUrl={imageUrl} name={name} emoji={kindText.emoji}
                      token={heroToken} bounceKey={bounceKey}
                      papas={papasOptions ? papasStyle : null}
                      orbit={orbit} rain={config.kind === 'papas' ? (papasStyle === 'sazonadas' ? '🧡' : '🍟') : null}
                    />
                  ) : (
                    <>
                      <LiveBurger
                        ingredientes={ingList}
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
                        panName={config.base[0]}
                        mainName={config.base[1]}
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
                      <h3 className="bw-step-heading">{steps[step].title}</h3>
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer fijo: precio + atrás + botón principal grande */}
              <footer className="bw-footer bw-footer--guided">
                <div className="bw-footer-price">
                  <span className="bw-footer-label">Total</span>
                  <RollPrice value={totalUnidad * qty} className="bw-footer-val" />
                </div>
                <div className="bw-footer-actions">
                  {step > 0 && (
                    <button type="button" className="bw-back" onClick={() => goTo(step - 1)}>← Atrás</button>
                  )}
                  <motion.button
                    type="button" className="bw-btn-next bw-btn-next--big"
                    onClick={isLast ? confirm : goNext} whileTap={{ scale: 0.96 }}
                  >
                    <span className="bw-btn-shine" />
                    {nextLabel}
                  </motion.button>
                </div>
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
