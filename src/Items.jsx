import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU, POSTRES, CAFETERIA } from './menuData';
import { emitFlyToCart } from './flyToCart';
import RevealText from './RevealText';
import { launchConfetti } from './confettiCheckout';

const WHATSAPP_NUMBER = 543543512248;

// ── Variedades de Pizza Sin T.A.C.C. ─────────────────────
const VARIEDADES_SINTACC = [
  { id: 'napolitana',   name: 'Napolitana',    desc: 'Salsa de tomate fresca, mozzarella, rodajas de tomate fresco, aceite de ajo y orégano.' },
  { id: 'cuatroquesos', name: 'Cuatro Quesos', desc: 'Salsa de tomate fresca, mozzarella, parmesano, sardo, roquefort, orégano.' },
  { id: 'muzzajamon',   name: 'Muzza y Jamón', desc: 'Salsa de tomate fresca, abundante mozzarella, jamón cocido y orégano.' },
];

// ── Medallones de la Veggie ───────────────────────────────
const MEDALLONES = [
  { id: 'remolacha', name: 'Tabule',          desc: 'Mijo, cebolla de verdeo, tomate deshidratado, harina de garbanzos, fábula de mandioca, aceite de girasol, jugo y ralladura de limón y especias.' },
  { id: 'quinoa',    name: 'Burrito Mexicano', desc: 'Poroto negro, arroz blanco, cebolla, harina de garbanzos, fábula de mandioca, aceite de girasol, jugo y ralladura de limón y especias.' },
  { id: 'garbanzo',  name: 'Curry India',      desc: 'Lentejas, coliflor, espinaca, tomate deshidratado, harina de garbanzos, fábula de mandioca y especias.' },
  { id: 'lentejas',  name: 'Fabel India',      desc: 'Garbanzos, fábula de mandioca, aceite de girasol, harina de garbanzos, perejil, comino y pimienta blanca.' },
];

