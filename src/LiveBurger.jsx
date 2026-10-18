import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

// ════════════════════════════════════════════════════════════
//  🍔 LiveBurger — la hamburguesa que se arma en vivo.
//  Ilustración 100% CSS: cada capa entra/sale con animación
//  cuando el cliente suma o quita ingredientes.
//  · highlight → resalta capas (el resto se atenúa) con su etiqueta
//  · exploded  → "vista explosionada": separa las capas y rotula todas
// ════════════════════════════════════════════════════════════

// Altura aproximada de cada capa (px) → para escalar la pila y que siempre entre
const H = {
  bunTop: 58, leaf: 18, arugula: 14, tomato: 13, onion: 9, onionRed: 9, pickles: 11,
  mayo: 9, ketchup: 9, bruzz: 9, bbq: 9, chimi: 9, grill: 12, egg: 20, ham: 11, prosciutto: 11,
  cheese: 9, bacon: 12, cheddar: 12, patty: 28, lomo: 24, veggie: 26, ternera: 26, bunBottom: 26,
};

// Orden visual de verduras y salsas (de arriba hacia abajo)
const VEG_ORDER = ['arugula', 'leaf', 'tomato', 'grill', 'onion', 'onionRed', 'pickles', 'mayo', 'ketchup', 'bruzz', 'bbq', 'chimi'];

// Etiqueta legible de cada capa
export const LAYER_LABELS = {
  bunTop: 'Pan de papa (tapa)', leaf: 'Lechuga fresca', arugula: 'Rúcula', tomato: 'Tomate fresco',
  onion: 'Cebolla', onionRed: 'Cebolla morada', pickles: 'Pepinos encurtidos',
  mayo: 'Lactonesa de la casa', ketchup: 'Ketchup', bruzz: 'Salsa Bruzz', bbq: 'Barbacoa',
  chimi: 'Chimichurri de la casa', grill: 'Zucchini y berenjena grillados',
  egg: 'Huevo', ham: 'Jamón cocido', prosciutto: 'Jamón crudo', cheese: 'Queso',
  bacon: 'Bacon crocante', cheddar: 'Cheddar', patty: 'Medallón de carne', lomo: 'Lomo 180g',
  veggie: 'Medallón Veggie', ternera: 'Ternera desmenuzada', bunBottom: 'Pan de papa (base)',
};
const PAN_LABEL = { papa: 'Pan de papa', focaccia: 'Pan de focaccia', artesanal: 'Pan artesanal' };

function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Nombre de ingrediente → tipo de capa
export function layerTypeOf(ingrediente) {
  const n = norm(ingrediente);
  if (n.includes('lechuga')) return 'leaf';
  if (n.includes('rucula')) return 'arugula';
  if (n.includes('tomate')) return 'tomato';
  if (n.includes('cebolla morada')) return 'onionRed';
  if (n.includes('cebolla')) return 'onion';
  if (n.includes('pepino')) return 'pickles';
  if (n.includes('ketchup')) return 'ketchup';
  if (n.includes('lactonesa')) return 'mayo';
  if (n.includes('salsa bruzz')) return 'bruzz';
  if (n.includes('barbacoa')) return 'bbq';
  if (n.includes('bacon') || n.includes('panceta')) return 'bacon';
  if (n.includes('cheddar')) return 'cheddar';
  if (n.includes('huevo')) return 'egg';
  if (n.includes('jamon crudo')) return 'prosciutto';
  if (n.includes('jamon')) return 'ham';
  if (n.includes('queso')) return 'cheese';
  if (n.includes('chimi')) return 'chimi';
  if (n.includes('zucchini') || n.includes('berenjena')) return 'grill';
  return null;
}

// Ingrediente → capas que se iluminan al seleccionarlo (incluye pan y carne)
export function typesForIngredient(ingrediente) {
  const n = norm(ingrediente);
  if (/^pan( |$)/.test(n)) return ['bunTop', 'bunBottom'];
  if (n.includes('lomo')) return ['lomo'];
  if (n.includes('ternera')) return ['ternera'];
  if (n.includes('veggie')) return ['veggie'];
  if (n.includes('carne') || n.includes('medallon')) return ['patty'];
  const t = layerTypeOf(ingrediente);
  return t ? [t] : [];
}

// Emoji representativo de cada ingrediente (para los chips)
export function emojiOf(ingrediente) {
  const n = norm(ingrediente);
  if (/^pan( |$)/.test(n) || n.startsWith('masa')) return '🍞';
  if (n.includes('lomo') || n.includes('ternera') || n.includes('carne') || n.includes('medallon')) return '🥩';
  const t = layerTypeOf(ingrediente);
  const byLayer = ({
    leaf: '🥬', arugula: '🌿', tomato: '🍅', onion: '🧅', onionRed: '🧅', pickles: '🥒',
    mayo: '🥛', ketchup: '🍅', bruzz: '🔥', bbq: '🍖', bacon: '🥓', cheddar: '🧀',
    egg: '🍳', ham: '🍖', prosciutto: '🥩', cheese: '🧀', chimi: '🌿', grill: '🍆',
  })[t];
  if (byLayer) return byLayer;
  if (/mozzarella|muzzarella|parmesano|sardo|roquefort|queso|ricota/.test(n)) return '🧀';
  if (/albahaca|oregano|romero|perejil|verdeo|hebras/.test(n)) return '🌿';
  if (n.includes('pepperoni')) return '🌶️';
  if (/oliva|aceituna/.test(n)) return '🫒';
  if (n.includes('nuez') || n.includes('nueces')) return '🌰';
  if (n.includes('pera')) return '🍐';
  if (n.includes('cherry')) return '🍒';
  if (n.includes('morron')) return '🫑';
  if (n.includes('papa')) return '🍟';
  if (/helado/.test(n)) return '🍦';
  if (/bebida|gaseosa/.test(n)) return '🥤';
  if (n.includes('juguete')) return '🧸';
  return '✨';
}

