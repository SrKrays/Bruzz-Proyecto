// ════════════════════════════════════════════════════════════
//  🎨 Arte procedural de cada capa de la burger (PixiJS)
//  Cada función dibuja una capa con degradados, brillos y detalles.
//  Más adelante, cada una se puede reemplazar por una FOTO real
//  (ver LAYER_PHOTOS en PixiBurger.jsx) sin tocar nada más.
//  Convención: x de -w/2 a w/2, y de 0 (arriba) a h (abajo).
// ════════════════════════════════════════════════════════════
import { Graphics, FillGradient } from 'pixi.js';

// Alto de cada capa (igual que la burger CSS, para que se apile igual)
export const LAYER_H = {
  bunTop: 58, leaf: 18, arugula: 14, tomato: 13, onion: 9, onionRed: 9, pickles: 11,
  mayo: 9, ketchup: 9, bruzz: 9, bbq: 9, chimi: 9, grill: 12, egg: 20, ham: 11, prosciutto: 11,
  cheese: 9, bacon: 12, cheddar: 12, patty: 28, lomo: 24, veggie: 26, ternera: 26, bunBottom: 26,
};
export const LAYER_W = 240;     // ancho del lienzo de cada capa
export const LAYER_PAD = 8;     // margen arriba/abajo (gotas, sombras)

// ── utilidades ───────────────────────────────────────────────
const lg = (stops, x0 = 0, y0 = 0, x1 = 0, y1 = 1) => new FillGradient({
  type: 'linear', start: { x: x0, y: y0 }, end: { x: x1, y: y1 },
  colorStops: stops.map(([offset, color]) => ({ offset, color })),
});
function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function ellPts(cx, cy, rx, ry, rot = 0, n = 18) {
  const pts = [];
  const c = Math.cos(rot); const s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2; const x = Math.cos(a) * rx; const y = Math.sin(a) * ry;
    pts.push(cx + x * c - y * s, cy + x * s + y * c);
  }
  return pts;
}
const ell = (g, cx, cy, rx, ry, rot = 0) => g.poly(ellPts(cx, cy, rx, ry, rot));
// banda ondulada entre dos funciones y(x)
function band(x0, x1, top, bot, step = 4) {
  const pts = [];
  for (let x = x0; x <= x1; x += step) pts.push(x, top(x));
  for (let x = x1; x >= x0; x -= step) pts.push(x, bot(x));
  return pts;
}

