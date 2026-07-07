// ============================================================
//  Promos.jsx — Pantalla de Promos (v5.4)
//
//  Orden de secciones: Countdown → Pintas → Promos Dely →
//  Promos de la semana (cards con imagen adelante, que se dan
//  vuelta al tocarlas) → Más promos de la casa (al final).
//
//  - Countdown: estático (no cuenta) antes de las 20:00 — solo
//    anuncia el horario. Arranca la cuenta regresiva real recién
//    a las 20:00. Al llegar a las 22:00 se congela en 00:00:00
//    y se queda así hasta el día siguiente (no desaparece).
//  - Pintas: enlazan a Bebidas → Cervezas y llevan tag
//    "Happy Hour".
//  - Promos Dely: carrusel de una sola card que rota (swipe +
//    autoplay + puntitos). Al tocar la card se arma un mensaje
//    de WhatsApp automático con esa promo y se manda, con el
//    mismo mecanismo que usa el carrito (Items.jsx → wa.me).
//  - Promos de la semana: frente = imagen + gancho corto (ej
//    "3x2"), tocar la card la da vuelta (flip 3D) y muestra
//    atrás la descripción completa + condición de pago.
//  - Cada sección tiene un label con ícono + línea divisoria
//    dorada para dar más identidad visual al panel.
//
//  ⚠️ DATOS DE EJEMPLO — esto todavía no lee de menuData.js.
//  Reemplazar los arrays de ejemplo por el import real cuando
//  conectemos el backend (ver nota al final del archivo).
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RevealText from './RevealText';
import { launchConfetti } from './confettiCheckout';

// ⚠️ Mismo número que usa el carrito en Items.jsx. Están
// duplicados a propósito para no acoplar los dos archivos —
// si el número cambia, actualizar en los dos lugares (o, más
// adelante, moverlo a un archivo de constantes compartido).
const WHATSAPP_NUMBER = 543543512248;

// ── Paleta de color para las cards (ciclo fijo por posición) ──
// Se asigna automáticamente, el admin no elige color ni tamaño.
const PALETA = ['verde', 'crema', 'dorado', 'marron'];

// ── Datos de ejemplo — simulan lo que vendría de PROMOS en menuData.js

const PROMOS_EJEMPLO = [
  {
    id: 2,
    titulo: 'Happy Hour',
    desc: 'Happy en cualquiera de las pintas que veas',
    precio: '',
    tag: '',
    activa: true,
    tipo: 'countdown',
    linkTo: 'cervezas', // menuKey real de la carta — navega a Items
    imageUrl: 'https://bruzz.com.ar/img/happyhour.png',
  },
  {
    id: 3,
    titulo: 'Reservas de para tus eventos',
    desc: 'Festejá con nosotros',
    precio: '',
    tag: '',
    activa: true,
    tipo: 'normal',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
  },
  {
    id: 7,
    titulo: 'Combos de hamburguesa',
    desc: 'Tocá para ver la carta',
    precio: '',
    tag: '',
    activa: true,
    tipo: 'normal',
    linkTo: 'hamburgesas', // menuKey real de la carta — navega a Items
    imageUrl: 'https://bruzz.com.ar/img/bambino2.png',

  },
  {
    id: 8,
    titulo: 'Combo Bladis',
    desc: '',
    precio: '',
    tag: '',
    activa: true,
    tipo: 'normal',
    linkTo: 'tragos', // menuKey real de la carta — navega a Items
    imageUrl: 'https://bruzz.com.ar/img/ferne.png',


  },
    {
    id: 9,
    titulo: 'Combo Bambino',
    desc: 'Pizza o Burger para los mas chicos',
    precio: '',
    tag: '',
    activa: true,
    tipo: 'normal',
    linkTo: 'tragos', // menuKey real de la carta — navega a Items
    imageUrl: 'https://bruzz.com.ar/img/bambino.png',


  },
];

