// ============================================================
//  Items.jsx — v4.0
//
//  ✅ 1. Modal detalle: fixed centrado (no bottom-sheet)
//  ✅ 2. Barra "Ver mi pedido": fixed bottom siempre visible
//  ✅ 3. Efectivo → input "¿Con cuánto pagás?"
//  ✅ 4. Envío → campo dirección + botón Google Maps
//  ✅ 5. Sin cupón de descuento
// ============================================================

import { useState, useCallback } from 'react';
import { MENU, POSTRES } from './menuData';

const WHATSAPP_NUMBER = '5493513000000'; // ← reemplazar número real

// ── Helpers ───────────────────────────────────────────────
function generateOrderId() {
  const num  = Math.floor(10000 + Math.random() * 90000);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg  = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return { num, code: `${seg(4)}-${seg(4)}-${seg(4)}` };
}

function formatDate() {
  const d   = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${String(d.getFullYear()).slice(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}hs`;
}

function parsePrice(priceStr) {
  return parseFloat((priceStr || '0').replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}

function formatARS(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

// ── MODAL DETALLE DEL ITEM ────────────────────────────────
function ItemDetailModal({ item, onClose, onConfirm }) {
  const [qty,  setQty]  = useState(1);
  const [note, setNote] = useState('');
  const MAX_NOTE = 150;

  const unitPrice = parsePrice(item.price);
  const total     = unitPrice * qty;

  const handleAdd = () => {
    onConfirm({ ...item, qty, note: note.trim() });
    onClose();
  };

  return (
    <div className="detail-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>

        <button className="detail-close" onClick={onClose}>✕</button>

        {item.imageUrl && (
          <div className="detail-img-wrap">
            <img src={item.imageUrl} alt={item.name} className="detail-img" />
            <div className="detail-img-gradient" />
          </div>
        )}

        <div className="detail-body">
          <h2 className="detail-title">{item.name}</h2>
          {item.desc && <p className="detail-desc">{item.desc}</p>}
          <p className="detail-price">{formatARS(unitPrice)}</p>

          <div className="detail-obs-label">
            <span>Observaciones</span>
            <span className="detail-obs-count">{note.length} / {MAX_NOTE}</span>
          </div>
          <textarea
            className="detail-textarea"
            placeholder="Si querés, ingresá una observación para que la tengan en cuenta en tu pedido (máximo 150 caracteres)."
            maxLength={MAX_NOTE}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />

          <div className="detail-footer">
            <div className="detail-qty-row">
              <button className="detail-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="detail-qty-val">{qty}</span>
              <button className="detail-qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <button className="detail-add-btn" onClick={handleAdd}>
              Agregar · {formatARS(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CHIP COMPACTO "Mi pedido" para el HEADER ─────────────
export function CartChip({ cart, onOpen }) {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0);
  if (totalItems === 0) return null;

  return (
    <button className="cart-chip" onClick={onOpen} aria-label="Ver mi pedido">
      <span className="cart-chip-icon">🛒</span>
      <span className="cart-chip-badge">{totalItems}</span>
      <span className="cart-chip-total">{formatARS(totalPrice)}</span>
    </button>
  );
}

// ── BARRA VERDE FIJA "Ver mi pedido" (mantenida por compatibilidad) ─────────────────────
function CartBar({ cart, onOpen }) {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0);
  if (totalItems === 0) return null;

  return (
    <div className="cart-bar" onClick={onOpen}>
      <div className="cart-bar-bump" />
      <div className="cart-bar-inner">
        <span className="cart-bar-badge">{totalItems}</span>
        <span className="cart-bar-label">Ver mi pedido</span>
        <span className="cart-bar-total">{formatARS(totalPrice)}</span>
      </div>
    </div>
  );
}

// ── PANTALLA CHECKOUT ─────────────────────────────────────
const COSTO_ENVIO = {
  local:  2000,   // dentro del local/área cercana
  fuera:  3500,   // fuera del local
};

function CheckoutScreen({ cart, onBack, onClear }) {
  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [entrega,   setEntrega]   = useState('');
  const [zona,      setZona]      = useState('');   // 'local' | 'fuera'
  const [pago,      setPago]      = useState('');
  const [vuelto,    setVuelto]    = useState('');
  const [direccion, setDireccion] = useState('');
  const [errors,    setErrors]    = useState({});

  const subtotal   = cart.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0);
  const costoEnvio = entrega === 'envio' && zona ? COSTO_ENVIO[zona] : 0;
  const total      = subtotal + costoEnvio;

  const handleOpenMaps = () => {
    if (!direccion.trim()) return;
    const query = encodeURIComponent(direccion.trim());
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const validate = () => {
    const e = {};
    if (!name.trim())                                        e.name      = 'Ingresá tu nombre';
    if (!phone.trim())                                       e.phone     = 'Ingresá tu teléfono';
    if (!entrega)                                            e.entrega   = 'Seleccioná una opción';
    if (!pago)                                               e.pago      = 'Seleccioná una opción';
    if (entrega === 'envio' && !direccion.trim())            e.direccion = 'Ingresá tu dirección';
    if (entrega === 'envio' && !zona)                        e.zona      = 'Seleccioná la zona de envío';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;

    const { num, code } = generateOrderId();
    const fecha         = formatDate();

    const mapsUrl = entrega === 'envio' && direccion.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion.trim())}`
      : null;

    const entregaLabel = entrega === 'retiro'
      ? 'Retira personalmente'
      : `Envío a domicilio — ${direccion.trim()}${mapsUrl ? `\n   📍 ${mapsUrl}` : ''}`;

    const zonaLabel = zona === 'local'
      ? 'Zona local (dentro del área)'
      : zona === 'fuera'
      ? 'Fuera del local'
      : '';

    const pagoLabel = pago === 'efectivo'
      ? `Efectivo${vuelto.trim() ? ` (abona con ${vuelto.trim()})` : ''}`
      : pago === 'tarjeta' ? 'Tarjeta débito/crédito' : 'Mercado Pago';

    const lines = cart.map((i) => {
      let txt = `${i.qty}x ${i.name}: ${i.price}`;
      if (i.note) txt += `\n   ↳ ${i.note}`;
      return txt;
    });

    const totalLines = entrega === 'envio'
      ? [
          `Subtotal productos: ${formatARS(subtotal)}`,
          `Costo de envío (${zonaLabel}): + ${formatARS(costoEnvio)}`,
          `TOTAL A PAGAR: ${formatARS(total)}`,
        ]
      : [`TOTAL: ${formatARS(total)}`];

    const body = [
      '¡Hola! Te paso el resumen de mi pedido 🍕',
      '',
      `Pedido: #${num} / ${code}`,
      `Tienda: Bruzz Pizza & Beer`,
      `Fecha: ${fecha}`,
      `Nombre: ${name.trim()}`,
      `Teléfono: ${phone.trim()}`,
      `Forma de pago: ${pagoLabel}`,
      `Entrega: ${entregaLabel}`,
      ...(entrega === 'envio' ? [`Zona de envío: ${zonaLabel}`] : []),
      '',
      'Mi pedido:',
      ...lines,
      '',
      ...totalLines,
      '',
      'Espero tu respuesta para confirmar mi pedido 🙌',
    ].join('\n');

    const url = `https://wa.me/${3543630784}?text=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
    onClear();
    onBack();
  };

  const OptionBtn = ({ active, onClick, children }) => (
    <button
      type="button"
      className={`checkout-opt-btn${active ? ' active' : ''}`}
      onClick={onClick}
    >
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

        {/* Resumen */}
        <div className="checkout-summary">
          {cart.map((i, idx) => (
            <div key={idx} className="checkout-row">
              <span className="checkout-row-qty">{i.qty}×</span>
              <span className="checkout-row-name">
                {i.name}
                {i.note ? <em> · {i.note}</em> : null}
              </span>
              <span className="checkout-row-price">{formatARS(parsePrice(i.price) * i.qty)}</span>
            </div>
          ))}

          {/* Costo de envío — solo aparece cuando ya eligió zona */}
          {entrega === 'envio' && zona && (
            <div className="checkout-row checkout-row--envio">
              <span className="checkout-row-qty">+</span>
              <span className="checkout-row-name">
                Envío {zona === 'local' ? '(zona local)' : '(fuera del local)'}
              </span>
              <span className="checkout-row-price checkout-row-price--envio">{formatARS(costoEnvio)}</span>
            </div>
          )}

          <div className="checkout-total-row">
            <span>{entrega === 'envio' && zona ? 'Total c/ envío' : 'Total'}</span>
            <span className="checkout-total-price">{formatARS(total)}</span>
          </div>
        </div>

        <div className="checkout-divider" />

        {/* Nombre */}
        <label className="checkout-label">
          Nombre y apellido <span className="req">*</span>
          <input
            className={`checkout-input${errors.name ? ' has-error' : ''}`}
            placeholder="Necesitamos saber cómo te llamás"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <span className="checkout-error">{errors.name}</span>}
        </label>

        {/* Teléfono */}
        <label className="checkout-label">
          Teléfono <span className="req">*</span>
          <input
            className={`checkout-input${errors.phone ? ' has-error' : ''}`}
            placeholder="Necesitamos un medio de contacto"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
          />
          {errors.phone && <span className="checkout-error">{errors.phone}</span>}
        </label>

        <div className="checkout-divider" />

        {/* Forma de entrega */}
        <div className="checkout-section-label">
          Forma de entrega <span className="req">*</span>
        </div>
        <div className="checkout-opts">
          <OptionBtn active={entrega === 'retiro'} onClick={() => { setEntrega('retiro'); setDireccion(''); setZona(''); }}>
            Lo retiro personalmente
          </OptionBtn>
          <OptionBtn active={entrega === 'envio'} onClick={() => setEntrega('envio')}>
            Necesito que me lo envíen
          </OptionBtn>
        </div>
        {errors.entrega && <span className="checkout-error">{errors.entrega}</span>}

        {/* Dirección — solo si envío */}
        {entrega === 'envio' && (
          <div className="checkout-address-wrap">
            <label className="checkout-label">
              Tu dirección <span className="req">*</span>
              <input
                className={`checkout-input${errors.direccion ? ' has-error' : ''}`}
                placeholder="Ej: Av. Rivadavia 1234, Córdoba"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
              {errors.direccion && <span className="checkout-error">{errors.direccion}</span>}
            </label>
            <button
              type="button"
              className={`checkout-maps-btn${!direccion.trim() ? ' disabled' : ''}`}
              onClick={handleOpenMaps}
            >
              📍 Ver en Google Maps
            </button>

            {/* Zona de envío */}
            <div className="checkout-zona-label">
              Zona de envío <span className="req">*</span>
            </div>
            <div className="checkout-zona-opts">
              <OptionBtn active={zona === 'local'} onClick={() => setZona('local')}>
                <span className="zona-opt-name">📍 Dentro del Talar</span>
                <span className="zona-opt-price">{formatARS(COSTO_ENVIO.local)}</span>
              </OptionBtn>
              <OptionBtn active={zona === 'fuera'} onClick={() => setZona('fuera')}>
                <span className="zona-opt-name">🏠 Fuera del Talar</span>
                <span className="zona-opt-price">{formatARS(COSTO_ENVIO.fuera)}</span>
              </OptionBtn>
            </div>
            {errors.zona && <span className="checkout-error">{errors.zona}</span>}

            <p className="checkout-maps-hint">
              El local verificará tu ubicación antes de confirmar el envío.
            </p>
          </div>
        )}

        <div className="checkout-divider" />

        {/* Forma de pago */}
        <div className="checkout-section-label">
          Forma de pago <span className="req">*</span>
        </div>
        <div className="checkout-opts">
          <OptionBtn active={pago === 'efectivo'} onClick={() => { setPago('efectivo'); setVuelto(''); }}>
            Efectivo
          </OptionBtn>
          <OptionBtn active={pago === 'tarjeta'} onClick={() => setPago('tarjeta')}>
            Tarjeta débito/crédito
          </OptionBtn>
          <OptionBtn active={pago === 'mp'} onClick={() => setPago('mp')}>
            Mercado Pago
          </OptionBtn>
        </div>
        {errors.pago && <span className="checkout-error">{errors.pago}</span>}

        {/* Vuelto — solo si efectivo */}
        {pago === 'efectivo' && (
          <div className="checkout-vuelto-wrap">
            <label className="checkout-label">
              ¿Con cuánto vas a pagar?
              <input
                className="checkout-input"
                placeholder={`Ej: ${formatARS(Math.ceil(total / 500) * 500)}`}
                value={vuelto}
                onChange={(e) => setVuelto(e.target.value)}
                inputMode="numeric"
              />
            </label>
            <p className="checkout-maps-hint">Opcional — nos ayuda a preparar el cambio.</p>
          </div>
        )}

        {/* Enviar */}
        <button className="checkout-send-btn" onClick={handleSend}>
          📲 Pedir por WhatsApp
        </button>

      </div>
    </div>
  );
}

// ── CARD CON IMAGEN ───────────────────────────────────────
function ItemCardWithImage({ item, delay, onOpen }) {
  return (
    <div
      className="item-card item-card--img"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onOpen(item)}
    >
      <div className="item-img-wrap">
        <img src={item.imageUrl} alt={item.name} className="item-img" />
        <div className="item-img-overlay" />
      </div>
      <div className="item-info">
        <div className="item-row">
          <span className="item-name">
            {item.name}
            {item.badge && <span className="badge">{item.badge}</span>}
          </span>
          <span className="item-price">{item.price}</span>
        </div>
        {item.desc && <p className="item-desc">{item.desc}</p>}
        <button
          className="item-cart-btn"
          onClick={(e) => { e.stopPropagation(); onOpen(item); }}
        >
          🛒 Agregar
        </button>
      </div>
    </div>
  );
}

// ── CARD SIN IMAGEN ───────────────────────────────────────
function ItemCard({ item, delay, onOpen }) {
  return (
    <div
      className="item-card"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onOpen(item)}
    >
      <div className="item-row">
        <span className="item-name">
          {item.name}
          {item.badge && <span className="badge">{item.badge}</span>}
        </span>
        <span className="item-price">{item.price}</span>
      </div>
      {item.desc && <p className="item-desc">{item.desc}</p>}
      <button
        className="item-cart-btn"
        onClick={(e) => { e.stopPropagation(); onOpen(item); }}
      >
        🛒 Agregar
      </button>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────
export default function Items({ menuKey, onNavigate, cart, onCartAdd, onCartRemove, onCartClear, showCheckout, onOpenCheckout, onCloseCheckout }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const isPostres  = menuKey === 'postres';
  const data       = isPostres ? null      : MENU[menuKey];
  const items      = isPostres ? POSTRES   : data?.items ?? [];
  const title      = isPostres ? 'Postres' : data?.title ?? '';
  const backScreen = isPostres ? 'home'    : (data?.back ?? 'home');

  const handleConfirmAdd = useCallback(({ qty, note, ...item }) => {
    onCartAdd({ ...item, qty, note });
  }, [onCartAdd]);

  if (showCheckout) {
    return (
      <CheckoutScreen
        cart={cart}
        onBack={onCloseCheckout}
        onClear={onCartClear}
      />
    );
  }

  let cardIndex = 0;

  return (
    <div className="screen-body fade-up" style={{ paddingBottom: cart.length ? 90 : 24 }}>

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

          if (item.imageUrl) {
            return (
              <ItemCardWithImage
                key={`${item.name}-${i}`}
                item={item}
                delay={delay}
                onOpen={setSelectedItem}
              />
            );
          }
          return (
            <ItemCard
              key={`${item.name}-${i}`}
              item={item}
              delay={delay}
              onOpen={setSelectedItem}
            />
          );
        })}
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleConfirmAdd}
        />
      )}

    </div>
  );
}
