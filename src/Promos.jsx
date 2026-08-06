// ============================================================
//  Promos.jsx — Pantalla de Promos (v6.0)
//
//  Cambios grandes de esta versión (devolución del jefe):
//  - Pintas: ahora es un carrusel con TODAS las pintas. Click
//    no navega a ningún lado — abre una ficha de detalle.
//  - Promos Dely: click abre la misma ficha de detalle, con
//    botón "Agregar al carrito" (carrito real de la app).
//  - Promos de la semana: ya no se dan vuelta (se sacó el flip).
//    Click abre la misma ficha de detalle, con botón
//    "Llamar mozo" (WhatsApp).
//  - Un solo componente de ficha (PromoDetailSheet) reusado por
//    las tres secciones — solo cambia el botón de acción.
//  - Se sacó el bloque de 4 cards (Combos/Bladis/Bambino).
//    Queda solo "Reservá tu evento" como card única a todo
//    el ancho.
//  - Countdown: 18:00–22:00 (antes 20:00–22:00), todo el texto
//    sale de las constantes HH_INICIO / HH_FIN.
//  - Sin íconos de pizza/cerveza en las partículas de fondo
//    (eso se resuelve en EmberParticles.jsx, no acá).
//
//  ⚠️ DATOS DE EJEMPLO — esto todavía no lee de menuData.js.
//  Reemplazar los arrays de ejemplo por el import real cuando
//  conectemos el backend (ver nota al final del archivo).
// ============================================================

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import smartcrop from 'smartcrop';
import RevealText from './RevealText';
import { launchConfetti } from './confettiCheckout';

// ⚠️ Este archivo usa la librería `smartcrop` para el recorte
// automático de imágenes (ver PromoImgFit más abajo). Si no está
// instalada, corré esto una vez en la carpeta del proyecto:
//   npm install smartcrop

// ⚠️ Mismo número que usa el carrito en Items.jsx. Duplicado a
// propósito para no acoplar los dos archivos — si cambia,
// actualizar en los dos lugares.
const WHATSAPP_NUMBER = 543543512248;

// ── Horario real del Happy Hour — todo el texto del countdown
// sale de estas dos constantes, no hay nada hardcodeado. ──────
const HH_INICIO = 18;
const HH_FIN = 22;

// ── Paleta de color para las cards (ciclo fijo por posición) ──
const PALETA = ['verde', 'crema', 'dorado', 'marron'];

// ── Datos de ejemplo — Happy Hour + Reservas (único card del
//    bloque final, ver punto 5 de la devolución). ─────────────
const PROMOS_EJEMPLO = [
  {
    id: 2,
    titulo: 'Happy Hour',
    desc: 'Happy en cualquiera de las pintas que veas',
    tipo: 'countdown',
  },
  {
    id: 3,
    titulo: 'Reservas para tus eventos',
    desc: 'Festejá con nosotros',
    tipo: 'normal',
    imageUrl: 'https://bruzz.com.ar/img/reserva.jpg',
    imgPosition: '50% 65%', // ⚠️ card muy ancha (banner) — foco manual, ajustá el % si hace falta
  },
];

