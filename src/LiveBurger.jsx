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
  mayo: 9, ketchup: 9, bruzz: 9, bbq: 9, egg: 20, bacon: 12, cheddar: 12, patty: 28, bunBottom: 26,
};

// Orden visual de verduras y salsas (de arriba hacia abajo)
const VEG_ORDER = ['arugula', 'leaf', 'tomato', 'onion', 'onionRed', 'pickles', 'mayo', 'ketchup', 'bruzz', 'bbq'];

// Etiqueta legible de cada capa
export const LAYER_LABELS = {
  bunTop: 'Pan de papa (tapa)', leaf: 'Lechuga fresca', arugula: 'Rúcula', tomato: 'Tomate fresco',
  onion: 'Cebolla', onionRed: 'Cebolla morada', pickles: 'Pepinos encurtidos',
  mayo: 'Lactonesa de la casa', ketchup: 'Ketchup', bruzz: 'Salsa Bruzz', bbq: 'Barbacoa',
  egg: 'Huevo', bacon: 'Bacon crocante', cheddar: 'Cheddar', patty: 'Medallón de carne', bunBottom: 'Pan de papa (base)',
};

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
  return null;
}

// Ingrediente → capas que se iluminan al seleccionarlo (incluye pan y carne)
export function typesForIngredient(ingrediente) {
  const n = norm(ingrediente);
  if (n.startsWith('pan')) return ['bunTop', 'bunBottom'];
  if (n.includes('carne') || n.includes('medallon')) return ['patty'];
  const t = layerTypeOf(ingrediente);
  return t ? [t] : [];
}

// Emoji representativo de cada ingrediente (para los chips)
export function emojiOf(ingrediente) {
  const n = norm(ingrediente);
  if (n.startsWith('pan')) return '🍞';
  if (n.includes('carne') || n.includes('medallon')) return '🥩';
  const t = layerTypeOf(ingrediente);
  return ({
    leaf: '🥬', arugula: '🌿', tomato: '🍅', onion: '🧅', onionRed: '🧅', pickles: '🥒',
    mayo: '🥛', ketchup: '🍅', bruzz: '🔥', bbq: '🍖', bacon: '🥓', cheddar: '🧀',
  })[t] || '🍔';
}

// Capas (de arriba hacia abajo) que componen la hamburguesa actual
export function buildLayers({ ingredientes, quitados, medallones, extras }) {
  const kept = ingredientes.filter((i) => !quitados.includes(i));
  const types = new Set(kept.map(layerTypeOf).filter(Boolean));
  const out = [{ id: 'bun-top', type: 'bunTop' }];

  VEG_ORDER.forEach((t) => { if (types.has(t)) out.push({ id: t, type: t }); });
  for (let i = 0; i < (extras.huevo || 0); i++) out.push({ id: `egg-${i}`, type: 'egg' });

  const bacon = (types.has('bacon') ? 1 : 0) + (extras.panceta || 0);
  for (let i = 0; i < bacon; i++) out.push({ id: `bacon-${i}`, type: 'bacon' });

  const cheddar = (types.has('cheddar') ? 1 : 0) + (extras.cheddar || 0);
  for (let i = 0; i < cheddar; i++) out.push({ id: `cheddar-${i}`, type: 'cheddar' });

  for (let i = 0; i < medallones; i++) out.push({ id: `patty-${i}`, type: 'patty' });
  out.push({ id: 'bun-bottom', type: 'bunBottom' });
  return out;
}

export default function LiveBurger({
  ingredientes, quitados, medallones, extras, dips, papas, bounceKey,
  highlight = null, exploded = false, friesHighlight = false,
}) {
  const controls = useAnimationControls();

  // "Rebote" de toda la hamburguesa cada vez que el cliente cambia algo
  useEffect(() => {
    if (bounceKey > 0) {
      controls.start({ y: [0, -16, 0, -6, 0], transition: { duration: 0.55, ease: 'easeOut' } });
    }
  }, [bounceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const layers = useMemo(
    () => buildLayers({ ingredientes, quitados, medallones, extras }),
    [ingredientes, quitados, medallones, extras],
  );

  // Escala para que la pila siempre entre en el escenario
  const GAP = exploded ? 13 : 0;
  const totalH = layers.reduce((s, l) => s + (H[l.type] || 12), 0) + GAP * (layers.length - 1);
  const scale = Math.min(1, 235 / totalH);
  const dipCount = dips?.mayo || 0;
  const hl = highlight && highlight.length ? highlight : null;

  return (
    <div className="lb-stage">
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
                      {LAYER_LABELS[l.type]}
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