// ── panes ────────────────────────────────────────────────────
function bunTopPapa() {
  const g = new Graphics(); const r = rng(7);
  const dome = (x, y, w, h) => { // cúpula
    g.moveTo(x - w / 2, y + h).bezierCurveTo(x - w / 2 - 4, y + h * 0.15, x - w * 0.28, y - 1, x, y - 1)
      .bezierCurveTo(x + w * 0.28, y - 1, x + w / 2 + 4, y + h * 0.15, x + w / 2, y + h).closePath();
  };
  dome(0, 0, 212, 58);
  g.fill(lg([[0, '#fbd37c'], [0.3, '#eba63a'], [0.7, '#c9791b'], [1, '#8f4d0f']]));
  // brillo lateral
  g.poly(ellPts(-34, 14, 54, 11, -0.18)).fill({ color: '#ffffff', alpha: 0.2 });
  g.poly(ellPts(-48, 10, 22, 4, -0.25)).fill({ color: '#ffffff', alpha: 0.28 });
  // sombra de abajo
  g.roundRect(-104, 46, 208, 12, 6).fill({ color: '#5a2c06', alpha: 0.4 });
  // semillas de sésamo
  for (let i = 0; i < 26; i++) {
    const x = (r() - 0.5) * 150; const y = 8 + r() * 30;
    if ((x / 100) ** 2 + ((y - 58) / 62) ** 2 > 0.92) continue;
    const rot = (r() - 0.5) * 1.6;
    g.poly(ellPts(x + 0.8, y + 1.3, 4.2, 2.1, rot, 10)).fill({ color: '#6b3a08', alpha: 0.35 });
    g.poly(ellPts(x, y, 4.2, 2.1, rot, 10)).fill('#fff2d4');
    g.poly(ellPts(x - 0.8, y - 0.5, 2, 0.8, rot, 8)).fill({ color: '#ffffff', alpha: 0.7 });
  }
  return { g, w: 212, h: 58 };
}
function bunTopFocaccia() {
  const g = new Graphics(); const r = rng(11);
  g.roundRect(-108, 8, 216, 28, 14).fill(lg([[0, '#f6d27a'], [0.5, '#e2a73f'], [1, '#b87a1c']]));
  g.poly(band(-100, 100, () => 8, () => 12, 6)).fill({ color: '#fff0b8', alpha: 0.3 });
  for (let i = 0; i < 22; i++) { // hoyuelos de aceite
    const x = -92 + r() * 184; const y = 14 + r() * 14;
    g.poly(ellPts(x, y, 5 + r() * 3, 2.4, 0, 12)).fill({ color: '#8a5410', alpha: 0.35 });
    g.poly(ellPts(x - 1, y - 1, 3, 1, 0, 10)).fill({ color: '#fff2c4', alpha: 0.55 });
  }
  for (let i = 0; i < 16; i++) { // romero y sal
    const x = -96 + r() * 192; const y = 12 + r() * 16;
    if (i % 2) g.rect(x, y, 5, 1.4).fill('#4f8f3a'); else g.circle(x, y, 1.4).fill('#fff6d8');
  }
  g.roundRect(-104, 28, 208, 8, 4).fill({ color: '#6a3a08', alpha: 0.35 });
  return { g, w: 216, h: 36, offsetY: 22 };
}
function bunTopArtesanal() {
  const g = new Graphics(); const r = rng(13);
  g.moveTo(-104, 46).bezierCurveTo(-112, 12, -70, 0, 0, 0).bezierCurveTo(70, 0, 112, 12, 104, 46).closePath();
  g.fill(lg([[0, '#efc27a'], [0.4, '#d29544'], [1, '#8f5a1e']]));
  for (let i = 0; i < 3; i++) { // tajos con harina
    const x = -50 + i * 50;
    g.poly(band(x - 16, x + 16, (t) => 8 + Math.abs(t - x) * 0.25, (t) => 11 + Math.abs(t - x) * 0.25, 3)).fill({ color: '#fff3d8', alpha: 0.65 });
  }
  for (let i = 0; i < 40; i++) g.circle((r() - 0.5) * 190, 6 + r() * 34, 0.9 + r() * 0.8).fill({ color: '#fff3d8', alpha: 0.45 });
  g.roundRect(-100, 36, 200, 10, 5).fill({ color: '#5a3208', alpha: 0.4 });
  return { g, w: 216, h: 46, offsetY: 12 };
}
function bunBottom(pan) {
  const g = new Graphics();
  const w = 208; const h = pan === 'papa' ? 26 : 20;
  g.moveTo(-w / 2, 0).lineTo(w / 2, 0).bezierCurveTo(w / 2 + 2, h * 0.7, w / 2 - 22, h + 2, 0, h + 2)
    .bezierCurveTo(-w / 2 + 22, h + 2, -w / 2 - 2, h * 0.7, -w / 2, 0).closePath();
  g.fill(lg(pan === 'papa' ? [[0, '#eba94a'], [0.6, '#c27a1f'], [1, '#8b4c0e']] : pan === 'focaccia' ? [[0, '#f0c25e'], [1, '#b97d22']] : [[0, '#dba25a'], [1, '#8f5a1e']]));
  g.roundRect(-w / 2 + 8, 1, w - 16, 3, 1.5).fill({ color: '#fff0c4', alpha: 0.4 });
  g.poly(ellPts(-30, h - 7, 60, 5, 0.04)).fill({ color: '#ffffff', alpha: 0.13 });
  return { g, w, h };
}