// ── Pintas de ejemplo — fila vertical debajo de Happy Hour ──
// Enlazan a Bebidas → Cervezas (linkTo) y llevan tag para dejar
// claro que son parte de la promo Happy Hour.
const PINTAS_EJEMPLO = [
  { id: 'p1', titulo: 'Irish Red',   desc: 'Suave y dorada'   ,  imageUrl: 'https://bruzz.com.ar/img/roja.jpg', linkTo: 'cervezas', tag: 'Happy Hour' },
  { id: 'p2', titulo: 'Stout',     desc: 'Maltosa, color cobre' ,  imageUrl: 'https://bruzz.com.ar/img/negra.png', linkTo: 'cervezas', tag: 'Happy Hour' },
  { id: 'p3', titulo: 'American', desc: 'Lupulada, amargor marcado' ,  imageUrl: 'https://bruzz.com.ar/img/rubia.png', linkTo: 'cervezas', tag: 'Happy Hour' },
];

// ── Promos Dely — carrusel de una sola card que rota entre estas.
//    Al tocar una, se manda un pedido directo por WhatsApp con
//    esa promo (ver pedirPromoPorWhatsapp más abajo). ──────────
const PROMOS_DELY = [
  {
    id: 1,
    titulo: 'Promos Dely',
    desc: 'Cargá saldo y sumá beneficios cada mes',
    tag: 'NUEVO',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
  },
  {
    id: 2,
    titulo: '2x1 en Pizzas',
    desc: 'Todos los lunes por Dely, retiro en local',
    tag: 'Lunes',
    imageUrl: 'https://bruzz.com.ar/img/pepe.jpg',
  },
  {
    id: 3,
    titulo: 'Envío gratis',
    desc: 'En pedidos desde $30.000 dentro del Talar',
    tag: 'Dely',
    imageUrl: 'https://bruzz.com.ar/img/lomoamericano.jpg',
  },
  {
    id: 4,
    titulo: '15% off en Cervezas',
    desc: 'Baldes y litros pidiendo por la app',
    tag: 'Dely',
    imageUrl: 'https://bruzz.com.ar/img/imperial.jpg',
  },
];

// ── Promos semanales — cards con imagen adelante, se dan vuelta
//    al tocarlas. `imageUrl` + `titulo` van en el frente (gancho
//    corto sobre la foto). `desc` y `condicion` se ven atrás. ──
const PROMOS_SEMANALES = [
  { id: 'w1', dia: 'Martes',    titulo: '3x2',     desc: '3x2 en pintas de cerveza',       condicion: 'Efectivo o transferencia', imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
  { id: 'w2', dia: 'Miércoles', titulo: '50% OFF', desc: '50% en la segunda hamburguesa',  condicion: 'Efectivo o transferencia', imageUrl: 'https://bruzz.com.ar/img/hamburgesa.jpg' },
  { id: 'w3', dia: 'Jueves',    titulo: '20% OFF', desc: '20% en Sandwich de Ternera',      condicion: 'Efectivo o transferencia', imageUrl: 'https://bruzz.com.ar/img/ternera.jpg' },
];

// ── Entrada escalonada del mosaico ────────────────────────
const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatFechaHora() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}hs`;
}

// ── Arma el mensaje de WhatsApp para una promo de Dely y lo manda.
//    Mismo mecanismo que usa el carrito en Items.jsx (wa.me con
//    texto pre-armado) — acá simplificado a una sola promo, sin
//    el formulario de entrega/pago completo. Cuando conectemos
//    las promos reales, esto puede sumar precio/condiciones si
//    hace falta. ──────────────────────────────────────────────
function pedirPromoPorWhatsapp(promo) {
  const body = [
    '¡Hola! Quiero pedir esta promo 🛵',
    '',
    `Promo: ${promo.titulo}`,
    promo.desc ? `Detalle: ${promo.desc}` : null,
    '',
    `Fecha: ${formatFechaHora()}`,
    '',
    '¿Me confirmás disponibilidad?',
  ].filter((line) => line !== null).join('\n');

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`, '_blank');
}

// ════════════════════════════════════════════════════════════
//  📍 SECTION LABEL — ícono + texto + línea divisoria dorada
//     Da un poco más de identidad visual a cada bloque.
// ════════════════════════════════════════════════════════════
function PromoSectionLabel({ icon, children }) {
  return (
    <div className="promo-section-label">
      <span className="promo-section-icon">{icon}</span>
      <RevealText as="span">{children}</RevealText>
    </div>
  );
}