// ── Pintas — TODAS las de la canilla, con su descripción real y
//    su ficha técnica (estilo, alc., color, IBU, ingredientes)
//    para la ficha de detalle con formato "etiqueta de cerveza".
//    Las 3 que ya tenían foto real la conservan; a las 3 que
//    faltan se les puso una foto de referencia (unsplash) — hay
//    que reemplazarlas por la real cuando la tengas. ────────────
const PINTAS_EJEMPLO = [
  {
    id: 'p1', titulo: 'Blonde Ale', tag: 'Happy Hour',
    desc: 'KRAL alc. 4,5%. Ligera, moderado aroma dulce maltoso, bajo amargor y leve cítrico.',
    estilo: 'Blonde Ale', alc: '4,5%', color: 'Rubia clara', ibu: '15',
    ingredientes: [{ icon: '🌾', label: 'Malta' }, { icon: '🌿', label: 'Lúpulo' }, { icon: '✨', label: 'Levadura' }],
    imageUrl: 'https://bruzz.com.ar/img/blonde.png', // ⚠️ placeholder, reemplazar
  },
  {
    id: 'p2', titulo: 'IPA', tag: 'Happy Hour',
    desc: 'KRAL. alc. 5,3%. De cuerpo medio, con marcados aromas y sabores cítricos florales.',
    estilo: 'India Pale Ale (IPA)', alc: '5,3%', color: 'Dorada intensa', ibu: '45',
    ingredientes: [{ icon: '🌿', label: 'Lúpulo' }, { icon: '🍊', label: 'Cítricos' }, { icon: '🌾', label: 'Malta' }],
    imageUrl: 'https://bruzz.com.ar/img/ipa.png', // ⚠️ placeholder, reemplazar
  },
  {
    id: 'p3', titulo: 'Irish Red', tag: 'Happy Hour',
    desc: 'UN TAL RENE. alc 5%. Roja, con notas dulces, frutal.',
    estilo: 'Irish Red Ale', alc: '5%', color: 'Roja cobriza', ibu: '22',
    ingredientes: [{ icon: '🌾', label: 'Malta caramelo' }, { icon: '🍇', label: 'Frutal' }],
    imageUrl: 'https://bruzz.com.ar/img/roja2.png',
  },
  {
    id: 'p4', titulo: 'Stout', tag: 'Happy Hour',
    desc: 'UN TAL RENE. Negra, notas a café. alc. 4,8%, de amargor bajo.',
    estilo: 'Stout', alc: '4,8%', color: 'Negra intensa', ibu: '28',
    ingredientes: [{ icon: '☕', label: 'Café' }, { icon: '🍫', label: 'Cacao tostado' }, { icon: '🌾', label: 'Malta negra' }],
    imageUrl: 'https://bruzz.com.ar/img/negra2.png',
  },
  {
    id: 'p5', titulo: 'Honey Blueberry', tag: 'Happy Hour',
    desc: 'UN TAL RENE. 6% alc. Rubia, endulzada con miel y notas de blueberry.',
    estilo: 'Honey Blonde Ale', alc: '6%', color: 'Rubia dorada', ibu: '18',
    ingredientes: [{ icon: '🍯', label: 'Miel' }, { icon: '🫐', label: 'Blueberry' }, { icon: '🌾', label: 'Lúpulo' }],
    imageUrl: 'https://bruzz.com.ar/img/honey.png', // ⚠️ placeholder, reemplazar
  },
  {
    id: 'p6', titulo: 'American', tag: 'Happy Hour',
    desc: 'BUFON DEL REY. 4,2% alc. Rubia, ligera y refrescante, amargor bajo. (Medalla de ORO 2023)',
    estilo: 'American Lager', alc: '4,2%', color: 'Rubia clara', ibu: '12',
    ingredientes: [{ icon: '🌾', label: 'Malta' }, { icon: '🌿', label: 'Lúpulo suave' }, { icon: '🏅', label: 'Oro 2023' }],
    imageUrl: 'https://bruzz.com.ar/img/american2.png',
  },
];

// ── Promos Dely — carrusel, click abre ficha con botón
//    "Agregar al carrito". Cada una tiene su ficha técnica
//    (`atributos`) con el mismo formato ícono + etiqueta + valor.
//    La de pizza además tiene `opciones` — el cliente elige los
//    sabores antes de poder agregar al carrito. ─────────────────
const PROMOS_DELY = [
  {
    id: 2, titulo: '2 Sandwiches de Ternera', desc: 'Completos. Con papas!', tag: 'DELY',
    precio: '$37.000',
    imageUrl: 'https://bruzz.com.ar/img/ternera-promo2.png',
    atributos: [
      { icon: '🥪', label: 'Incluye', value: '2 sandwiches de ternera completos + Papas fritas' },
      { icon: '🏷️', label: 'Exclusivo Web', value: 'Promo solo para Dely o Take away (No incluye costo de envio)' },
      { icon: '🕐', label: 'Válido', value: 'Martes , Miercoles , Jueves y Domingo' },
    ],
  },
  {
    id: 3, titulo: '3 Pizzas a Elección', desc: 'Elegí tus 3 sabores para el pedido', tag: 'DELY',
    precio: '$56.700',
    imageUrl: 'https://bruzz.com.ar/img/pizza-promo.jpg',
    atributos: [
      { icon: '🍕', label: 'Incluye', value: '3 pizzas a elección' },
      { icon: '🏷️', label: 'Exclusivo Web', value: 'Promo solo para Dely o Take away (No incluye costo de envio)' },
      { icon: '🕐', label: 'Válido', value: 'Martes , Miercoles , Jueves y Domingo' },
    ],
    opciones: ['Prosciutto Cotto', 'Quattro Formaggi', 'Margherita', 'Napolitana', 'Dolce'],
    maxSelect: 3,
  },
  {
    id: 4, titulo: '2 Burgers Completas', desc: 'Completas. Con papas!', tag: 'DELY',
    precio: '$24.500',
    imageUrl: 'https://bruzz.com.ar/img/Pburger.png',
    atributos: [
      { icon: '🍔', label: 'Incluye', value: '2 hamburguesas completas + Papas fritas' },
      { icon: '🏷️', label: 'Exclusivo Web', value: 'Promo solo para Dely o Take away (No incluye costo de envio)' },
      { icon: '🕐', label: 'Válido', value: 'Martes , Miercoles , Jueves y Domingo' },
    ],
  },
];