// ── Helpers ───────────────────────────────────────────────
function parsePrice(priceStr) {
  return parseFloat((priceStr || '0').replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}
function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}
function formatDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${String(d.getFullYear()).slice(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}hs`;
}

// ── ALTA 1: Precio con shimmer dorado al entrar ───────────
function ShimmerPrice({ value }) {
  return (
    <span className="shimmer-price">
      {value}
    </span>
  );
}

// ── Precio animado con "roll" al cambiar qty ──────────────
function AnimatedPrice({ value }) {
  return (
    <span className="price-roll">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="price-roll-inner"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {formatARS(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ════════════════════════════════════════════════════════════
//  🛒 CART FAB — con ALTA 3: spring bounce en el número
// ════════════════════════════════════════════════════════════

export function CartChip({ cart, onOpen }) {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const isEmpty    = totalItems === 0;

  return (
    <button
      className={`cart-fab-header${isEmpty ? ' cart-fab-header--empty' : ' cart-fab-header--active'}`}
      onClick={onOpen}
      aria-label="Ver mi pedido"
    >
      <span className="cart-fab-header-icon">🛒</span>
      {/* key cambia con totalItems → re-dispara la animación spring */}
      <motion.span
        key={totalItems}
        className={`cart-fab-header-badge${isEmpty ? ' zero' : ''}`}
        initial={{ scale: isEmpty ? 1 : 1.6, y: isEmpty ? 0 : -3 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      >
        {totalItems}
      </motion.span>
    </button>
  );
}


// ════════════════════════════════════════════════════════════
//  🛒 PANEL LATERAL — MEDIA 8: spring lateral al entrar
// ════════════════════════════════════════════════════════════

export function CartPanel({ cart, onClose, onCartAdd, onCartRemove, onCartClear, onCheckout }) {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0);
  const isEmpty    = totalItems === 0;

  // En mobile el panel viene de abajo; en desktop de la derecha
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;

  return (
    <>
      <motion.div
        className="cart-panel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />
      <motion.div
        className="cart-panel"
        initial={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
        animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
        exit={isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <div className="cart-panel-header">
          <span className="cart-panel-title">Mi pedido</span>
          <button className="cart-panel-close" onClick={onClose}>✕</button>
        </div>

        {isEmpty ? (
          <div className="cart-panel-empty">
            <span className="cart-panel-empty-icon">🍽️</span>
            <p>Mirá la carta y seleccioná o agregá un producto para confirmar</p>
          </div>
        ) : (
          <>
            <ul className="cart-panel-list">
              {cart.map((item) => (
                <li key={item._key} className="cart-panel-item">
                  <div className="cart-panel-item-top">
                    <span className="cart-panel-item-name">{item.name}</span>
                    <span className="cart-panel-item-price">
                      {formatARS(parsePrice(item.price) * item.qty)}
                    </span>
                  </div>
                  {item.note && <p className="cart-panel-item-note">↳ {item.note}</p>}
                  {item.sintaccVariedad && <p className="cart-panel-item-note">🌾 {item.sintaccVariedad}</p>}
                  {item.medallon && <p className="cart-panel-item-note">🌿 {item.medallon}</p>}
                  <div className="cart-panel-item-controls">
                    <button className="cart-panel-ctrl" onClick={() => onCartRemove(item._key)} aria-label="Quitar uno">−</button>
                    <span className="cart-panel-item-qty">{item.qty}</span>
                    <button className="cart-panel-ctrl" onClick={() => onCartAdd({ ...item, qty: 1, note: item.note || '', medallon: item.medallon || '' })} aria-label="Sumar uno">+</button>
                    <button className="cart-panel-del" onClick={() => { for (let i = 0; i < item.qty; i++) onCartRemove(item._key); }} aria-label="Eliminar">🗑</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-panel-total">
              <span>Total</span>
              <span className="cart-panel-total-price">{formatARS(totalPrice)}</span>
            </div>

            <button className="cart-panel-order-btn" onClick={onCheckout}>📲 Confirmar pedido</button>
            <button className="cart-panel-clear" onClick={onCartClear}>Vaciar carrito</button>
          </>
        )}
      </motion.div>
    </>
  );
}


// ════════════════════════════════════════════════════════════
//  🥗 SELECTOR DE MEDALLÓN
// ════════════════════════════════════════════════════════════

function MedallonSelector({ qty, selected, onChange, error }) {
  const totalSelected = Object.values(selected).reduce((s, n) => s + n, 0);
  const add    = (id) => { if (totalSelected >= qty) return; onChange({ ...selected, [id]: (selected[id] || 0) + 1 }); };
  const remove = (id) => { if (!selected[id]) return; const next = { ...selected, [id]: selected[id] - 1 }; if (next[id] === 0) delete next[id]; onChange(next); };

  return (
    <div className="medallon-wrap">
      <div className="medallon-header">
        <span className="medallon-label"><span>🌿</span> Elegí tu medallón</span>
        <span className="medallon-counter">{totalSelected}/{qty} seleccionado{qty !== 1 ? 's' : ''}</span>
      </div>
      {error && <p className="medallon-error">⚠ {error}</p>}
      <div className="medallon-list">
        {MEDALLONES.map((m) => {
          const count = selected[m.id] || 0;
          const isActive = count > 0;
          const canAdd = totalSelected < qty;
          return (
            <div key={m.id} className={`medallon-opt${isActive ? ' medallon-opt--active' : ''}${!canAdd && !isActive ? ' medallon-opt--disabled' : ''}`}>
              <div className="medallon-opt-text" onClick={() => canAdd && add(m.id)}>
                <span className="medallon-opt-name">{m.name}</span>
                <span className="medallon-opt-desc">{m.desc}</span>
              </div>
              <div className="medallon-opt-controls">
                {isActive && <button type="button" className="medallon-ctrl" onClick={() => remove(m.id)} aria-label="Quitar">−</button>}
                {isActive && <span className="medallon-ctrl-count">{count}</span>}
                <button type="button" className={`medallon-ctrl medallon-ctrl--add${!canAdd ? ' medallon-ctrl--off' : ''}`} onClick={() => add(m.id)} disabled={!canAdd} aria-label="Agregar">+</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
//  🌾 SELECTOR SIN TACC
// ════════════════════════════════════════════════════════════

function SinTaccSelector({ selected, onChange, error }) {
  return (
    <div className="medallon-wrap sintacc-wrap">
      <div className="medallon-header">
        <span className="medallon-label"><span className="sintacc-icon-label">🌾</span> Elegí tu variedad Sin T.A.C.C.</span>
      </div>
      {error && <p className="medallon-error">⚠ {error}</p>}
      <div className="medallon-list">
        {VARIEDADES_SINTACC.map((v) => {
          const isActive = selected === v.id;
          return (
            <div key={v.id} className={`medallon-opt${isActive ? ' medallon-opt--active sintacc-opt--active' : ''}`} onClick={() => onChange(v.id)} style={{ cursor: 'pointer' }}>
              <div className="medallon-opt-text">
                <span className="medallon-opt-name">{v.name}</span>
                <span className="medallon-opt-desc">{v.desc}</span>
              </div>
              <div className="medallon-opt-controls">
                <div className={`sintacc-radio${isActive ? ' sintacc-radio--on' : ''}`}>
                  {isActive && <span className="sintacc-radio-dot" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
//  📦 EXPANDABLE ITEM CARD
//  ✅ ALTA 1: shimmer en precio
//  ✅ ALTA 4: entrada con blur
//  ✅ ALTA 6: badge pulsante
//  ✅ FX 11: parallax en imagen expandida
// ════════════════════════════════════════════════════════════

function ExpandableItemCard({ item, isExpanded, onToggle, onCartAdd }) {
  const isVeggie  = item.name === 'Veggie';
  const isSinTacc = item.sinTacc === true;
  const [qty, setQty]                     = useState(1);
  const [note, setNote]                   = useState('');
  const [medallones, setMedallones]       = useState({});
  const [medallonError, setMedallonError] = useState('');
  const [sintaccVar, setSintaccVar]       = useState('');
  const [sintaccError, setSintaccError]   = useState('');

  // FX 11: parallax en imagen del body
  const imgRef  = useRef(null);
  const wrapRef = useRef(null);

  const MAX_NOTE  = 150;
  const unitPrice = parsePrice(item.price);

  // ── FX 11: scroll parallax en la imagen grande ────────────
  useEffect(() => {
    if (!isExpanded || !imgRef.current || !wrapRef.current) return;
    const wrap = wrapRef.current;
    const img  = imgRef.current;

    const onScroll = () => {
      const rect   = wrap.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const ratio  = (window.innerHeight / 2 - center) / window.innerHeight;
      img.style.transform = `scale(1.12) translateY(${ratio * 18}px)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // posición inicial
    return () => window.removeEventListener('scroll', onScroll);
  }, [isExpanded]);

  // Glow cursor
  const handleRowMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  useEffect(() => {
    if (!isExpanded) {
      setQty(1); setNote(''); setMedallones({});
      setMedallonError(''); setSintaccVar(''); setSintaccError('');
    }
  }, [isExpanded]);

  const handleAdd = (e) => {
    if (isVeggie) {
      const totalSelected = Object.values(medallones).reduce((s, n) => s + n, 0);
      if (totalSelected < qty) { setMedallonError(`Seleccioná ${qty} medallón${qty > 1 ? 'es' : ''} para continuar`); return; }
    }
    if (isSinTacc && !sintaccVar) { setSintaccError('Elegí una variedad para continuar'); return; }

    const medallonLabel = Object.entries(medallones)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => { const name = MEDALLONES.find((m) => m.id === id)?.name ?? id; return n > 1 ? `${n}x ${name}` : name; })
      .join(', ');
    const sintaccLabel = isSinTacc ? VARIEDADES_SINTACC.find((v) => v.id === sintaccVar)?.name ?? sintaccVar : '';

    onCartAdd({ ...item, qty, note: note.trim(), medallon: medallonLabel, sintaccVariedad: sintaccLabel });

    if (e?.currentTarget) {
      emitFlyToCart({ rect: e.currentTarget.getBoundingClientRect(), imageUrl: item.imageUrl });
    }
    onToggle(null);
  };

  const hasBadge = !!item.badge;

  return (
    // ALTA 4: entrada con blur
    <motion.div
      className={`exp-card${isExpanded ? ' exp-card--open' : ''}`}
      initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleRowMouseMove}
    >
      <span className="exp-card-glow" aria-hidden="true" />

      {/* Cabecera */}
      <motion.div className="exp-card-head" onClick={() => onToggle(isExpanded ? null : item.name)} whileTap={{ scale: 0.99 }}>
        {item.imageUrl && (
          <div className="exp-card-thumb">
            <img src={item.imageUrl} alt={item.name} />
          </div>
        )}
        <div className="exp-card-head-info">
          <span className="exp-card-name">
            {item.name}
            {/* ALTA 6: badge pulsante */}
            {item.badge && <span className={`badge${hasBadge ? ' badge--pulse' : ''}`}>{item.badge}</span>}
            {item.sinTacc && <span className="badge-sintacc">🌾 Sin T.A.C.C.</span>}
          </span>
          {item.desc && !isExpanded && <p className="exp-card-desc-preview">{item.desc}</p>}
        </div>
        <div className="exp-card-head-right">
          {/* ALTA 1: precio con shimmer */}
          <ShimmerPrice value={item.price} />
          <span className={`exp-card-chevron${isExpanded ? ' exp-card-chevron--open' : ''}`}>›</span>
        </div>
      </motion.div>

      {/* Cuerpo expandible */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            className="exp-card-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="exp-card-body-inner">
              {/* FX 11: imagen con parallax */}
              {item.imageUrl && (
                <div className="exp-card-img-wrap" ref={wrapRef}>
                  <img
                    ref={imgRef}
                    src={item.imageUrl}
                    alt={item.name}
                    className="exp-card-img exp-card-img--parallax"
                  />
                  <div className="exp-card-img-grad" />
                </div>
              )}

              {item.desc && <p className="exp-card-full-desc">{item.desc}</p>}

              {isVeggie && (
                <MedallonSelector
                  qty={qty} selected={medallones}
                  onChange={(sel) => { setMedallones(sel); setMedallonError(''); }}
                  error={medallonError}
                />
              )}
              {isSinTacc && (
                <SinTaccSelector
                  selected={sintaccVar}
                  onChange={(id) => { setSintaccVar(id); setSintaccError(''); }}
                  error={sintaccError}
                />
              )}

              <div className="exp-obs-label">
                <span>Observaciones</span>
                <span className="exp-obs-count">{note.length} / {MAX_NOTE}</span>
              </div>
              <textarea
                className="exp-textarea"
                placeholder="Alguna aclaración para tu pedido…"
                maxLength={MAX_NOTE}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />

              <div className="exp-footer">
                <div className="exp-qty-row">
                  <button className="exp-qty-btn" onClick={() => {
                    const newQty = Math.max(1, qty - 1);
                    setQty(newQty);
                    if (isVeggie) {
                      setMedallones((prev) => {
                        let rem = newQty;
                        const next = {};
                        for (const [id, n] of Object.entries(prev)) {
                          if (rem <= 0) break;
                          next[id] = Math.min(n, rem);
                          rem -= next[id];
                        }
                        return next;
                      });
                    }
                  }}>−</button>
                  <span className="exp-qty-val">{qty}</span>
                  <button className="exp-qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
                <motion.button className="exp-add-btn" whileTap={{ scale: 0.96 }} onClick={handleAdd}>
                  Agregar · <AnimatedPrice value={unitPrice * qty} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


// ════════════════════════════════════════════════════════════
//  🧾 CHECKOUT — FX 12: confetti al confirmar
// ════════════════════════════════════════════════════════════

const COSTO_ENVIO = { local: 2000, fuera: 3000 };

function CheckoutScreen({ cart, onBack, onClear }) {
  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [entrega,   setEntrega]   = useState('');
  const [zona,      setZona]      = useState('');
  const [pago,      setPago]      = useState('');
  const [vuelto,    setVuelto]    = useState('');
  const [direccion, setDireccion] = useState('');
  const [errors,    setErrors]    = useState({});

  const subtotal   = cart.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0);
  const costoEnvio = entrega === 'envio' && zona ? COSTO_ENVIO[zona] : 0;
  const total      = subtotal + costoEnvio;

  const validate = () => {
    const e = {};
    if (!name.trim())                             e.name      = 'Ingresá tu nombre';
    if (!phone.trim())                            e.phone     = 'Ingresá tu teléfono';
    if (!entrega)                                 e.entrega   = 'Seleccioná una opción';
    if (!pago)                                    e.pago      = 'Seleccioná una opción';
    if (entrega === 'envio' && !direccion.trim()) e.direccion = 'Ingresá tu dirección';
    if (entrega === 'envio' && !zona)             e.zona      = 'Seleccioná la zona';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;

    // FX 12: ¡Confetti!
    launchConfetti();

    const fecha     = formatDate();
    const mapsUrl   = entrega === 'envio' && direccion.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion.trim())}`
      : null;
    const entregaLabel = entrega === 'retiro'
      ? 'Retira personalmente'
      : `Envío — ${direccion.trim()}${mapsUrl ? `\n   📍 ${mapsUrl}` : ''}`;
    const zonaLabel  = zona === 'local' ? 'Dentro del Talar' : zona === 'fuera' ? 'Fuera del Talar' : '';
    const pagoLabel  = pago === 'efectivo'
      ? `Efectivo${vuelto.trim() ? ` (abona con ${vuelto.trim()})` : ''}`
      : pago === 'tarjeta' ? 'Tarjeta débito/crédito' : 'Mercado Pago';

    const lines      = cart.map((i) => {
      let txt = `${i.qty}x ${i.name}: ${i.price}`;
      if (i.sintaccVariedad) txt += `\n   🌾 Variedad Sin T.A.C.C.: ${i.sintaccVariedad}`;
      if (i.medallon)        txt += `\n   🌿 Medallón: ${i.medallon}`;
      if (i.note)            txt += `\n   ↳ ${i.note}`;
      return txt;
    });
    const totalLines = entrega === 'envio'
      ? [`Subtotal: ${formatARS(subtotal)}`, `Envío (${zonaLabel}): + ${formatARS(costoEnvio)}`, `TOTAL: ${formatARS(total)}`]
      : [`TOTAL: ${formatARS(total)}`];

    const body = [
      '¡Hola! Te paso el resumen de mi pedido 🍕',
      '',
      `Fecha: ${fecha}`,
      `Nombre: ${name.trim()}`,
      `Teléfono: ${phone.trim()}`,
      `Forma de pago: ${pagoLabel}`,
      `Entrega: ${entregaLabel}`,
      ...(entrega === 'envio' ? [`Zona: ${zonaLabel}`] : []),
      '',
      'Mi pedido:',
      ...lines,
      '',
      ...totalLines,
      '',
      'Espero tu respuesta para confirmar 🙌',
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`, '_blank');
    onClear();
    onBack();
  };

  const Opt = ({ active, onClick, children }) => (
    <button type="button" className={`checkout-opt-btn${active ? ' active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );

  return (
    <div className="checkout-screen fade-up">
      <div className="checkout-inner">
        <div className="checkout-header">
          <button className="back-btn" onClick={onBack}>← Volver</button>
          <span className="checkout-heading">Confirmá tu pedido</span>
        </div>

        <div className="checkout-summary">
          {cart.map((i, idx) => (
            <div key={idx} className="checkout-row">
              <span className="checkout-row-qty">{i.qty}×</span>
              <span className="checkout-row-name">
                {i.name}
                {i.sintaccVariedad ? <em> · 🌾 {i.sintaccVariedad}</em> : null}
                {i.medallon ? <em> · 🌿 {i.medallon}</em> : null}
                {i.note     ? <em> · {i.note}</em>        : null}
              </span>
              <span className="checkout-row-price">{formatARS(parsePrice(i.price) * i.qty)}</span>
            </div>
          ))}
          {entrega === 'envio' && zona && (
            <div className="checkout-row checkout-row--envio">
              <span className="checkout-row-qty">+</span>
              <span className="checkout-row-name">Envío ({zona === 'local' ? 'Dentro del Talar' : 'Fuera del Talar'})</span>
              <span className="checkout-row-price checkout-row-price--envio">{formatARS(costoEnvio)}</span>
            </div>
          )}
          <div className="checkout-total-row">
            <span>{entrega === 'envio' && zona ? 'Total c/ envío' : 'Total'}</span>
            <span className="checkout-total-price">{formatARS(total)}</span>
          </div>
        </div>

        <div className="checkout-divider" />

        <label className="checkout-label">
          Nombre y apellido <span className="req">*</span>
          <input className={`checkout-input${errors.name ? ' has-error' : ''}`} placeholder="¿Cómo te llamás?" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <span className="checkout-error">{errors.name}</span>}
        </label>
        <label className="checkout-label">
          Teléfono <span className="req">*</span>
          <input className={`checkout-input${errors.phone ? ' has-error' : ''}`} placeholder="Medio de contacto" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          {errors.phone && <span className="checkout-error">{errors.phone}</span>}
        </label>

        <div className="checkout-divider" />

        <div className="checkout-section-label">Forma de entrega <span className="req">*</span></div>
        <div className="checkout-opts">
          <Opt active={entrega === 'retiro'} onClick={() => { setEntrega('retiro'); setDireccion(''); setZona(''); }}>Lo retiro personalmente</Opt>
          <Opt active={entrega === 'envio'}  onClick={() => setEntrega('envio')}>Necesito que me lo envíen</Opt>
        </div>
        {errors.entrega && <span className="checkout-error">{errors.entrega}</span>}

        {entrega === 'envio' && (
          <div className="checkout-address-wrap">
            <label className="checkout-label">
              Tu dirección <span className="req">*</span>
              <input className={`checkout-input${errors.direccion ? ' has-error' : ''}`} placeholder="Ej: Av. Rivadavia 1234" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
              {errors.direccion && <span className="checkout-error">{errors.direccion}</span>}
            </label>
            <button
              type="button"
              className={`verify-location-btn${!direccion.trim() ? ' verify-location-btn--off' : ''}`}
              disabled={!direccion.trim()}
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion.trim())}`, '_blank', 'noopener,noreferrer')}
            >
              <span className="verify-location-icon">📍</span>
              Verificar ubicación en Maps
            </button>
            <div className="checkout-zona-label">Zona de envío <span className="req">*</span></div>
            <div className="checkout-zona-opts">
              <Opt active={zona === 'local'} onClick={() => setZona('local')}>
                <span className="zona-opt-name">📍 Dentro del Talar</span>
                <span className="zona-opt-price">{formatARS(COSTO_ENVIO.local)}</span>
              </Opt>
              <Opt active={zona === 'fuera'} onClick={() => setZona('fuera')}>
                <span className="zona-opt-name">🏠 Fuera del Talar</span>
                <span className="zona-opt-price">{formatARS(COSTO_ENVIO.fuera)}</span>
              </Opt>
            </div>
            {errors.zona && <span className="checkout-error">{errors.zona}</span>}
          </div>
        )}

        <div className="checkout-divider" />

        <div className="checkout-section-label">Forma de pago <span className="req">*</span></div>
        <div className="checkout-opts">
          <Opt active={pago === 'efectivo'} onClick={() => { setPago('efectivo'); setVuelto(''); }}>Efectivo</Opt>
          <Opt active={pago === 'tarjeta'}  onClick={() => setPago('tarjeta')}>Tarjeta</Opt>
          <Opt active={pago === 'mp'}       onClick={() => setPago('mp')}>Transferencia</Opt>
        </div>
        {errors.pago && <span className="checkout-error">{errors.pago}</span>}

        {pago === 'efectivo' && (
          <label className="checkout-label">
            ¿Con cuánto pagás?
            <input className="checkout-input" placeholder={`Ej: ${formatARS(Math.ceil(total / 500) * 500)}`} value={vuelto} onChange={(e) => setVuelto(e.target.value)} inputMode="numeric" />
          </label>
        )}

        <button className="checkout-send-btn" onClick={handleSend}>📲 Pedir por WhatsApp</button>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
