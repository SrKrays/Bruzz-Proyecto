import { useState, useCallback, useRef, useEffect } from 'react';
import { MENU, POSTRES } from './menuData';

const WHATSAPP_NUMBER = 543543512248;

// ── Medallones de la Veggie ───────────────────────────────
const MEDALLONES = [
  { id: 'remolacha', name: 'Remolacha',  desc: 'Base de remolacha, avena y especias. Jugoso y colorido.' },
  { id: 'quinoa',    name: 'Quinoa',     desc: 'Mezcla de quinoa, zanahoria y hierbas. Liviano y proteico.' },
  { id: 'garbanzo',  name: 'Garbanzo',   desc: 'Hummus base con especias mediterráneas. Cremoso y sabroso.' },
  { id: 'lentejas',  name: 'Lentejas',   desc: 'Lentejas rojas, cúrcuma y jengibre. Muy nutritivo.' },
  { id: 'portobello',name: 'Portobello', desc: 'Champiñón portobello grillado con ajo y romero. Umami puro.' },
];

// ── Helpers ───────────────────────────────────────────────
function parsePrice(priceStr) {
  return parseFloat((priceStr || '0').replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}

function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}


function formatDate() {
  const d   = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${String(d.getFullYear()).slice(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}hs`;
}


// ════════════════════════════════════════════════════════════
//  🛒 CART FAB — siempre visible en lateral
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
      <span className={`cart-fab-header-badge${isEmpty ? ' zero' : ''}`}>{totalItems}</span>
    </button>
  );
}


// ════════════════════════════════════════════════════════════
//  🛒 PANEL LATERAL DEL CARRITO
// ════════════════════════════════════════════════════════════

export function CartPanel({ cart, onClose, onCartAdd, onCartRemove, onCartClear, onCheckout }) {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0);
  const isEmpty    = totalItems === 0;

  return (
    <>
      <div className="cart-panel-backdrop" onClick={onClose} />
      <div className="cart-panel">
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
                  {item.note && (
                    <p className="cart-panel-item-note">↳ {item.note}</p>
                  )}
                  {item.medallon && (
                    <p className="cart-panel-item-note">🌿 {item.medallon}</p>
                  )}
                  <div className="cart-panel-item-controls">
                    <button
                      className="cart-panel-ctrl"
                      onClick={() => onCartRemove(item._key)}
                      aria-label="Quitar uno"
                    >−</button>
                    <span className="cart-panel-item-qty">{item.qty}</span>
                    <button
                      className="cart-panel-ctrl"
                      onClick={() => onCartAdd({ ...item, qty: 1, note: item.note || '', medallon: item.medallon || '' })}
                      aria-label="Sumar uno"
                    >+</button>
                    <button
                      className="cart-panel-del"
                      onClick={() => {
                        for (let i = 0; i < item.qty; i++) onCartRemove(item._key);
                      }}
                      aria-label="Eliminar"
                    >🗑</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-panel-total">
              <span>Total</span>
              <span className="cart-panel-total-price">{formatARS(totalPrice)}</span>
            </div>

            <button className="cart-panel-order-btn" onClick={onCheckout}>
              📲 Confirmar pedido
            </button>

            <button className="cart-panel-clear" onClick={onCartClear}>
              Vaciar carrito
            </button>
          </>
        )}
      </div>
    </>
  );
}


// ════════════════════════════════════════════════════════════
//  🥗 SELECTOR DE MEDALLÓN (solo para Veggie)
// ════════════════════════════════════════════════════════════

function MedallonSelector({ qty, selected, onChange, error }) {
  // selected = { [id]: count } — permite múltiples del mismo
  const totalSelected = Object.values(selected).reduce((s, n) => s + n, 0);

  const add = (id) => {
    if (totalSelected >= qty) return;
    onChange({ ...selected, [id]: (selected[id] || 0) + 1 });
  };

  const remove = (id) => {
    if (!selected[id]) return;
    const next = { ...selected, [id]: selected[id] - 1 };
    if (next[id] === 0) delete next[id];
    onChange(next);
  };

  return (
    <div className="medallon-wrap">
      <div className="medallon-header">
        <span className="medallon-label">
          <span>🌿</span> Elegí tu medallón
        </span>
        <span className="medallon-counter">
          {totalSelected}/{qty} seleccionado{qty !== 1 ? 's' : ''}
        </span>
      </div>
      {error && <p className="medallon-error">⚠ {error}</p>}
      <div className="medallon-list">
        {MEDALLONES.map((m) => {
          const count    = selected[m.id] || 0;
          const isActive = count > 0;
          const canAdd   = totalSelected < qty;
          return (
            <div
              key={m.id}
              className={`medallon-opt${isActive ? ' medallon-opt--active' : ''}${!canAdd && !isActive ? ' medallon-opt--disabled' : ''}`}
            >
              <div className="medallon-opt-text" onClick={() => canAdd && add(m.id)}>
                <span className="medallon-opt-name">{m.name}</span>
                <span className="medallon-opt-desc">{m.desc}</span>
              </div>
              <div className="medallon-opt-controls">
                {isActive && (
                  <button type="button" className="medallon-ctrl" onClick={() => remove(m.id)} aria-label="Quitar">−</button>
                )}
                {isActive && (
                  <span className="medallon-ctrl-count">{count}</span>
                )}
                <button
                  type="button"
                  className={`medallon-ctrl medallon-ctrl--add${!canAdd ? ' medallon-ctrl--off' : ''}`}
                  onClick={() => add(m.id)}
                  disabled={!canAdd}
                  aria-label="Agregar"
                >+</button>
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
// ════════════════════════════════════════════════════════════

function ExpandableItemCard({ item, isExpanded, onToggle, onCartAdd }) {
  const isVeggie    = item.name === 'Veggie';
  const [qty, setQty]              = useState(1);
  const [note, setNote]            = useState('');
  const [medallones, setMedallones] = useState({});
  const [medallonError, setMedallonError] = useState('');
  const MAX_NOTE = 150;
  const unitPrice = parsePrice(item.price);
  const bodyRef   = useRef(null);

  // reset cuando se cierra
  useEffect(() => {
    if (!isExpanded) {
      setQty(1);
      setNote('');
      setMedallones({});
      setMedallonError('');
    }
  }, [isExpanded]);

  const handleAdd = () => {
    if (isVeggie) {
      const totalSelected = Object.values(medallones).reduce((s, n) => s + n, 0);
      if (totalSelected < qty) {
        setMedallonError(`Seleccioná ${qty} medallón${qty > 1 ? 'es' : ''} para continuar`);
        return;
      }
    }
    // Armar label: "2x Remolacha, 1x Quinoa"
    const medallonLabel = Object.entries(medallones)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => {
        const name = MEDALLONES.find((m) => m.id === id)?.name ?? id;
        return n > 1 ? `${n}x ${name}` : name;
      })
      .join(', ');
    onCartAdd({ ...item, qty, note: note.trim(), medallon: medallonLabel });
    onToggle(null);
  };

  return (
    <div
      className={`exp-card${isExpanded ? ' exp-card--open' : ''}`}
      style={{ animationDelay: '0ms' }}
    >
      {/* ── Cabecera siempre visible ── */}
      <div className="exp-card-head" onClick={() => onToggle(isExpanded ? null : item.name)}>
        {item.imageUrl && (
          <div className="exp-card-thumb">
            <img src={item.imageUrl} alt={item.name} />
          </div>
        )}
        <div className="exp-card-head-info">
          <span className="exp-card-name">
            {item.name}
            {item.badge && <span className="badge">{item.badge}</span>}
          </span>
          {item.desc && !isExpanded && (
            <p className="exp-card-desc-preview">{item.desc}</p>
          )}
        </div>
        <div className="exp-card-head-right">
          <span className="exp-card-price">{item.price}</span>
          <span className={`exp-card-chevron${isExpanded ? ' exp-card-chevron--open' : ''}`}>
            ›
          </span>
        </div>
      </div>

      {/* ── Cuerpo expandible ── */}
      <div
        className="exp-card-body"
        ref={bodyRef}
        style={{
          maxHeight: isExpanded ? '900px' : '0px',
          opacity:   isExpanded ? 1 : 0,
        }}
      >
        <div className="exp-card-body-inner">
          {/* Imagen grande */}
          {item.imageUrl && (
            <div className="exp-card-img-wrap">
              <img src={item.imageUrl} alt={item.name} className="exp-card-img" />
              <div className="exp-card-img-grad" />
            </div>
          )}

          {/* Descripción */}
          {item.desc && (
            <p className="exp-card-full-desc">{item.desc}</p>
          )}

          {/* Selector medallón (solo Veggie) */}
          {isVeggie && (
            <MedallonSelector
              qty={qty}
              selected={medallones}
              onChange={(sel) => { setMedallones(sel); setMedallonError(''); }}
              error={medallonError}
            />
          )}

          {/* Observaciones */}
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

          {/* Footer qty + botón */}
          <div className="exp-footer">
            <div className="exp-qty-row">
              <button className="exp-qty-btn" onClick={() => {
                const newQty = Math.max(1, qty - 1);
                setQty(newQty);
                if (isVeggie) {
                  // recortar medallones hasta newQty total
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
            <button className="exp-add-btn" onClick={handleAdd}>
              Agregar · {formatARS(unitPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
//  🧾 CHECKOUT
// ════════════════════════════════════════════════════════════

const COSTO_ENVIO = { local: 2000, fuera: 3500 };

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
    if (!name.trim())                              e.name      = 'Ingresá tu nombre';
    if (!phone.trim())                             e.phone     = 'Ingresá tu teléfono';
    if (!entrega)                                  e.entrega   = 'Seleccioná una opción';
    if (!pago)                                     e.pago      = 'Seleccioná una opción';
    if (entrega === 'envio' && !direccion.trim())  e.direccion = 'Ingresá tu dirección';
    if (entrega === 'envio' && !zona)              e.zona      = 'Seleccioná la zona';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;
    const fecha         = formatDate();
    const mapsUrl       = entrega === 'envio' && direccion.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion.trim())}`
      : null;

    const entregaLabel = entrega === 'retiro'
      ? 'Retira personalmente'
      : `Envío — ${direccion.trim()}${mapsUrl ? `\n   📍 ${mapsUrl}` : ''}`;
    const zonaLabel    = zona === 'local' ? 'Dentro del Talar' : zona === 'fuera' ? 'Fuera del Talar' : '';
    const pagoLabel    = pago === 'efectivo'
      ? `Efectivo${vuelto.trim() ? ` (abona con ${vuelto.trim()})` : ''}`
      : pago === 'tarjeta' ? 'Tarjeta débito/crédito' : 'Mercado Pago';

    const lines      = cart.map((i) => {
      let txt = `${i.qty}x ${i.name}: ${i.price}`;
      if (i.medallon) txt += `\n   🌿 Medallón: ${i.medallon}`;
      if (i.note)     txt += `\n   ↳ ${i.note}`;
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

    window.open(`https://wa.me/${543543512248}?text=${encodeURIComponent(body)}`, '_blank');
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

            {/* Botón verificar ubicación en Maps */}
            <button
              type="button"
              className={`verify-location-btn${!direccion.trim() ? ' verify-location-btn--off' : ''}`}
              disabled={!direccion.trim()}
              onClick={() => {
                const query = encodeURIComponent(direccion.trim());
                // geo: funciona en Android; maps: en iOS; fallback web para PC
                const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
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
          <Opt active={pago === 'mp'}       onClick={() => setPago('mp')}>Mercado Pago</Opt>
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

  const isPostres  = menuKey === 'postres';
  const data       = isPostres ? null     : MENU[menuKey];
  const items      = isPostres ? POSTRES  : data?.items ?? [];
  const title      = isPostres ? 'Postres': data?.title ?? '';
  const backScreen = isPostres ? 'home'   : (data?.back ?? 'home');

  const handleConfirmAdd = useCallback(({ qty, note, medallon, ...item }) => {
    const key = item.name + '||' + (note || '') + '||' + (medallon || '');
    onCartAdd({ ...item, qty, note: note || '', medallon: medallon || '', _key: key });
  }, [onCartAdd]);

  if (showCheckout) {
    return <CheckoutScreen cart={cart} onBack={onCloseCheckout} onClear={onCartClear} />;
  }

  return (
    <div className="screen-body fade-up" style={{ paddingBottom: 32 }}>

      {/* ── Back row ── */}
      <div className="back-row">
        <button className="back-btn" onClick={() => onNavigate(backScreen)}>← Volver</button>
        <span className="screen-title">{title}</span>
      </div>

      {/* ── Lista de items ── */}
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

      {/* ── Panel carrito ── */}
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

      {/* ── FAB carrito fijo — solo visible cuando hay card expandido ── */}
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