// Capas (de arriba hacia abajo) que componen el sándwich actual.
// `mainType` = 'patty' | 'lomo' | 'veggie' | 'ternera' | null (sin proteína)
export function buildLayers({ ingredientes, quitados, medallones, extras, mainType = 'patty' }) {
  const kept = ingredientes.filter((i) => !quitados.includes(i));
  const types = new Set(kept.map(layerTypeOf).filter(Boolean));
  const out = [{ id: 'bun-top', type: 'bunTop' }];

  VEG_ORDER.forEach((t) => { if (types.has(t)) out.push({ id: t, type: t }); });

  const eggs = (types.has('egg') ? 1 : 0) + (extras.huevo || 0);
  for (let i = 0; i < eggs; i++) out.push({ id: `egg-${i}`, type: 'egg' });
  ['ham', 'prosciutto', 'cheese'].forEach((t) => { if (types.has(t)) out.push({ id: t, type: t }); });

  const bacon = (types.has('bacon') ? 1 : 0) + (extras.panceta || 0);
  for (let i = 0; i < bacon; i++) out.push({ id: `bacon-${i}`, type: 'bacon' });

  const cheddar = (types.has('cheddar') ? 1 : 0) + (extras.cheddar || 0);
  for (let i = 0; i < cheddar; i++) out.push({ id: `cheddar-${i}`, type: 'cheddar' });

  if (mainType) for (let i = 0; i < medallones; i++) out.push({ id: `${mainType}-${i}`, type: mainType });
  out.push({ id: 'bun-bottom', type: 'bunBottom' });
  return out;
}

export default function LiveBurger({
  ingredientes, quitados, medallones, extras, dips, papas, bounceKey,
  highlight = null, exploded = false, friesHighlight = false,
  pan = 'papa', mainType = 'patty',
}) {
  const controls = useAnimationControls();

  // "Rebote" de toda la hamburguesa cada vez que el cliente cambia algo
  useEffect(() => {
    if (bounceKey > 0) {
      controls.start({ y: [0, -16, 0, -6, 0], transition: { duration: 0.55, ease: 'easeOut' } });
    }
  }, [bounceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const layers = useMemo(
    () => buildLayers({ ingredientes, quitados, medallones, extras, mainType }),
    [ingredientes, quitados, medallones, extras, mainType],
  );
  const labelOf = (type) => (
    type === 'bunTop' ? `${PAN_LABEL[pan]} (tapa)`
    : type === 'bunBottom' ? `${PAN_LABEL[pan]} (base)`
    : LAYER_LABELS[type]
  );

  // Escala para que la pila siempre entre en el escenario
  const GAP = exploded ? 13 : 0;
  const totalH = layers.reduce((s, l) => s + (H[l.type] || 12), 0) + GAP * (layers.length - 1);
  const scale = Math.min(1, 235 / totalH);
  const dipCount = dips?.mayo || 0;
  const hl = highlight && highlight.length ? highlight : null;

  return (
    <div className={`lb-stage lb-pan-${pan}`}>
      <div className="lb-glow" />
      <div className="lb-embers" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => <span key={i} style={{ '--i': i }} />)}
      </div>

      <motion.div className="lb-bounce" animate={controls}>
        <motion.div
          className="lb-stack-wrap"
          animate={{ scale, x: exploded ? -46 : 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{ transformOrigin: '50% 100%' }}
        >
          <div className="lb-stack" style={{ gap: GAP }}>
            <AnimatePresence mode="popLayout" initial={false}>
              {layers.map((l, idx) => {
                const isHl = hl && hl.includes(l.type);
                const isDim = hl && !isHl;
                const showLabel = exploded || isHl;
                return (
                  <motion.div
                    key={l.id}
                    layout
                    className="lb-row"
                    initial={{ opacity: 0, y: -90, scale: 0.6, rotate: idx % 2 ? 14 : -14 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.3, x: idx % 2 ? 120 : -120, rotate: idx % 2 ? 40 : -40, transition: { duration: 0.32 } }}
                    transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                  >
                    <div className={`lb-layer lb-${l.type}${isHl ? ' lb-hl' : ''}${isDim ? ' lb-dim' : ''}`} />
                    <span className={`lb-label${showLabel ? ' lb-label--on' : ''}${isHl ? ' lb-label--hl' : ''}`}>
                      {labelOf(l.type)}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      <div className="lb-plate" />

      {papas && (
        <motion.div
          key={papas}
          className={`lb-fries${papas === 'sazonadas' ? ' lb-fries--hot' : ''}${friesHighlight ? ' lb-fries--hl' : ''}`}
          initial={{ opacity: 0, x: -50, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          🍟{papas === 'sazonadas' && <span className="lb-fries-spark">🧡</span>}
          {(exploded || friesHighlight) && <span className="lb-fries-label">{papas === 'sazonadas' ? 'Papas sazonadas' : 'Papas fritas'}</span>}
        </motion.div>
      )}

      <AnimatePresence>
        {dipCount > 0 && (
          <motion.div
            className="lb-dip"
            initial={{ opacity: 0, x: 60, scale: 0.4, rotate: 40 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, x: 60, scale: 0.4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          >
            🥣<span className="lb-dip-count">{dipCount}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