//  🎯 ITEMS PRINCIPAL
// ════════════════════════════════════════════════════════════

export default function Items({
  menuKey, onNavigate,
  cart, onCartAdd, onCartRemove, onCartClear,
  showCheckout, onOpenCheckout, onCloseCheckout,
  cartOpen, onOpenCart, onCloseCart,
}) {
  const [expandedKey, setExpandedKey] = useState(null);

  const isPostres   = menuKey === 'postres';
  const isCafeteria = menuKey === 'cafeteria';
  const data        = (isPostres || isCafeteria) ? null      : MENU[menuKey];
  const items       = isCafeteria ? CAFETERIA : isPostres ? POSTRES   : data?.items ?? [];
  const title       = isCafeteria ? 'Cafetería' : isPostres ? 'Postres' : data?.title ?? '';
  const backScreen  = (isPostres || isCafeteria) ? 'home'    : (data?.back ?? 'home');

  const handleConfirmAdd = useCallback(({ qty, note, medallon, ...item }) => {
    const key = item.name + '||' + (note || '') + '||' + (medallon || '');
    onCartAdd({ ...item, qty, note: note || '', medallon: medallon || '', _key: key });
  }, [onCartAdd]);

  if (showCheckout) {
    return <CheckoutScreen cart={cart} onBack={onCloseCheckout} onClear={onCartClear} />;
  }

  return (
    <div className="screen-body" style={{ paddingBottom: 32 }}>
      <div className="back-row">
        <button className="back-btn" onClick={() => onNavigate(backScreen)}>← Volver</button>
        <span className="screen-title">
          <RevealText as="span">{title}</RevealText>
        </span>
      </div>

      <div className="items-list">
        {items.map((item, i) => {
          if (item.sep) {
            return <p key={`sep-${i}`} className="section-sep">{item.sep}</p>;
          }
          return (
            <ExpandableItemCard
              key={`${item.name}-${i}`}
              item={item}
              isExpanded={expandedKey === item.name}
              onToggle={setExpandedKey}
              onCartAdd={handleConfirmAdd}
            />
          );
        })}
      </div>

      {cartOpen && (
        <CartPanel
          cart={cart}
          onClose={onCloseCart}
          onCartAdd={handleConfirmAdd}
          onCartRemove={onCartRemove}
          onCartClear={onCartClear}
          onCheckout={() => { onCloseCart(); onOpenCheckout(); }}
        />
      )}

      {expandedKey !== null && (
        <button
          className={`cart-fab-fixed${cart.reduce((s,i)=>s+i.qty,0) === 0 ? ' cart-fab-fixed--empty' : ' cart-fab-fixed--active'}`}
          onClick={onOpenCart}
          aria-label="Carrito"
        >
          <span className="cart-fab-fixed-icon">🛒</span>
          <span className={`cart-fab-fixed-badge${cart.reduce((s,i)=>s+i.qty,0) === 0 ? ' zero' : ''}`}>
            {cart.reduce((s,i)=>s+i.qty,0)}
          </span>
        </button>
      )}
    </div>
  );
}