// ── proteínas ────────────────────────────────────────────────
function patty() {
  const g = new Graphics(); const r = rng(21);
  const pts = [];
  for (let x = -108; x <= 108; x += 6) pts.push(x, 1 + Math.sin(x * 0.31) * 1.1 + r() * 1.2);
  for (let x = 108; x >= -108; x -= 6) pts.push(x, 26 + Math.sin(x * 0.27) * 1.2 + r() * 1.4);
  g.poly(pts).fill(lg([[0, '#9a5f3b'], [0.35, '#6a3d25'], [1, '#34190d']]));
  g.roundRect(-104, 2, 208, 6, 3).fill({ color: '#ffd0a0', alpha: 0.22 });
  for (let x = -96; x < 100; x += 24) // marcas de plancha
    g.poly([x, 4, x + 7, 4, x + 1, 24, x - 6, 24]).fill({ color: '#1e0d05', alpha: 0.42 });
  for (let i = 0; i < 46; i++) g.circle(-100 + r() * 200, 4 + r() * 20, 0.6 + r() * 1.1).fill({ color: r() > 0.5 ? '#c98a5e' : '#1d0c04', alpha: 0.45 });
  g.roundRect(-100, 20, 200, 6, 3).fill({ color: '#000000', alpha: 0.25 });
  return { g, w: 216, h: 28 };
}
function lomo() {
  const g = new Graphics(); const r = rng(23);
  const pts = [];
  for (let x = -110; x <= 110; x += 7) pts.push(x, 1 + Math.sin(x * 0.2) * 2 + r() * 1.5);
  for (let x = 110; x >= -110; x -= 7) pts.push(x, 22 + Math.sin(x * 0.17) * 2 + r() * 1.6);
  g.poly(pts).fill(lg([[0, '#b86a44'], [0.4, '#833a24'], [1, '#451c10']]));
  g.roundRect(-100, 3, 200, 5, 2.5).fill({ color: '#ffd8b0', alpha: 0.28 });
  for (let x = -100; x < 100; x += 26) g.poly([x, 4, x + 8, 4, x + 2, 20, x - 6, 20]).fill({ color: '#2a0f06', alpha: 0.38 });
  for (let i = 0; i < 22; i++) g.rect(-98 + r() * 190, 6 + r() * 12, 8 + r() * 10, 1).fill({ color: '#e7a37a', alpha: 0.3 });
  return { g, w: 220, h: 24 };
}
function veggie() {
  const g = new Graphics(); const r = rng(25);
  g.roundRect(-107, 1, 214, 24, 12).fill(lg([[0, '#8a7438'], [1, '#4d3d1b']]));
  for (let i = 0; i < 70; i++) {
    const c = ['#6da13a', '#c9772b', '#e7c76a', '#3e2c10', '#a9452a'][Math.floor(r() * 5)];
    g.circle(-100 + r() * 200, 4 + r() * 18, 1 + r() * 2).fill({ color: c, alpha: 0.75 });
  }
  g.roundRect(-100, 2, 200, 5, 2.5).fill({ color: '#fff0c4', alpha: 0.18 });
  g.roundRect(-100, 18, 200, 6, 3).fill({ color: '#000', alpha: 0.25 });
  return { g, w: 214, h: 26 };
}
function ternera() {
  const g = new Graphics(); const r = rng(27);
  g.roundRect(-107, 1, 214, 24, 12).fill(lg([[0, '#8e3a47'], [1, '#42131c']]));
  for (let i = 0; i < 70; i++) {
    const x = -100 + r() * 200; const y = 4 + r() * 17; const l = 9 + r() * 14; const a = (r() - 0.5) * 0.8;
    g.moveTo(x, y).quadraticCurveTo(x + l / 2, y + Math.sin(a) * 6, x + l, y + a * 4)
      .stroke({ width: 1.3 + r(), color: r() > 0.5 ? '#c45a68' : '#4a1520', alpha: 0.7 });
  }
  g.roundRect(-100, 2, 200, 4, 2).fill({ color: '#ffb0b8', alpha: 0.18 });
  return { g, w: 214, h: 26 };
}