// ── Promos semanales — click abre ficha con botón "Llamar
//    mozo" (ya no se dan vuelta in-place). ────────────────────
const PROMOS_SEMANALES = [
  {
    id: 'w1', dia: 'Martes',
    desc: '3x2 en pintas de cerveza y 50% en la segunda Pizza', condicion: 'Efectivo o transferencia  (Solo consumo local)',
    imageUrl: 'https://bruzz.com.ar/img/pintas.jpg',
    imgPosition: '50% 25%', // ⚠️ smartcrop la recortaba muy cerrada — encuadre manual, ajustá el % si hace falta
  },
  { id: 'w2', dia: 'Miércoles', titulo: '50% OFF', desc: '50% en la segunda hamburguesa',  condicion: 'Efectivo o transferencia  (Solo consumo local)', imageUrl: 'https://bruzz.com.ar/img/hamburgesa.jpg' },
  { id: 'w3', dia: 'Jueves',    titulo: '20% OFF', desc: '20% en Sandwich de Ternera',   condicion: 'Efectivo o transferencia  (Solo consumo local)', imageUrl: 'https://bruzz.com.ar/img/ternera.jpg' },
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

function pedirReservaPorWhatsapp(promo) {
  const body = [
    '¡Hola! Quiero consultar por una reserva para un evento 🎉',
    '',
    promo?.titulo ? `Motivo: ${promo.titulo}` : null,
    promo?.desc ? `Detalle: ${promo.desc}` : null,
    '',
    `Hora: ${formatFechaHora()}`,
    '',
    '¿Me pasan disponibilidad?',
  ].filter((line) => line !== null).join('\n');

  window.open(`https://wa.me/${3543512248}?text=${encodeURIComponent(body)}`, '_blank');
}

// ── Calcula en qué fase está el Happy Hour real (HH_INICIO–HH_FIN) ──
function calcularEstadoHappyHour() {
  const ahora  = new Date();
  const inicio = new Date(ahora); inicio.setHours(HH_INICIO, 0, 0, 0);
  const fin    = new Date(ahora); fin.setHours(HH_FIN, 0, 0, 0);

  if (ahora < inicio) {
    return { fase: 'antes', restante: { h: HH_FIN - HH_INICIO, m: 0, s: 0 } };
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
//  📍 SECTION LABEL — ícono + texto + línea divisoria dorada
// ════════════════════════════════════════════════════════════
function PromoSectionLabel({ icon, children }) {
  return (
    <div className="promo-section-label">
      <span className="promo-section-icon">{icon}</span>
      <RevealText as="span">{children}</RevealText>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  ⏱ COUNTDOWN — Happy Hour, horario real (HH_INICIO–HH_FIN)
// ════════════════════════════════════════════════════════════
function PromoCountdown({ titulo, desc }) {
  const [estado, setEstado] = useState(() => calcularEstadoHappyHour());

  useEffect(() => {
    const id = setInterval(() => setEstado(calcularEstadoHappyHour()), 1000);
    return () => clearInterval(id);
  }, []);

  const label =
    estado.fase === 'antes'  ? `${titulo} empieza a las ${pad2(HH_INICIO)}:00hs` :
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
      <p className="promo-countdown-horario">{pad2(HH_INICIO)}:00 – {pad2(HH_FIN)}:00</p>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  🧠 RECORTE INTELIGENTE — reemplaza el truco visual de antes
//     (imagen de fondo desenfocada + imagen real encima) por la
//     librería `smartcrop`: analiza los píxeles de la imagen UNA
//     sola vez (busca dónde está lo "interesante" — bordes,
//     contraste, saturación) y calcula el mejor punto de foco para
//     la proporción del contenedor. Con eso seteamos object-fit:
//     cover + ese object-position — entra "cover" de verdad, sin
//     recortar lo importante y sin ninguna opacidad ni ajuste
//     manual por imagen. El resultado se cachea por imagen+aspecto
//     para no recalcularlo cada vez que se repite en pantalla.
//
//     ⚠️ Esto lee los píxeles de la imagen con un <canvas> interno
//     de la librería, y el navegador solo permite eso si la imagen
//     viene con headers CORS (Access-Control-Allow-Origin) — o si
//     está en el mismo dominio que la app. Si tu hosting de
//     imágenes (bruzz.com.ar) no manda ese header, el análisis
//     falla en silencio y la imagen se muestra centrada (mismo
//     resultado que antes de este cambio, nunca peor). Si ves que
//     nunca ajusta el foco, ese es el motivo — se arregla agregando
//     `Header set Access-Control-Allow-Origin "*"` en el .htaccess
//     de esa carpeta de imágenes.
// ════════════════════════════════════════════════════════════
const smartCropCache = new Map();

function useSmartPosition(src, aspect, manual) {
  const [position, setPosition] = useState(manual || '50% 50%');

  useEffect(() => {
    // Si la promo trae una posición manual (`imgPosition`), la
    // usamos directo y ni llamamos a smartcrop — es el "escape
    // hatch" para esa foto puntual que el algoritmo recorta mal.
    if (manual) {
      setPosition(manual);
      return;
    }
    if (!src) return;
    const cacheKey = `${src}__${aspect}`;

    if (smartCropCache.has(cacheKey)) {
      setPosition(smartCropCache.get(cacheKey));
      return;
    }

    let cancelado = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelado) return;
      const targetW = 100;
      const targetH = Math.max(1, Math.round(100 / aspect));
      smartcrop
        .crop(img, { width: targetW, height: targetH })
        .then((resultado) => {
          if (cancelado) return;
          const { topCrop } = resultado;
          const cx = topCrop.x + topCrop.width / 2;
          const cy = topCrop.y + topCrop.height / 2;
          const posX = Math.min(100, Math.max(0, (cx / img.naturalWidth) * 100));
          const posY = Math.min(100, Math.max(0, (cy / img.naturalHeight) * 100));
          const pos = `${posX.toFixed(1)}% ${posY.toFixed(1)}%`;
          smartCropCache.set(cacheKey, pos);
          setPosition(pos);
        })
        .catch(() => {
          // CORS bloqueado, imagen rota, etc. — se queda centrada,
          // que es exactamente el comportamiento de antes.
          smartCropCache.set(cacheKey, '50% 50%');
        });
    };
    img.onerror = () => {};
    img.src = src;

    return () => { cancelado = true; };
  }, [src, aspect, manual]);

  return position;
}

// `position` es el escape hatch manual: si una foto puntual queda
// mal recortada (el algoritmo eligió mal el foco), se le puede
// pasar `imgPosition: '50% 30%'` en su objeto de datos — "0%" es
// arriba/izquierda, "100%" abajo/derecha, "50%" el centro — y esa
// imagen deja de pasar por smartcrop y usa ese encuadre fijo.
function PromoImgFit({ src, alt, aspect = 1.6, position: manualPosition }) {
  const position = useSmartPosition(src, aspect, manualPosition);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="promo-img-fit-cover"
      style={{ objectPosition: position }}
    />
  );
}

// ════════════════════════════════════════════════════════════
//  🟨 CARD UNIFICADA — Reservas (full-width) y Promos semanales.
//     Si recibe `onClick`, lo usa (abre la ficha de detalle) sin
//     importar `linkTo`. Si no, cae al comportamiento viejo de
//     navegar con `linkTo` (por si algún día se vuelve a usar).
// ════════════════════════════════════════════════════════════
function PromoCard({ promo, colorClass, onShowItems, onClick, className = '', aspect = 0.85 }) {
  const handleClick = onClick
    ? () => onClick(promo)
    : (promo.linkTo ? () => onShowItems?.(promo.linkTo) : undefined);
  const esClickeable = Boolean(handleClick);
  const tieneImagen  = Boolean(promo.imageUrl);

  return (
    <motion.div
      className={`promo-card${tieneImagen ? ' promo-card--imagen' : ` promo-card--${colorClass}`}${esClickeable ? ' promo-card--clickeable' : ''}${className ? ` ${className}` : ''}`}
      variants={cardVariants}
      onClick={handleClick}
      role={esClickeable ? 'button' : undefined}
      tabIndex={esClickeable ? 0 : undefined}
    >
      {tieneImagen && (
        <>
          <PromoImgFit src={promo.imageUrl} alt={promo.titulo} aspect={aspect} position={promo.imgPosition} />
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
//  🔄 CARRUSEL GENÉRICO — usado por Pintas y Promos Dely.
//     Una sola card visible, rota entre todas. Autoplay + swipe
//     + puntitos. El click SIEMPRE abre la ficha de detalle
//     (nunca navega) — lo decide el padre vía onCardClick.
// ════════════════════════════════════════════════════════════
function PromoCarousel({ promos, onCardClick }) {
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
  const tieneImagen = Boolean(promo.imageUrl);
  const colorClass = PALETA[index % PALETA.length];

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

  return (
    <div className="promo-carousel">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={promo.id}
          className={`promo-card${tieneImagen ? ' promo-card--imagen' : ` promo-card--${colorClass}`} promo-card--carousel`}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={handleDragEnd}
          onClick={() => onCardClick(promo)}
          role="button"
          tabIndex={0}
          aria-label={`Ver detalle de ${promo.titulo}`}
        >
          {tieneImagen && (
            <>
              <PromoImgFit src={promo.imageUrl} alt={promo.titulo} aspect={2.6} position={promo.imgPosition} />
              <div className="promo-card-overlay" />
            </>
          )}
          {promo.tag && <span className="promo-card-tag">{promo.tag}</span>}
          <div className="promo-card-content">
            <span className="promo-card-titulo">{promo.titulo}</span>
            {promo.desc && <span className="promo-card-desc">{promo.desc}</span>}
            <span className="promo-carousel-cta">👆 Tocá para ver más</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {promos.length > 1 && (
        <div className="promo-carousel-dots">
          {promos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`promo-carousel-dot${i === index ? ' promo-carousel-dot--active' : ''}`}
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
//  🍺 MARQUEE — Pintas del día. Formato original (card con
//     imagen de fondo + tag "Happy Hour") pero en tira que se
//     mueve sola todo el tiempo, mostrando todas las pintas.
//     Se duplica la lista para que el loop sea perfecto (al
//     llegar a -50% ya volvió a mostrar la primera tanda).
//     El click SIEMPRE abre la ficha de detalle.
// ════════════════════════════════════════════════════════════
function PromoMarquee({ promos, onCardClick }) {
  if (promos.length === 0) return null;

  const loopPromos = [...promos, ...promos];

  return (
    <div className="promo-marquee">
      <div
        className="promo-marquee-track"
        style={{ '--marquee-count': promos.length }}
      >
        {loopPromos.map((promo, i) => {
          const tieneImagen = Boolean(promo.imageUrl);
          const colorClass = PALETA[i % PALETA.length];
          return (
            <div
              key={`${promo.id}-${i}`}
              className={`promo-card${tieneImagen ? ' promo-card--imagen' : ` promo-card--${colorClass}`} promo-card--marquee`}
              onClick={() => onCardClick(promo)}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalle de ${promo.titulo}`}
            >
              {tieneImagen && (
                <>
                  <PromoImgFit src={promo.imageUrl} alt={promo.titulo} aspect={0.9} position={promo.imgPosition} />
                  <div className="promo-card-overlay" />
                </>
              )}
              {promo.tag && <span className="promo-card-tag">{promo.tag}</span>}
              <div className="promo-card-content">
                <span className="promo-card-titulo">{promo.titulo}</span>
                {promo.desc && <span className="promo-card-desc">{promo.desc}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  📋 FICHA DE DETALLE — modal flotante compartido por Pintas,
//     Promos Dely y Promos de la semana. El botón de acción
//     (o ninguno) lo decide el padre según `actionLabel`.
//
//     ⚠️ Se monta con un portal directo a document.body. Es
//     necesario porque .screen-transition (en App.jsx) anima con
//     `filter`, y cualquier filter !== 'none' (incluido blur(0px))
//     crea un "containing block" nuevo para los descendientes con
//     position:fixed — por eso antes la ficha aparecía pegada
//     abajo de toda la pantalla en vez de flotar sobre lo visible.
//     El portal la saca de ese árbol y queda fija de verdad.
// ════════════════════════════════════════════════════════════
function PromoDetailSheet({ promo, tipo, onClose, actionLabel, actionVariant = 'button', actionDisabled, onAction }) {
  const esPinta   = tipo === 'pinta';
  const esDely    = tipo === 'dely';
  const esSemanal = tipo === 'semanal';
  const botonClass = `promo-sheet-action${
    actionVariant === 'text' ? ' promo-sheet-action--text' :
    actionVariant === 'tag'  ? ' promo-sheet-action--tag'  : ''
  }`;

  // ── Selector de sabores (solo para promos con `opciones`, ej.
  //    "3 Pizzas a Elección"). Es un contador por sabor — así se
  //    puede repetir el mismo (3 margarita, o 2 prosciutto + 1
  //    dolce) en vez de forzar sabores distintos. Vive acá porque
  //    es puramente de UI: se resetea solo cada vez que se abre
  //    una ficha nueva. ─────────────────────────────────────────
  const tieneOpciones = Boolean(promo.opciones?.length);
  const maxSelect = promo.maxSelect || promo.opciones?.length || 0;
  const [seleccion, setSeleccion] = useState({}); // { 'Margherita': 2, 'Dolce': 1 }

  const totalSeleccionado = Object.values(seleccion).reduce((a, b) => a + b, 0);

  const sumarOpcion = (op) => {
    setSeleccion((prev) => {
      const total = Object.values(prev).reduce((a, b) => a + b, 0);
      if (total >= maxSelect) return prev;
      return { ...prev, [op]: (prev[op] || 0) + 1 };
    });
  };

  const restarOpcion = (op) => {
    setSeleccion((prev) => {
      if (!prev[op]) return prev;
      const next = { ...prev, [op]: prev[op] - 1 };
      if (next[op] <= 0) delete next[op];
      return next;
    });
  };

  const opcionesCompletas = !tieneOpciones || totalSeleccionado === maxSelect;
  const labelBoton = tieneOpciones && !opcionesCompletas
    ? `Elegí ${maxSelect} sabores (${totalSeleccionado}/${maxSelect})`
    : actionLabel;

  return createPortal(
    <motion.div
      className="promo-sheet-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`promo-sheet${esPinta ? ' promo-sheet--pinta' : ''}${esDely ? ' promo-sheet--dely' : ''}${esSemanal ? ' promo-sheet--semanal' : ''}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="promo-sheet-close" onClick={onClose} aria-label="Cerrar">✕</button>

        {esPinta ? (
          <>
            {/* ── Ficha técnica de la pinta: imagen + estilo/alc/color/IBU + ingredientes.
                Mismo formato para las 6, solo cambian los datos e imagen. ── */}
            {promo.imageUrl && (
              <div className="promo-sheet-pinta-img-wrap">
                <PromoImgFit src={promo.imageUrl} alt={promo.titulo} aspect={0.62} position={promo.imgPosition} />
              </div>
            )}
            <div className="promo-sheet-pinta-info">
              <h3 className="promo-sheet-title">{promo.titulo}</h3>
              {promo.desc && <p className="promo-sheet-desc">{promo.desc}</p>}

              <div className="promo-sheet-pinta-divider" />

              <div className="promo-sheet-attrs">
                {promo.estilo && (
                  <div className="promo-sheet-attr">
                    <span className="promo-sheet-attr-icon">🍺</span>
                    <div>
                      <span className="promo-sheet-attr-label">Estilo</span>
                      <span className="promo-sheet-attr-value">{promo.estilo}</span>
                    </div>
                  </div>
                )}
                {promo.alc && (
                  <div className="promo-sheet-attr">
                    <span className="promo-sheet-attr-icon">🎯</span>
                    <div>
                      <span className="promo-sheet-attr-label">Alc.</span>
                      <span className="promo-sheet-attr-value">{promo.alc}</span>
                    </div>
                  </div>
                )}
                {promo.color && (
                  <div className="promo-sheet-attr">
                    <span className="promo-sheet-attr-icon">💧</span>
                    <div>
                      <span className="promo-sheet-attr-label">Color</span>
                      <span className="promo-sheet-attr-value">{promo.color}</span>
                    </div>
                  </div>
                )}
                {promo.ibu && (
                  <div className="promo-sheet-attr">
                    <span className="promo-sheet-attr-icon">🌾</span>
                    <div>
                      <span className="promo-sheet-attr-label">IBU</span>
                      <span className="promo-sheet-attr-value">{promo.ibu}</span>
                    </div>
                  </div>
                )}
              </div>

              {promo.ingredientes?.length > 0 && (
                <div className="promo-sheet-pinta-ingredientes">
                  <span className="promo-sheet-pinta-ing-label">Ingredientes</span>
                  <div className="promo-sheet-pinta-ing-tags">
                    {promo.ingredientes.map((ing) => (
                      <span key={ing.label} className="promo-sheet-pinta-ing-tag">
                        <span>{ing.icon}</span> {ing.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {actionLabel && (
                <button
                  className={`${botonClass} promo-sheet-pinta-action`}
                  onClick={onAction}
                  disabled={actionDisabled}
                >
                  {actionLabel}
                </button>
              )}
            </div>
          </>
        ) : esDely ? (
          <>
            {/* ── Ficha de la promo Dely: mismo formato "imagen + ficha
                técnica" que Pintas (ícono + etiqueta + valor por fila).
                Si tiene `opciones` (ej. sabores de pizza), agrega un
                selector — hay que elegir `maxSelect` antes de poder
                agregar al carrito. ── */}
            {promo.imageUrl && (
              <div className="promo-sheet-dely-img-wrap">
                <PromoImgFit src={promo.imageUrl} alt={promo.titulo} aspect={0.62} position={promo.imgPosition} />
              </div>
            )}
            <div className="promo-sheet-dely-info">
              {promo.tag && <span className="promo-sheet-dely-tag">{promo.tag}</span>}
              <h3 className="promo-sheet-title">{promo.titulo}</h3>
              {promo.desc && <p className="promo-sheet-desc">{promo.desc}</p>}

              {promo.atributos?.length > 0 && (
                <div className="promo-sheet-attrs">
                  {promo.atributos.map((attr) => (
                    <div className="promo-sheet-attr" key={attr.label}>
                      <span className="promo-sheet-attr-icon">{attr.icon}</span>
                      <div>
                        <span className="promo-sheet-attr-label">{attr.label}</span>
                        <span className="promo-sheet-attr-value">{attr.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tieneOpciones && (
                <div className="promo-sheet-dely-opciones">
                  <div className="promo-sheet-dely-opciones-head">
                    <span className="promo-sheet-dely-opciones-label">Elegí tus sabores</span>
                    <span className="promo-sheet-dely-opciones-count">{totalSeleccionado}/{maxSelect}</span>
                  </div>
                  <div className="promo-sheet-dely-opciones-list">
                    {promo.opciones.map((op) => {
                      const cant = seleccion[op] || 0;
                      return (
                        <div key={op} className={`promo-sheet-dely-opcion${cant > 0 ? ' promo-sheet-dely-opcion--activa' : ''}`}>
                          <span className="promo-sheet-dely-opcion-nombre">{op}</span>
                          <div className="promo-sheet-dely-opcion-stepper">
                            <button
                              type="button"
                              className="promo-sheet-dely-opcion-btn"
                              onClick={() => restarOpcion(op)}
                              disabled={cant === 0}
                              aria-label={`Sacar una de ${op}`}
                            >
                              −
                            </button>
                            <span className="promo-sheet-dely-opcion-cant">{cant}</span>
                            <button
                              type="button"
                              className="promo-sheet-dely-opcion-btn"
                              onClick={() => sumarOpcion(op)}
                              disabled={totalSeleccionado >= maxSelect}
                              aria-label={`Sumar una de ${op}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {actionLabel && (
                <button
                  className={`${botonClass} promo-sheet-dely-action`}
                  onClick={() => {
                    const detalleSabores = Object.entries(seleccion)
                      .filter(([, cant]) => cant > 0)
                      .map(([op, cant]) => `${cant}x ${op}`);
                    onAction(tieneOpciones ? detalleSabores : undefined);
                  }}
                  disabled={actionDisabled || !opcionesCompletas}
                >
                  {labelBoton}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* ── Promos de la semana: mismo formato "imagen + ficha"
                que Pintas/Dely. Contenido intacto — Día y Condición
                se muestran en filas en vez de en un pill suelto. ── */}
            {promo.imageUrl && (
              <div className="promo-sheet-semanal-img-wrap">
                <PromoImgFit src={promo.imageUrl} alt={promo.titulo} aspect={0.62} position={promo.imgPosition} />
              </div>
            )}

            <div className="promo-sheet-semanal-info">
              <h3 className="promo-sheet-title">{promo.titulo}</h3>
              {promo.desc && <p className="promo-sheet-desc">{promo.desc}</p>}

              {(promo.dia || promo.condicion) && (
                <div className="promo-sheet-attrs">
                  {promo.dia && (
                    <div className="promo-sheet-attr">
                      <span className="promo-sheet-attr-icon">📅</span>
                      <div>
                        <span className="promo-sheet-attr-label">Día</span>
                        <span className="promo-sheet-attr-value">{promo.dia}</span>
                      </div>
                    </div>
                  )}
                  {promo.condicion && (
                    <div className="promo-sheet-attr">
                      <span className="promo-sheet-attr-icon">💳</span>
                      <div>
                        <span className="promo-sheet-attr-label">Condición</span>
                        <span className="promo-sheet-attr-value">{promo.condicion}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {actionLabel && (
                <button
                  className={`${botonClass} promo-sheet-semanal-action`}
                  onClick={onAction}
                  disabled={actionDisabled}
                >
                  {actionLabel}
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ════════════════════════════════════════════════════════════
//  🎯 PANTALLA PRINCIPAL DE PROMOS
// ════════════════════════════════════════════════════════════
export default function Promos({ onNavigate, onShowItems, onCartAdd = () => {} }) {
  // TODO: reemplazar por `import { PROMOS } from './menuData'` cuando
  // conectemos el backend — ver nota al final del archivo.
  const todasLasPromos = PROMOS_EJEMPLO.filter((p) => p.activa !== false);
  const hayAlgunaPromo = todasLasPromos.length > 0 || PINTAS_EJEMPLO.length > 0 || PROMOS_DELY.length > 0;

  const promoCountdown = todasLasPromos.find((p) => p.tipo === 'countdown');
  const promoReserva   = todasLasPromos.find((p) => p.tipo !== 'countdown');

  // ── Ficha de detalle activa: { promo, tipo: 'pinta'|'dely'|'semanal' } ──
  const [detalle, setDetalle] = useState(null);
  const [agregando, setAgregando] = useState(false);

  const cerrarDetalle = () => setDetalle(null);

  const handleAction = (opcionesElegidas) => {
    if (!detalle) return;
    // Pintas es solo consumo local — el botón de su ficha ya no
    // agrega nada al carrito, solo cierra (ver actionLabel: "Volver").
    if (detalle.tipo === 'pinta') {
      cerrarDetalle();
      return;
    }
    if (detalle.tipo === 'dely') {
      // Si viene del selector de sabores (ej. pizza), sumamos el
      // detalle elegido a la nota del pedido — si no, queda solo la desc.
      const notaSabores = Array.isArray(opcionesElegidas) && opcionesElegidas.length > 0
        ? ` — Sabores: ${opcionesElegidas.join(', ')}`
        : '';
      onCartAdd({
        name: detalle.promo.titulo,
        price: detalle.promo.precio || 'Promo',
        qty: 1,
        note: (detalle.promo.desc || '') + notaSabores,
      });
      launchConfetti();
      setAgregando(true);
      setTimeout(() => {
        setAgregando(false);
        cerrarDetalle();
      }, 700);
    } else if (detalle.tipo === 'semanal') {
      pedirMozoPorWhatsapp(detalle.promo);
      cerrarDetalle();
    }
  };

  const actionLabel =
    detalle?.tipo === 'dely'    ? (agregando ? '✓ Agregado' : '🛒 Agregar al carrito') :
    detalle?.tipo === 'pinta'   ? '← Volver' :
    detalle?.tipo === 'semanal' ? '🙋 Llamar mozo' :
    null;

  // ── Dely usa el botón sólido de "Agregar al carrito"; Pintas
  //    usa el mismo estilo sólido pero para "Volver" (más fácil de
  //    ver y tocar para personas mayores que el ✕ chiquito); Mozo
  //    sigue siendo una etiqueta/tag clickeable. ──────────────────
  const actionVariant = detalle?.tipo === 'semanal' ? 'tag' : 'button';

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

      {/* ── Countdown Happy Hour (horario real) ── */}
      {promoCountdown && (
        <PromoCountdown titulo={promoCountdown.titulo} desc={promoCountdown.desc} />
      )}

      {/* ── Pintas (tira automática, click abre ficha + agregar al carrito) ── */}
      <PromoSectionLabel icon="🍺">Pintas del día</PromoSectionLabel>
      <PromoMarquee
        promos={PINTAS_EJEMPLO}
        onCardClick={(promo) => setDetalle({ promo, tipo: 'pinta' })}
      />

      {/* ── Promos Dely (carrusel, click abre ficha + agregar al carrito) ── */}
      <PromoSectionLabel icon="🛵">Promos Dely o Take away </PromoSectionLabel>
      <PromoCarousel
        promos={PROMOS_DELY}
        onCardClick={(promo) => setDetalle({ promo, tipo: 'dely' })}
      />

      {/* ── Promos de la semana (grid, click abre ficha + llamar mozo) ── */}
      <PromoSectionLabel icon="📅">Promos de la semana</PromoSectionLabel>
      <motion.div
        className="promo-grid promo-grid--semanal"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {PROMOS_SEMANALES.map((promo, i) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            colorClass={PALETA[i % PALETA.length]}
            onClick={(p) => setDetalle({ promo: p, tipo: 'semanal' })}
            aspect={0.85}
          />
        ))}
      </motion.div>

      {/* ── Reservá tu evento (única card, todo el ancho) ── */}
      {promoReserva && (
        <>
          <PromoSectionLabel icon="🎉">Reservá tu evento</PromoSectionLabel>
          <PromoCard
            promo={promoReserva}
            colorClass={PALETA[0]}
            className="promo-card--full"
            aspect={3.2}
            onClick={(p) => pedirReservaPorWhatsapp(p)}
          />
        </>
      )}

      {!hayAlgunaPromo && (
        <p className="promo-empty">Hoy no hay promos activas. ¡Volvé pronto!</p>
      )}

      {/* ── Ficha de detalle compartida (Pintas / Dely / Semanal) ── */}
      <AnimatePresence>
        {detalle && (
          <PromoDetailSheet
            promo={detalle.promo}
            tipo={detalle.tipo}
            onClose={cerrarDetalle}
            actionLabel={actionLabel}
            actionVariant={actionVariant}
            actionDisabled={agregando}
            onAction={handleAction}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