// ── Calcula en qué fase está el Happy Hour real (20:00–22:00) ──
// 'antes'   → estático, todavía no arrancó (no cuenta, solo anuncia)
// 'activo'  → cuenta regresiva real hasta las 22:00
// 'despues' → congelado en 00:00:00 hasta el día siguiente
function calcularEstadoHappyHour() {
  const ahora  = new Date();
  const inicio = new Date(ahora); inicio.setHours(20, 0, 0, 0);
  const fin    = new Date(ahora); fin.setHours(22, 0, 0, 0);

  if (ahora < inicio) {
    return { fase: 'antes', restante: { h: 2, m: 0, s: 0 } };
  }
  if (ahora < fin) {
    const diff = fin.getTime() - ahora.getTime();
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    return { fase: 'activo', restante: { h, m, s } };
  }
  return { fase: 'despues', restante: { h: 0, m: 0, s: 0 } };
}

// ════════════════════════════════════════════════════════════
//  ⏱ COUNTDOWN — bloque de Happy Hour, con horario real (20-22hs)
//     Estático antes de las 20, cuenta en vivo entre 20 y 22,
//     congelado en 00:00:00 después (hasta el día siguiente).
// ════════════════════════════════════════════════════════════
function PromoCountdown({ titulo, desc }) {
  const [estado, setEstado] = useState(() => calcularEstadoHappyHour());

  useEffect(() => {
    const id = setInterval(() => setEstado(calcularEstadoHappyHour()), 1000);
    return () => clearInterval(id);
  }, []);

  const label =
    estado.fase === 'antes'  ? `${titulo} empieza a las 20:00hs` :
    estado.fase === 'activo' ? `${titulo} termina en` :
    `${titulo} terminó por hoy`;

  return (
    <motion.div
      className={`promo-countdown${estado.fase !== 'activo' ? ' promo-countdown--static' : ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="promo-countdown-label">
        <RevealText as="span">{label}</RevealText>
      </p>
      <div className="promo-countdown-digits">
        <div className="promo-countdown-unit">
          <span className="promo-countdown-num">{pad2(estado.restante.h)}</span>
          <span className="promo-countdown-unit-label">Horas</span>
        </div>
        <div className="promo-countdown-unit">
          <span className="promo-countdown-num">{pad2(estado.restante.m)}</span>
          <span className="promo-countdown-unit-label">Min</span>
        </div>
        <div className="promo-countdown-unit">
          <span className="promo-countdown-num">{pad2(estado.restante.s)}</span>
          <span className="promo-countdown-unit-label">Seg</span>
        </div>
      </div>
      {desc && estado.fase === 'activo' && <p className="promo-countdown-desc">{desc}</p>}
      <p className="promo-countdown-horario">20:00 – 22:00</p>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  🟨 CARD UNIFICADA — usada en Pintas y en el bloque principal.
//     Borde dorado arriba, vertical, coloreada por posición.
// ════════════════════════════════════════════════════════════
function PromoCard({ promo, colorClass, onShowItems }) {
  const esClickeable = Boolean(promo.linkTo);
  const handleClick  = esClickeable ? () => onShowItems(promo.linkTo) : undefined;
  const tieneImagen  = Boolean(promo.imageUrl);

  return (
    <motion.div
      className={`promo-card${tieneImagen ? ' promo-card--imagen' : ` promo-card--${colorClass}`}${esClickeable ? ' promo-card--clickeable' : ''}`}
      variants={cardVariants}
      onClick={handleClick}
      role={esClickeable ? 'button' : undefined}
      tabIndex={esClickeable ? 0 : undefined}
    >
      {tieneImagen && (
        <>
          <img src={promo.imageUrl} alt={promo.titulo} className="promo-card-bg-img" />
          <div className="promo-card-overlay" />
        </>
      )}
      {promo.tag && <span className="promo-card-tag">{promo.tag}</span>}
      <div className="promo-card-content">
        {promo.dia && <span className="promo-card-dia">{promo.dia}</span>}
        <span className="promo-card-titulo">{promo.titulo}</span>
        {promo.desc && <span className="promo-card-desc">{promo.desc}</span>}
        {promo.precio && <span className="promo-card-precio">{promo.precio}</span>}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  🔄 CARD QUE SE DA VUELTA — Promos de la semana.
//     Frente: imagen de fondo + día + gancho corto (ej "3x2").
//     Al tocarla, flip 3D y muestra atrás: descripción completa
//     + condición de pago, sobre color sólido.
// ════════════════════════════════════════════════════════════
function PromoCardSemanal({ promo, colorClass }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="promo-flip"
      variants={cardVariants}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-label={`Promo del ${promo.dia}. Tocá para ver el detalle.`}
    >
      <div className={`promo-flip-inner${flipped ? ' promo-flip-inner--flipped' : ''}`}>
        {/* ── Frente: imagen + gancho corto ── */}
        <div className="promo-flip-face promo-flip-face--front promo-card promo-card--imagen">
          {promo.imageUrl && (
            <>
              <img src={promo.imageUrl} alt={promo.dia} className="promo-card-bg-img" />
              <div className="promo-card-overlay" />
            </>
          )}
          <div className="promo-card-content">
            <span className="promo-card-dia">{promo.dia}</span>
            <span className="promo-flip-titulo">{promo.titulo}</span>
            <span className="promo-flip-hint">↻ Tocá para ver</span>
          </div>
        </div>

        {/* ── Atrás: descripción + condición, color sólido ── */}
        <div className={`promo-flip-face promo-flip-face--back promo-card promo-card--${colorClass}`}>
          <span className="promo-card-dia">{promo.dia}</span>
          <span className="promo-card-desc">{promo.desc}</span>
          {promo.condicion && <span className="promo-flip-condicion">{promo.condicion}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  🔄 CARRUSEL DE PROMOS DELY — una sola card, rota entre varias
//     - Autoplay cada 4.5s
//     - Swipe/drag horizontal en mobile
//     - Puntitos de posición, clickeables
//     - Click en la card → arma y manda el pedido por WhatsApp
// ════════════════════════════════════════════════════════════
function PromoDelyCarousel({ promos }) {
  const [index, setIndex]         = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (promos.length <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % promos.length);
    }, 4500);
    return () => clearInterval(id);
  }, [promos.length]);

  if (promos.length === 0) return null;

  const promo = promos[index];

  const goTo = (i) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  const handleDragEnd = (_e, info) => {
    if (info.offset.x < -60) {
      setDirection(1);
      setIndex((i) => (i + 1) % promos.length);
    } else if (info.offset.x > 60) {
      setDirection(-1);
      setIndex((i) => (i - 1 + promos.length) % promos.length);
    }
  };

  const handleClick = () => {
    launchConfetti();
    pedirPromoPorWhatsapp(promo);
  };

  return (
    <div className="promo-dely-carousel">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={promo.id}
          className="promo-card promo-card--imagen promo-card--dely"
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`Pedir la promo ${promo.titulo} por WhatsApp`}
        >
          {promo.imageUrl && (
            <>
              <img src={promo.imageUrl} alt={promo.titulo} className="promo-card-bg-img" />
              <div className="promo-card-overlay" />
            </>
          )}
          {promo.tag && <span className="promo-card-tag">{promo.tag}</span>}
          <div className="promo-card-content">
            <span className="promo-card-titulo">{promo.titulo}</span>
            {promo.desc && <span className="promo-card-desc">{promo.desc}</span>}
            <span className="promo-dely-cta">📲 Tocá para pedirla</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {promos.length > 1 && (
        <div className="promo-dely-dots">
          {promos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`promo-dely-dot${i === index ? ' promo-dely-dot--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-label={`Ver promo ${i + 1} de ${promos.length}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  🎯 PANTALLA PRINCIPAL DE PROMOS
// ════════════════════════════════════════════════════════════
export default function Promos({ onNavigate, onShowItems }) {
  // TODO: reemplazar por `import { PROMOS } from './menuData'` cuando
  // conectemos el backend — ver nota al final del archivo.
  const todasLasPromos = PROMOS_EJEMPLO.filter((p) => p.activa);
  const hayAlgunaPromo = todasLasPromos.length > 0 || PINTAS_EJEMPLO.length > 0 || PROMOS_DELY.length > 0;

  const promoCountdown = todasLasPromos.find((p) => p.tipo === 'countdown');
  const promosPrincipales = todasLasPromos.filter((p) => p.tipo !== 'countdown');

  return (
    <div className="screen-body">

      <div className="back-row">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          ← Inicio
        </button>
        <span className="screen-title">
          <RevealText as="span">Promos</RevealText>
        </span>
      </div>

      {/* ── Countdown Happy Hour (20:00–22:00 real) ── */}
      {promoCountdown && (
        <PromoCountdown titulo={promoCountdown.titulo} desc={promoCountdown.desc} />
      )}

      {/* ── Pintas ── */}
      <PromoSectionLabel icon="🍺">Pintas del día</PromoSectionLabel>
      <motion.div
        className="promo-grid promo-grid--semanal"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {PINTAS_EJEMPLO.map((promo, i) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            colorClass={PALETA[i % PALETA.length]}
            onShowItems={onShowItems}
          />
        ))}
      </motion.div>

      {/* ── Promos Dely (carrusel + pedido directo por WhatsApp) ── */}
      <PromoSectionLabel icon="🛵">Promos Dely</PromoSectionLabel>
      <PromoDelyCarousel promos={PROMOS_DELY} />

      {/* ── Promos de la semana (flip cards con imagen adelante) ── */}
      <PromoSectionLabel icon="📅">Promos de la semana</PromoSectionLabel>
      <motion.div
        className="promo-grid promo-grid--semanal"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {PROMOS_SEMANALES.map((promo, i) => (
          <PromoCardSemanal
            key={promo.id}
            promo={promo}
            colorClass={PALETA[i % PALETA.length]}
          />
        ))}
      </motion.div>

      {/* ── Más promos de la casa (bloque principal, al final) ── */}
      <PromoSectionLabel icon="🎉">Más promos de la casa</PromoSectionLabel>
      <motion.div
        className="promo-grid promo-grid--principal"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {promosPrincipales.map((promo, i) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            colorClass={PALETA[i % PALETA.length]}
            onShowItems={onShowItems}
          />
        ))}
      </motion.div>

      {!hayAlgunaPromo && (
        <p className="promo-empty">Hoy no hay promos activas. ¡Volvé pronto!</p>
      )}

    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  📌 NOTA — conexión futura con el backend
// ════════════════════════════════════════════════════════════
// Cuando se sume el campo `tipo`, `linkTo`, `dia`, `condicion` y
// `seccion` a la tabla `promos` (Promo.cs + BD), reemplazar:
//
//   import { PROMOS } from './menuData';
//   const todasLasPromos = PROMOS.filter((p) => p.activa);
//
// El resto del componente ya está preparado para leer esos campos
// tal cual — no debería requerir más cambios de lógica.
//
// El countdown de Happy Hour corre siempre contra el horario real
// 20:00–22:00 (no depende de una `fechaFin` guardada en la promo).
//
// PROMOS_DELY y PROMOS_SEMANALES comparten el mismo shape que el
// resto (id, titulo, desc, tag/dia/condicion, imageUrl, linkTo
// opcional) — cuando se conecten al backend, alcanza con filtrar
// PROMOS por `seccion: 'dely' | 'semanal'` y pasarle esos arrays
// a <PromoDelyCarousel> / <PromoCardSemanal>, sin tocar los
// componentes.
//
// ⚠️ PENDIENTE — esto es un borrador aproximado del pedido por
// WhatsApp de Promos Dely, a ajustar cuando se carguen las promos
// reales del local:
//   - pedirPromoPorWhatsapp() arma un mensaje simple (título +
//     descripción + fecha). Si las promos reales tienen precio,
//     condiciones o variantes (ej. elegir sabor), probablemente
//     haga falta sumar esos campos al mensaje o directo un mini
//     formulario antes de mandar (nombre/teléfono), como en el
//     checkout del carrito.
//   - WHATSAPP_NUMBER está duplicado acá y en Items.jsx. Si en
//     algún momento se centraliza (ej. un archivo constants.js),
//     actualizar los dos lugares.