// ── quesos y fiambres ───────────────────────────────────────
function cheddar() {
  const g = new Graphics(); const r = rng(31);
  const drips = [-96, -62, -20, 18, 54, 90];
  const pts = [-112, 0, 112, 0, 112, 7];
  for (let x = 112; x > -112; x -= 4) {
    let d = 0;
    drips.forEach((dx, i) => { const dist = Math.abs(x - dx); const len = 5 + (i * 37 % 4); if (dist < 7) d = Math.max(d, len * (1 - dist / 7)); });
    pts.push(x, 7 + d + Math.sin(x * 0.4) * 0.6);
  }
  pts.push(-112, 7);
  g.poly(pts).fill(lg([[0, '#ffe46a'], [0.5, '#ffc02a'], [1, '#ee9a14']]));
  g.roundRect(-106, 1, 212, 3, 1.5).fill({ color: '#ffffff', alpha: 0.4 });
  drips.forEach((dx) => g.circle(dx - 1, 9, 1.2).fill({ color: '#ffffff', alpha: 0.5 }));
  for (let i = 0; i < 6; i++) g.circle(-100 + r() * 200, 4 + r() * 3, 1).fill({ color: '#ffb81a', alpha: 0.5 });
  return { g, w: 224, h: 12 };
}
function cheese() {
  const g = new Graphics();
  g.poly([-111, 0, 111, 0, 108, 9, -108, 9]).fill(lg([[0, '#fff6bd'], [1, '#f1d268']]));
  g.roundRect(-104, 1, 208, 2.5, 1.2).fill({ color: '#fff', alpha: 0.5 });
  for (let i = 0; i < 4; i++) g.circle(-70 + i * 46, 5.5, 2).fill({ color: '#e7bf50', alpha: 0.5 });
  return { g, w: 222, h: 10 };
}
function ham() {
  const g = new Graphics();
  g.poly(band(-107, 107, (x) => 1 + Math.sin(x * 0.15) * 1.6, (x) => 9 + Math.sin(x * 0.12 + 1) * 1.8, 4)).fill(lg([[0, '#fbc0cc'], [1, '#dd7890']]));
  g.roundRect(-100, 2, 200, 2.5, 1.2).fill({ color: '#fff', alpha: 0.35 });
  return { g, w: 214, h: 11 };
}
function prosciutto() {
  const g = new Graphics();
  const top = (x) => 1 + Math.sin(x * 0.18) * 1.5; const bot = (x) => 9 + Math.sin(x * 0.14 + 2) * 1.6;
  const cols = ['#a1203a', '#c2455e', '#f3c9cf', '#c2455e'];
  for (let x = -106, i = 0; x < 106; x += 9, i++) g.poly(band(x, Math.min(x + 9, 106), top, bot, 3)).fill(cols[i % 4]);
  g.roundRect(-100, 2, 200, 2, 1).fill({ color: '#fff', alpha: 0.28 });
  return { g, w: 212, h: 11 };
}

