import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

// ════════════════════════════════════════════════════════════
//  🍔 LiveBurger — la hamburguesa que se arma en vivo.
//  Ilustración 100% CSS: cada capa entra/sale con animación
//  cuando el cliente suma o quita ingredientes.
// ════════════════════════════════════════════════════════════

// Altura aproximada de cada capa (px) → para escalar la pila y que siempre entre
const H = {
  bunTop: 58, leaf: 18, arugula: 14, tomato: 13, onion: 9, onionRed: 9, pickles: 11,
  mayo: 9, ketchup: 9, bruzz: 9, bbq: 9, egg: 20, bacon: 12, cheddar: 12, patty: 28, bunBottom: 26,
};

// Orden visual de verduras y salsas (de arriba hacia abajo)
const VEG_ORDER = ['arugula', 'leaf', 'tomato', 'onion', 'onionRed', 'pickles', 'mayo', 'ketchup', 'bruzz', 'bbq'];

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

// Emoji representativo de cada ingrediente (para los chips)
export function emojiOf(ingrediente) {
  const t = layerTypeOf(ingrediente);
  return ({
    leaf: '🥬', arugula: '🌿', tomato: '🍅', onion: '🧅', onionRed: '🧅', pickles: '🥒',
    mayo: '🥛', ketchup: '🍅', bruzz: '🔥', bbq: '🍖', bacon: '🥓', cheddar: '🧀',
  })[t] || '🍔';
}

export default function LiveBurger({ ingredientes, quitados, medallones, extras, dips, papas, bounceKey }) {
  const controls = useAnimationControls();

  // "Rebote" de toda la hamburguesa cada vez que el cliente cambia algo
  useEffect(() => {
    if (bounceKey > 0) {
      controls.start({ y: [0, -16, 0, -6, 0], transition: { duration: 0.55, ease: 'easeOut' } });
    }
  }, [bounceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const layers = useMemo(() => {
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
  }, [ingredientes, quitados, medallones, extras]);

  // Escala para que la pila siempre entre en el escenario
  const totalH = layers.reduce((s, l) => s + (H[l.type] || 12), 0);
  const scale = Math.min(1, 235 / totalH);
  const dipCount = dips?.mayo || 0;

  return (
    <div className="lb-stage" aria-hidden="true">
      <div className="lb-glow" />
      <div className="lb-embers">
        {Array.from({ length: 10 }).map((_, i) => <span key={i} style={{ '--i': i }} />)}
      </div>

      <motion.div className="lb-bounce" animate={controls}>
      <motion.div
        className="lb-stack-wrap"
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        style={{ transformOrigin: '50% 100%' }}
      >
        <div className="lb-stack">
          <AnimatePresence mode="popLayout" initial={false}>
            {layers.map((l, idx) => (
              <motion.div
                key={l.id}
                layout
                className={`lb-layer lb-${l.type}`}
                initial={{ opacity: 0, y: -90, scale: 0.6, rotate: idx % 2 ? 14 : -14 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.3, x: idx % 2 ? 120 : -120, rotate: idx % 2 ? 40 : -40, transition: { duration: 0.32 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
      </motion.div>

      <div className="lb-plate" />

      {papas && (
        <motion.div
          key={papas}
          className={`lb-fries${papas === 'sazonadas' ? ' lb-fries--hot' : ''}`}
          initial={{ opacity: 0, x: -50, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          🍟{papas === 'sazonadas' && <span className="lb-fries-spark">🧡</span>}
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