// ── verduras ────────────────────────────────────────────────
function leaf() {
  const g = new Graphics(); const r = rng(41);
  g.poly(band(-118, 118, (x) => 2 + Math.sin(x * 0.45) * 2.2, () => 11, 3)).fill(lg([[0, '#8cd25a'], [1, '#4d9a2d']]));
  for (let x = -112; x <= 114; x += 11) { // volados
    const rr = 6.5 + r() * 2;
    g.circle(x, 11, rr).fill(lg([[0, '#74c04a'], [1, '#3f8a24']]));
    g.circle(x - 1.5, 9, rr * 0.5).fill({ color: '#b8ee8a', alpha: 0.4 });
  }
  for (let i = 0; i < 12; i++) g.moveTo(-108 + i * 19, 5).lineTo(-100 + i * 19, 13).stroke({ width: 0.9, color: '#d6f7b0', alpha: 0.55 });
  return { g, w: 236, h: 18 };
}
function arugula() {
  const g = new Graphics(); const r = rng(43);
  const pts = [-111, 12];
  for (let x = -111; x <= 111; x += 7) pts.push(x, 1 + (Math.round((x + 111) / 7) % 2) * 5 + r() * 2);
  pts.push(111, 12);
  g.poly(pts).fill(lg([[0, '#3f9a36'], [1, '#1f6a22']]));
  for (let i = 0; i < 14; i++) g.moveTo(-104 + i * 15, 10).lineTo(-100 + i * 15, 3).stroke({ width: 0.9, color: '#8fd47a', alpha: 0.6 });
  return { g, w: 222, h: 14 };
}
function tomato() {
  const g = new Graphics(); const r = rng(45);
  g.roundRect(-102, 1, 204, 11, 5.5).fill(lg([[0, '#ff8c72'], [0.4, '#e83d2c'], [1, '#a8190f']]));
  g.roundRect(-96, 2, 192, 3, 1.5).fill({ color: '#fff', alpha: 0.4 });
  for (let i = 0; i < 10; i++) g.poly(ellPts(-86 + i * 19 + r() * 4, 6.5, 2.6, 1.4, 0.2, 8)).fill({ color: '#ffe9a0', alpha: 0.85 });
  return { g, w: 204, h: 13 };
}
function ring(base1, base2, line) {
  return () => {
    const g = new Graphics();
    g.roundRect(-97, 1, 194, 7, 3.5).fill(lg([[0, base1], [1, base2]]));
    for (let x = -88; x <= 88; x += 22) g.poly(ellPts(x, 4.5, 10, 3, 0, 14)).stroke({ width: 1.3, color: line, alpha: 0.9 });
    g.roundRect(-90, 1.5, 180, 1.8, 1).fill({ color: '#fff', alpha: 0.4 });
    return { g, w: 194, h: 9 };
  };
}
function pickles() {
  const g = new Graphics();
  for (let x = -86; x <= 86; x += 20) {
    g.poly(ellPts(x, 5.5, 11.5, 5.2, 0, 16)).fill('#4f8a28');
    g.poly(ellPts(x, 5.2, 9.5, 4, 0, 16)).fill(lg([[0, '#b6e078'], [1, '#7bb53c']]));
    for (let k = -1; k <= 1; k++) g.circle(x + k * 4, 5.2, 0.8).fill({ color: '#e8f5b8', alpha: 0.9 });
  }
  return { g, w: 196, h: 11 };
}
function grill() {
  const g = new Graphics();
  for (let x = -104, i = 0; x < 104; x += 26, i++) {
    g.roundRect(x, 1, 24, 10, 4).fill(i % 2 ? lg([[0, '#3d7a48'], [1, '#1f4a28']]) : lg([[0, '#6a3f8a'], [1, '#2c1740']]));
    g.poly([x + 3, 3, x + 6, 3, x + 9, 9, x + 6, 9]).fill({ color: '#000', alpha: 0.35 });
    g.poly([x + 12, 3, x + 15, 3, x + 18, 9, x + 15, 9]).fill({ color: '#000', alpha: 0.35 });
  }
  return { g, w: 214, h: 12 };
}
function egg() {
  const g = new Graphics(); const r = rng(47);
  const pts = [];
  for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; const k = 1 + Math.sin(a * 3 + 1) * 0.06 + r() * 0.03; pts.push(Math.cos(a) * 70 * k, 11 + Math.sin(a) * 9.5 * k); }
  g.poly(pts).fill(lg([[0, '#ffffff'], [1, '#ece6d2']]));
  g.poly(pts).stroke({ width: 1, color: '#d9d0b4', alpha: 0.9 });
  g.circle(-10, 9, 9.5).fill({ color: '#b05a00', alpha: 0.3 });
  g.circle(-11, 8, 9).fill(lg([[0, '#ffe05a'], [0.6, '#ffb300'], [1, '#ff8a00']]));
  g.poly(ellPts(-14, 5, 3.6, 1.8, -0.5, 10)).fill({ color: '#fff', alpha: 0.8 });
  return { g, w: 150, h: 22 };
}

// ── salsas ──────────────────────────────────────────────────
function sauce(c1, c2, w = 206) {
  return () => {
    const g = new Graphics(); const r = rng(Math.round(w));
    g.roundRect(-w / 2, 0.5, w, 6, 3).fill(lg([[0, c1], [1, c2]]));
    for (let i = 0; i < 9; i++) { // gotas
      const x = -w / 2 + 12 + i * (w - 24) / 8 + (r() - 0.5) * 8; const l = 2.5 + r() * 4;
      g.roundRect(x - 2.6, 4, 5.2, l + 3, 2.6).fill(lg([[0, c1], [1, c2]]));
      g.circle(x - 0.8, 4 + l, 0.9).fill({ color: '#fff', alpha: 0.5 });
    }
    g.roundRect(-w / 2 + 6, 1.4, w - 12, 1.8, 1).fill({ color: '#fff', alpha: 0.5 });
    return { g, w, h: 9 };
  };
}

const DRAW = {
  bunTopPapa: bunTopPapa, bunTopFocaccia, bunTopArtesanal,
  patty, lomo, veggie, ternera, cheddar, cheese, ham, prosciutto,
  leaf, arugula, tomato, pickles, grill, egg,
  onion: ring('#fbf5fb', '#e2d2ea', '#c9aed4'),
  onionRed: ring('#d174ab', '#8a2c68', '#f0b4d8'),
  mayo: sauce('#fffbe4', '#f0dba0', 208), ketchup: sauce('#f0503c', '#b81f12', 204),
  bruzz: sauce('#ffb85a', '#ff7a12', 206), bbq: sauce('#8f522a', '#52280f', 204), chimi: sauce('#78cc78', '#2f8a2f', 204),
  bacon() {
    const g = new Graphics();
    const cols = ['#9c2517', '#d4553d', '#f4b9a6', '#d4553d'];
    const top = (x) => 3 + Math.sin(x * 0.11) * 2.6; const bot = (x) => 9.5 + Math.sin(x * 0.11 + 0.9) * 2.6;
    for (let x = -109, i = 0; x < 109; x += 11, i++) g.poly(band(x, Math.min(x + 11, 109), top, bot, 3)).fill(cols[i % 4]);
    g.poly(band(-109, 109, top, (x) => top(x) + 1.6, 3)).fill({ color: '#fff', alpha: 0.28 });
    return { g, w: 218, h: 12, offsetY: 0 };
  },
};

/** Devuelve { g, w, h } de la capa pedida (sin textura todavía). */
export function drawLayer(type, pan = 'papa') {
  if (type === 'bunTop') return (pan === 'focaccia' ? bunTopFocaccia : pan === 'artesanal' ? bunTopArtesanal : bunTopPapa)();
  if (type === 'bunBottom') return bunBottom(pan);
  const fn = DRAW[type];
  return fn ? fn() : DRAW.patty();
}

// ── Papas fritas y dip ───────────────────────────────────────
export function drawFries(hot) {
  const g = new Graphics(); const r = rng(51);
  for (let i = 0; i < 11; i++) { // papas
    const x = -18 + i * 3.6; const h = 26 + r() * 22; const rot = (i - 5) * 0.075 + (r() - 0.5) * 0.1;
    const c1 = hot ? '#ffb45a' : '#ffe58a'; const c2 = hot ? '#e9661a' : '#f2b02e';
    const cx = x; const cy = 6;
    const w = 5.2;
    g.poly([cx - w / 2, cy, cx + w / 2, cy, cx + w / 2 + Math.sin(rot) * h, cy - h, cx - w / 2 + Math.sin(rot) * h, cy - h]).fill(lg([[0, c1], [1, c2]], 0, 0, 1, 0));
    g.circle(cx + Math.sin(rot) * h, cy - h, w * 0.5).fill(c1);
    if (hot) g.circle(cx + Math.sin(rot) * h * 0.6, cy - h * 0.6, 0.9).fill({ color: '#7a2a00', alpha: 0.7 });
  }
  g.poly([-24, 6, 24, 6, 19, 46, -19, 46]).fill(lg([[0, '#ff5a8a'], [1, '#c8164c']], 0, 0, 1, 0));
  g.poly([-22, 18, 22, 18, 21, 28, -21, 28]).fill({ color: '#ffffff', alpha: 0.85 });
  g.poly([-24, 6, -21, 6, -17, 46, -19, 46]).fill({ color: '#fff', alpha: 0.22 });
  return { g, w: 60, h: 60, ox: 30, oy: 50 };
}
export function drawDip() {
  const g = new Graphics();
  g.poly(ellPts(0, 6, 24, 8, 0, 20)).fill('#3a5fb0');
  g.moveTo(-24, 6).bezierCurveTo(-22, 30, 22, 30, 24, 6).closePath().fill(lg([[0, '#6d93e8'], [1, '#2a4690']]));
  g.poly(ellPts(0, 6, 21, 6.4, 0, 20)).fill(lg([[0, '#fff8de'], [1, '#f0dc9c']]));
  g.poly(ellPts(-6, 4.5, 8, 2, -0.2, 12)).fill({ color: '#fff', alpha: 0.7 });
  g.poly(ellPts(-9, 22, 7, 2.5, -0.3, 10)).fill({ color: '#fff', alpha: 0.28 });
  return { g, w: 56, h: 40, ox: 28, oy: 26 };
}
