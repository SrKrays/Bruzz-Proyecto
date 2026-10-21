// ════════════════════════════════════════════════════════════
//  🎨 Arte v2 de las capas (Canvas 2D → textura de Pixi)
//  Vista 3/4 apenas desde arriba: cada capa tiene cara superior + borde,
//  luces, sombras de contacto, brillo especular y textura (poros, grasa, semillas…).
//  Cada draw*(ctx, W, lh, y0, R) dibuja en unidades de diseño; y0 = tope lógico de la capa.
// ════════════════════════════════════════════════════════════
export const LAYER_H2 = {
  bunTop: 58, leaf: 18, arugula: 14, tomato: 13, onion: 9, onionRed: 9, pickles: 11,
  mayo: 9, ketchup: 9, bruzz: 9, bbq: 9, chimi: 9, grill: 12, egg: 20, ham: 11, prosciutto: 11,
  cheese: 9, bacon: 12, cheddar: 12, patty: 28, lomo: 24, veggie: 26, ternera: 26, bunBottom: 26,
};
export const ART_W = 244;      // ancho del lienzo de cada capa (diseño)
export const PAD_TOP = 24;     // margen superior (caras superiores que sobresalen, goteos…)
export const PAD_BOT = 16;     // margen inferior (goteos, sombras)
const TAU = Math.PI * 2;
const CX = ART_W / 2;

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

// ── textura de ruido (poros / grano) reutilizable ──
let NOISE = null;
function noiseTile() {
  if (NOISE) return NOISE;
  const c = mkCanvas(128, 128); const g = c.getContext('2d'); const im = g.createImageData(128, 128); const r = rng(99);
  for (let i = 0; i < 128 * 128; i++) {
    const v = 128 + (r() - 0.5) * 150 + (r() > 0.93 ? (r() - 0.5) * 90 : 0);
    im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = Math.max(0, Math.min(255, v)); im.data[i * 4 + 3] = 255;
  }
  g.putImageData(im, 0, 0); NOISE = c; return c;
}
/** Aplica grano SOLO sobre lo ya dibujado. mode: 'overlay' | 'multiply' | 'soft-light' */
function grain(ctx, W, H, alpha = 0.35, scale = 1, mode = 'overlay') {
  const c = ctx.canvas; const S = c.width / ART_W;
  const t = mkCanvas(c.width, c.height); const g = t.getContext('2d');
  g.save(); g.scale(S * scale, S * scale); g.fillStyle = g.createPattern(noiseTile(), 'repeat'); g.fillRect(0, 0, c.width, c.height); g.restore();
  g.globalCompositeOperation = 'destination-in'; g.drawImage(c, 0, 0);          // recorta el grano a la forma dibujada
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = mode === 'multiply' ? 'multiply' : mode === 'soft-light' ? 'soft-light' : 'overlay';
  ctx.globalAlpha = alpha; ctx.drawImage(t, 0, 0); ctx.restore();
}
/** Luz: brillo arriba-izquierda y sombra abajo-derecha, clipeado a lo dibujado */
function lighten(ctx, x0, y0, x1, y1, hi = 0.28, lo = 0.35) {
  ctx.save(); ctx.globalCompositeOperation = 'source-atop';
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, `rgba(255,244,214,${hi})`); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(20,8,0,${lo})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, ART_W, 400); ctx.restore();
}
/** Bordes oscuros hacia adentro (volumen) */
function rim(ctx, cx, cy, rx, ry, a = 0.35) {
  ctx.save(); ctx.globalCompositeOperation = 'source-atop';
  const g = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.2, cx, cy, Math.max(rx, ry));
  g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(20,6,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, ART_W, 400); ctx.restore();
}
const lin = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rad = (ctx, x, y, r0, r1, stops, fx = x, fy = y) => { const g = ctx.createRadialGradient(fx, fy, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
function ell(ctx, cx, cy, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, 0, TAU); }
function soft(ctx, color, blur, oy = 2) { ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetY = oy; }
function nosoft(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.shadowOffsetX = 0; }
/** Mancha brillante (especular) */
function spec(ctx, x, y, rx, ry, rot = 0, a = 0.7) {
  ctx.save(); ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = rad(ctx, x, y, 0, Math.max(rx, ry), [[0, `rgba(255,255,255,${a})`], [1, 'rgba(255,255,255,0)']]);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.beginPath(); ctx.arc(x, y, rx, 0, TAU); ctx.fill(); ctx.restore();
}
/** Cilindro 3/4: borde + cara superior. Devuelve nada; dibuja desde y (tope de la cara superior). */
function cylinder(ctx, { cx = CX, y, rx, ry, h, top, side0, side1, edge = null }) {
  // base inferior (elipse) y cuerpo
  soft(ctx, 'rgba(0,0,0,0.45)', 6, 3);
  ctx.fillStyle = side1; ell(ctx, cx, y + h, rx, ry); ctx.fill(); nosoft(ctx);
  ctx.fillStyle = lin(ctx, cx - rx, 0, cx + rx, 0, [[0, side1], [0.22, side0], [0.55, side0], [1, side1]]);
  ctx.fillRect(cx - rx, y, rx * 2, h);
  ctx.fillStyle = lin(ctx, cx - rx, 0, cx + rx, 0, [[0, side1], [0.22, side0], [0.55, side0], [1, side1]]);
  ell(ctx, cx, y + h, rx, ry); ctx.fill();
  // cara superior
  ctx.fillStyle = top; ell(ctx, cx, y, rx, ry); ctx.fill();
  if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 1; ell(ctx, cx, y, rx, ry); ctx.stroke(); }
}

// ═══════════════════ PANES ═══════════════════
function bunTop(pan) {
  return (ctx, W, lh, y0) => {
    const r = rng(7); const base = y0 + lh - 7; const rx = 106; const domeH = lh - 8;
    const pal = pan === 'focaccia' ? ['#f9dd8d', '#e0a741', '#9c6410'] : pan === 'artesanal' ? ['#e8c183', '#c88a3e', '#7c4a14'] : ['#fcd388', '#e6962f', '#8e4a0e'];
    // sombra de contacto abajo
    soft(ctx, 'rgba(60,25,0,0.5)', 6, 3);
    ctx.fillStyle = pal[2];
    ctx.beginPath(); ctx.moveTo(CX - rx, base); ctx.bezierCurveTo(CX - rx - 6, y0 + domeH * 0.18, CX - rx * 0.5, y0 - 1, CX, y0 - 1);
    ctx.bezierCurveTo(CX + rx * 0.5, y0 - 1, CX + rx + 6, y0 + domeH * 0.18, CX + rx, base);
    ctx.ellipse(CX, base, rx, 8, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); nosoft(ctx);
    // cúpula con volumen
    ctx.fillStyle = rad(ctx, CX - 20, y0 + domeH * 0.22, 4, rx * 1.1, [[0, pal[0]], [0.4, pal[1]], [1, pal[2]]], CX - 38, y0 + 12);
    ctx.fill();
    // borde inferior más tostado (donde apoya)
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = lin(ctx, 0, base - 14, 0, base + 8, [[0, 'rgba(60,22,0,0)'], [1, 'rgba(60,22,0,0.65)']]); ctx.fillRect(0, base - 14, ART_W, 30); ctx.restore();
    // semillas de sésamo (más finas hacia los costados = foreshortening)
    if (pan === 'papa') {
      for (let i = 0; i < 38; i++) {
        const u = (r() - 0.5) * 1.7; const x = CX + u * rx * 0.86; const v = r(); const y = y0 + 6 + v * (domeH * 0.55) + Math.abs(u) * 6;
        if (Math.abs(u) > 0.84) continue;
        const sx = 4.2 * (1 - Math.abs(u) * 0.55); const rot = (r() - 0.5) * 1.5 + u * 0.6;
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.fillStyle = 'rgba(70,35,5,0.35)'; ctx.beginPath(); ctx.ellipse(0.7, 1.2, sx, 1.9, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = lin(ctx, 0, -2, 0, 2, [[0, '#fffbe8'], [1, '#e8d2a0']]); ctx.beginPath(); ctx.ellipse(0, 0, sx, 1.9, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.ellipse(-0.8, -0.6, sx * 0.4, 0.7, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
    } else if (pan === 'focaccia') {
      for (let i = 0; i < 20; i++) { const x = CX + (r() - 0.5) * 170; const y = y0 + 8 + r() * 26; ctx.fillStyle = 'rgba(100,55,8,0.4)'; ell(ctx, x, y, 5 + r() * 4, 2.2); ctx.fill(); ctx.fillStyle = 'rgba(255,238,170,0.55)'; ell(ctx, x - 1, y - 0.8, 2.6, 0.9); ctx.fill(); }
      ctx.strokeStyle = '#4f8f3a'; ctx.lineWidth = 1.2; for (let i = 0; i < 6; i++) { const x = CX - 50 + i * 20; ctx.beginPath(); ctx.moveTo(x, y0 + 14); ctx.lineTo(x + 8, y0 + 18 + r() * 4); ctx.stroke(); }
    } else {
      ctx.strokeStyle = 'rgba(255,240,215,0.7)'; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) { const x = CX + i * 44; ctx.beginPath(); ctx.moveTo(x - 14, y0 + 20); ctx.quadraticCurveTo(x, y0 + 10, x + 14, y0 + 20); ctx.stroke(); }
    }
    grain(ctx, W, 400, 0.42, 0.9, 'overlay');
    // brillos: grande y suave + puntual
    spec(ctx, CX - 38, y0 + domeH * 0.3, 56, 14, -0.18, 0.55);
    spec(ctx, CX + 36, y0 + domeH * 0.22, 14, 6, -0.3, 0.7);
    spec(ctx, CX - 66, y0 + domeH * 0.36, 11, 3, -0.5, 0.8);
    rim(ctx, CX, y0 + domeH * 0.5, rx, domeH * 0.8, 0.4);
  };
}
function bunBottom(pan) {
  return (ctx, W, lh, y0) => {
    const rx = 104; const h = lh - 8; const pal = pan === 'focaccia' ? ['#f0c25e', '#b97d22'] : pan === 'artesanal' ? ['#dba25a', '#8f5a1e'] : ['#eaa94a', '#8b4c0e'];
    cylinder(ctx, { y: y0 + 3, rx, ry: 7, h, top: lin(ctx, 0, y0 - 4, 0, y0 + 10, [[0, '#fff3cf'], [1, '#f1d79a']]), side0: pal[0], side1: pal[1] });
    // miga con poros en la cara superior
    const r = rng(17); ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(180,130,60,0.35)'; ell(ctx, CX + (r() - 0.5) * 190, y0 + 3 + (r() - 0.5) * 9, 1 + r() * 1.6, 0.6 + r() * 0.7); ctx.fill(); } ctx.restore();
    // tostado en el borde
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.strokeStyle = 'rgba(120,60,10,0.55)'; ctx.lineWidth = 2.2; ell(ctx, CX, y0 + 3, rx - 1, 6.5); ctx.stroke(); ctx.restore();
    grain(ctx, W, 400, 0.4, 0.9);
    lighten(ctx, 0, y0, 0, y0 + lh, 0.2, 0.4);
    spec(ctx, CX - 40, y0 + h * 0.65, 50, 4, 0, 0.35);
  };
}

// ═══════════════════ PROTEÍNAS ═══════════════════
function meatLayer({ top0, top1, side0, side1, seed, marks = true, flecks = null, wet = 0.5, sheen = true }) {
  return (ctx, W, lh, y0) => {
    const r = rng(seed); const rx = 104; const h = lh - 7;
    // borde irregular (cuerpo ondulado)
    cylinder(ctx, { y: y0 + 4, rx, ry: 7.5, h, top: lin(ctx, 0, y0 - 4, 0, y0 + 12, [[0, top0], [1, top1]]), side0, side1 });
    // costra irregular en el contorno
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 46; i++) { const a = r() * TAU; ctx.fillStyle = r() > 0.5 ? 'rgba(25,10,3,0.55)' : 'rgba(150,95,55,0.45)'; ell(ctx, CX + Math.cos(a) * (rx - 2), y0 + 4 + Math.sin(a) * 6.8, 2 + r() * 4, 1 + r() * 2.2, r()); ctx.fill(); }
    ctx.restore();
    if (marks) { // marcas de plancha en la cara superior
      ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.strokeStyle = 'rgba(15,6,2,0.6)'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(CX + i * 22 - 14, y0 - 3); ctx.lineTo(CX + i * 22 + 14, y0 + 11); ctx.stroke(); }
      ctx.restore();
    }
    // textura carnosa + poros + brillo de grasa
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 90; i++) { const x = CX + (r() - 0.5) * 200; const y = y0 + 4 + (r() - 0.5) * 12; ctx.fillStyle = r() > 0.6 ? 'rgba(255,200,150,0.42)' : 'rgba(18,7,2,0.5)'; ell(ctx, x, y, 0.8 + r() * 2, 0.5 + r() * 1.1); ctx.fill(); }
    for (let i = 0; i < 26; i++) { const x = CX + (r() - 0.5) * 190; const y = y0 + 6 + r() * (h - 6); ctx.fillStyle = r() > 0.5 ? 'rgba(20,8,2,0.45)' : 'rgba(170,110,70,0.4)'; ell(ctx, x, y, 1 + r() * 3, 0.8 + r() * 1.2); ctx.fill(); }
    if (flecks) for (let i = 0; i < 110; i++) { ctx.fillStyle = flecks[Math.floor(r() * flecks.length)]; ell(ctx, CX + (r() - 0.5) * 205, y0 + 4 + (r() - 0.5) * 12 + (r() > 0.6 ? r() * (h - 6) : 0), 1 + r() * 2.4, 0.8 + r() * 1.4, r()); ctx.fill(); }
    ctx.restore();
    grain(ctx, W, 400, 0.5, 0.8);
    lighten(ctx, 0, y0, 0, y0 + lh, 0.22, 0.45);
    if (sheen) { spec(ctx, CX - 30, y0 + 1, 58, 5, -0.08, 0.38 * wet * 2); spec(ctx, CX + 44, y0 + 6, 22, 3, 0.1, 0.5 * wet * 2); }
    rim(ctx, CX, y0 + 4, rx, 12, 0.25);
  };
}
const patty = meatLayer({ top0: '#7a4529', top1: '#4a2512', side0: '#4a2614', side1: '#24100a', seed: 21 });
const lomo = meatLayer({ top0: '#a5603b', top1: '#6d3520', side0: '#7a3d24', side1: '#3d1b10', seed: 23, marks: true, wet: 0.35 });
const veggie = meatLayer({ top0: '#8a7a3a', top1: '#4f4220', side0: '#5e4f26', side1: '#2e2810', seed: 25, marks: false, flecks: ['#6da13a', '#c9772b', '#e7c76a', '#3e2c10', '#a9452a'], wet: 0.2 });
const ternera = meatLayer({ top0: '#8f3a47', top1: '#52202a', side0: '#6a2733', side1: '#2e0f16', seed: 27, marks: false, flecks: ['#c45a68', '#4a1520', '#a03a4a'], wet: 0.6 });

// ═══════════════════ QUESOS / FIAMBRES ═══════════════════
function cheddarLayer({ melt = true, pale = false }) {
  return (ctx, W, lh, y0) => {
    const r = rng(31); const c0 = pale ? '#fff2b0' : '#ffdf5c'; const c1 = pale ? '#f2d36a' : '#f2a40e';
    const rx = melt ? 110 : 108;
    // lámina con esquinas colgando + goteos
    soft(ctx, 'rgba(90,40,0,0.5)', 5, 3);
    ctx.fillStyle = lin(ctx, 0, y0 - 6, 0, y0 + 16, [[0, c0], [1, c1]]);
    ctx.beginPath(); ctx.moveTo(CX - rx, y0 + 3);
    ctx.quadraticCurveTo(CX - rx * 0.5, y0 - 8, CX, y0 - 7); ctx.quadraticCurveTo(CX + rx * 0.5, y0 - 8, CX + rx, y0 + 3);
    const drips = melt ? [[-100, 12], [-72, 7], [-44, 17], [-14, 9], [16, 20], [44, 8], [72, 15], [98, 10]] : [[-104, 9], [104, 8]];
    // borde inferior con goteos (de derecha a izquierda)
    ctx.lineTo(CX + rx, y0 + 9);
    for (let i = drips.length - 1; i >= 0; i--) {
      const [dx, len] = drips[i]; const x = CX + dx; const L = len;
      ctx.bezierCurveTo(x + 9, y0 + 9, x + 6, y0 + 9 + L * 0.9, x + 3.6, y0 + 9 + L);
      ctx.bezierCurveTo(x + 1.6, y0 + 10 + L + 3, x - 1.6, y0 + 10 + L + 3, x - 3.6, y0 + 9 + L);
      ctx.bezierCurveTo(x - 6, y0 + 9 + L * 0.9, x - 9, y0 + 9, x - 14, y0 + 9);
    }
    ctx.lineTo(CX - rx, y0 + 9); ctx.closePath(); ctx.fill(); nosoft(ctx);
    // brillo húmedo y sombra de pliegues
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = lin(ctx, 0, y0 + 2, 0, y0 + 14, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(190,90,0,0.45)']]); ctx.fillRect(0, y0, ART_W, 16);
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(255,240,170,0.45)'; ctx.lineWidth = 1; ctx.beginPath(); const x = CX - 90 + i * 34; ctx.moveTo(x, y0 - 3); ctx.quadraticCurveTo(x + 10, y0 + 3, x + 22, y0 + 1); ctx.stroke(); }
    ctx.restore();
    drips.forEach(([dx, len]) => spec(ctx, CX + dx - 1.2, y0 + 9 + len * 0.55, 1.6, Math.max(3, len * 0.4), 0, 0.85));
    grain(ctx, W, 400, 0.28, 0.9, 'soft-light');
    spec(ctx, CX - 20, y0 - 3, 70, 4, -0.04, 0.55);
  };
}
function hamLayer() {
  return (ctx, W, lh, y0) => {
    const r = rng(41); ctx.fillStyle = lin(ctx, 0, y0 - 4, 0, y0 + 12, [[0, '#ffc9d3'], [1, '#e1768f']]);
    soft(ctx, 'rgba(90,20,30,0.4)', 4, 2);
    ctx.beginPath(); ctx.moveTo(CX - 108, y0 + 4);
    for (let x = -108; x <= 108; x += 6) ctx.lineTo(CX + x, y0 - 3 + Math.sin(x * 0.12) * 3 + Math.sin(x * 0.31) * 1.5);
    for (let x = 108; x >= -108; x -= 6) ctx.lineTo(CX + x, y0 + 9 + Math.sin(x * 0.1 + 1) * 2.5);
    ctx.closePath(); ctx.fill(); nosoft(ctx);
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.strokeStyle = 'rgba(160,50,70,0.35)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); const x = CX - 90 + i * 45; ctx.moveTo(x, y0 - 4); ctx.quadraticCurveTo(x + 14, y0 + 3, x + 6, y0 + 11); ctx.stroke(); } ctx.restore();
    grain(ctx, W, 400, 0.3, 0.9); spec(ctx, CX - 20, y0, 70, 3, 0, 0.55);
  };
}
function prosciuttoLayer() {
  return (ctx, W, lh, y0) => {
    const top = (x) => y0 - 3 + Math.sin(x * 0.17) * 3; const bot = (x) => y0 + 9 + Math.sin(x * 0.13 + 2) * 2.5;
    soft(ctx, 'rgba(70,10,20,0.45)', 4, 2);
    const cols = ['#9a1d37', '#c2455e', '#f6d5da', '#c2455e', '#a52a42'];
    for (let x = -108, i = 0; x < 108; x += 8, i++) { ctx.fillStyle = cols[i % cols.length]; ctx.beginPath(); ctx.moveTo(CX + x, top(x)); ctx.lineTo(CX + x + 8.5, top(x + 8)); ctx.lineTo(CX + x + 8.5, bot(x + 8)); ctx.lineTo(CX + x, bot(x)); ctx.closePath(); ctx.fill(); }
    nosoft(ctx);
    grain(ctx, W, 400, 0.3, 0.9); lighten(ctx, 0, y0 - 4, 0, y0 + 12, 0.25, 0.3); spec(ctx, CX - 10, y0 - 1, 80, 2.4, 0, 0.55);
  };
}
function baconLayer() {
  return (ctx, W, lh, y0) => {
    const strips = [{ dy: 4, ph: 0, x0: -112, x1: 108 }, { dy: 7.5, ph: 1.9, x0: -96, x1: 114 }, { dy: 1.5, ph: 3.7, x0: -110, x1: 100 }];
    strips.forEach((s) => {
      const wave = (x) => y0 + s.dy + Math.sin(x * 0.11 + s.ph) * 3.2 + Math.sin(x * 0.27 + s.ph) * 1.1; const th = 3.8;
      ctx.save();
      soft(ctx, 'rgba(40,5,0,0.6)', 4, 2);
      ctx.beginPath(); ctx.moveTo(CX + s.x0, wave(s.x0) - th);
      for (let x = s.x0; x <= s.x1; x += 3) ctx.lineTo(CX + x, wave(x) - th * (0.9 + 0.1 * Math.sin(x * 0.4)));
      for (let x = s.x1; x >= s.x0; x -= 3) ctx.lineTo(CX + x, wave(x) + th * (0.9 + 0.1 * Math.cos(x * 0.5)));
      ctx.closePath(); ctx.fillStyle = '#b8402a'; ctx.fill(); nosoft(ctx);
      ctx.clip();
      ctx.fillStyle = lin(ctx, 0, y0 - 4, 0, y0 + 16, [[0, '#e86a4e'], [0.55, '#b53a24'], [1, '#6e170c']]); ctx.fillRect(CX - 120, y0 - 6, 240, 30);
      // vetas de grasa
      ctx.strokeStyle = 'rgba(255,214,190,0.85)'; ctx.lineCap = 'round';
      [[-1.6, 1.8, [18, 7]], [1.3, 1.5, [11, 9]]].forEach(([off, lw, dash], k) => {
        ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.lineDashOffset = k * 5; ctx.beginPath();
        for (let x = s.x0; x <= s.x1; x += 3) { const yy = wave(x) + off; x === s.x0 ? ctx.moveTo(CX + x, yy) : ctx.lineTo(CX + x, yy); } ctx.stroke();
      });
      ctx.setLineDash([]);
      // borde crocante y brillo
      ctx.strokeStyle = 'rgba(70,10,0,0.7)'; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let x = s.x0; x <= s.x1; x += 3) { const yy = wave(x) + th; x === s.x0 ? ctx.moveTo(CX + x, yy) : ctx.lineTo(CX + x, yy); } ctx.stroke();
      ctx.strokeStyle = 'rgba(255,236,215,0.7)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = s.x0; x <= s.x1; x += 3) { const yy = wave(x) - th + 1.2; x === s.x0 ? ctx.moveTo(CX + x, yy) : ctx.lineTo(CX + x, yy); } ctx.stroke();
      ctx.restore();
    });
    grain(ctx, W, 400, 0.3, 0.8);
    spec(ctx, CX - 30, y0 + 1, 50, 2.5, 0, 0.45); spec(ctx, CX + 50, y0 + 5, 30, 2.2, 0, 0.4);
  };
}

// ═══════════════════ VERDURAS ═══════════════════
function lettuceLayer() {
  return (ctx, W, lh, y0) => {
    const r = rng(51);
    soft(ctx, 'rgba(10,50,0,0.55)', 6, 3);
    // volados grandes y chicos que forman un borde muy ondulado
    const row = (yy, amp, rmin, rmax, c0, c1, step) => {
      for (let x = -112; x <= 114; x += step) {
        const rr = rmin + r() * (rmax - rmin); const y = y0 + yy + Math.sin(x * 0.17 + yy) * amp + (r() - 0.5) * 2;
        const rx = rr * (1.2 + r() * 0.5); const ry = rr * (0.7 + r() * 0.3);
        ctx.save(); ctx.translate(CX + x, y); ctx.rotate((r() - 0.5) * 0.6);
        ctx.fillStyle = rad(ctx, 0, 0, 1, rx, [[0, c0], [1, c1]], -rx * 0.2, -ry * 0.3); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
    };
    row(9, 2.4, 6, 8, '#5aa83a', '#2a6e1a', 7);      // fondo (más oscuro)
    row(5.5, 3, 7, 10, '#9bd861', '#3f9a2a', 8);      // medio
    row(2.5, 3.4, 5.5, 8.5, '#bdea82', '#5cb23a', 9); // frente (más claro, puntas)
    nosoft(ctx);
    // nervaduras y bordes translúcidos
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 19; i++) { const x = CX - 112 + i * 12.5; ctx.strokeStyle = 'rgba(235,255,200,0.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y0 + 2); ctx.quadraticCurveTo(x + 3, y0 + 8, x + 6, y0 + 14); ctx.stroke(); }
    ctx.fillStyle = lin(ctx, 0, y0 + 8, 0, y0 + 20, [[0, 'rgba(0,40,0,0)'], [1, 'rgba(0,40,0,0.45)']]); ctx.fillRect(0, y0 + 8, ART_W, 14); ctx.restore();
    grain(ctx, W, 400, 0.3, 0.9); spec(ctx, CX - 40, y0 + 3, 50, 3, 0, 0.45); spec(ctx, CX + 60, y0 + 5, 20, 2, 0, 0.4);
  };
}
function arugulaLayer() {
  return (ctx, W, lh, y0) => {
    const r = rng(53); soft(ctx, 'rgba(0,30,0,0.5)', 5, 2);
    for (let i = 0; i < 26; i++) {
      const x = CX - 108 + i * 8.5 + (r() - 0.5) * 4; const y = y0 + 6 + (r() - 0.5) * 4; const L = 12 + r() * 6; const a = (r() - 0.5) * 1.0;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = lin(ctx, 0, -L, 0, L, [[0, '#4fb040'], [1, '#1c6420']]);
      ctx.beginPath(); ctx.moveTo(0, -L * 0.5); ctx.bezierCurveTo(7, -L * 0.2, 6, L * 0.4, 0, L * 0.5); ctx.bezierCurveTo(-6, L * 0.4, -7, -L * 0.2, 0, -L * 0.5); ctx.fill();
      ctx.strokeStyle = 'rgba(190,240,150,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -L * 0.45); ctx.lineTo(0, L * 0.45); ctx.stroke(); ctx.restore();
    }
    nosoft(ctx); grain(ctx, W, 400, 0.3, 0.9);
  };
}
function tomatoLayer() {
  return (ctx, W, lh, y0) => {
    const r = rng(55); const rx = 100;
    cylinder(ctx, { y: y0 + 2, rx, ry: 7, h: lh - 8, top: lin(ctx, 0, y0 - 6, 0, y0 + 10, [[0, '#ff7a62'], [1, '#e23a28']]), side0: '#e53a26', side1: '#8f1a10' });
    // gajos con gel y semillas
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 9; i++) { const x = CX - 78 + i * 19.5; ctx.fillStyle = 'rgba(255,170,130,0.5)'; ell(ctx, x, y0 + 2, 7.5, 3.6); ctx.fill(); ctx.fillStyle = '#ffe9a6'; ell(ctx, x - 1.5, y0 + 2, 2, 1.1, r()); ctx.fill(); ell(ctx, x + 2, y0 + 3, 1.7, 1, r()); ctx.fill(); }
    ctx.strokeStyle = 'rgba(160,30,15,0.5)'; ctx.lineWidth = 0.9; ell(ctx, CX, y0 + 2, rx - 4, 5.5); ctx.stroke(); ctx.restore();
    grain(ctx, W, 400, 0.25, 0.9, 'soft-light'); lighten(ctx, 0, y0 - 4, 0, y0 + 14, 0.25, 0.4);
    spec(ctx, CX - 40, y0 - 1, 54, 3, -0.04, 0.8); spec(ctx, CX + 50, y0 + 3, 16, 2, 0, 0.6);
  };
}
function ringsLayer(c0, c1, line) {
  return (ctx, W, lh, y0) => {
    soft(ctx, 'rgba(40,0,40,0.35)', 3, 2);
    for (let i = 0; i < 9; i++) {
      const x = CX - 92 + i * 23; const y = y0 + 4 + Math.sin(i * 1.7) * 1.2; const rx = 13; const ry = 4.6;
      ctx.strokeStyle = lin(ctx, x - rx, 0, x + rx, 0, [[0, c1], [0.5, c0], [1, c1]]); ctx.lineWidth = 3.4; ell(ctx, x, y, rx, ry); ctx.stroke();
      ctx.strokeStyle = line; ctx.lineWidth = 1; ell(ctx, x, y, rx - 2.2, ry - 1); ctx.stroke();
    }
    nosoft(ctx);
    // anillos concéntricos delgados al frente
    for (let i = 0; i < 6; i++) { const x = CX - 70 + i * 28; ctx.strokeStyle = c0; ctx.globalAlpha = 0.85; ctx.lineWidth = 2.6; ell(ctx, x, y0 + 5.5, 11, 3.4); ctx.stroke(); ctx.globalAlpha = 1; }
    grain(ctx, W, 400, 0.2, 0.9, 'soft-light'); spec(ctx, CX - 10, y0 + 2, 90, 1.8, 0, 0.55);
  };
}
function picklesLayer() {
  return (ctx, W, lh, y0) => {
    const r = rng(57);
    for (let i = 0; i < 9; i++) {
      const x = CX - 90 + i * 22.5; const y = y0 + 5 + Math.sin(i * 2.1) * 1.2;
      soft(ctx, 'rgba(10,40,0,0.5)', 3, 2); ctx.fillStyle = '#4d8a22'; ell(ctx, x, y + 1, 12, 5.6); ctx.fill(); nosoft(ctx);
      ctx.fillStyle = rad(ctx, x, y, 1, 11, [[0, '#cbe88a'], [1, '#82b83e']]); ell(ctx, x, y, 10, 4.5); ctx.fill();
      ctx.fillStyle = '#eef7c0'; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ell(ctx, x + Math.cos(a) * 5, y + Math.sin(a) * 2, 0.9, 0.55); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ell(ctx, x - 3, y - 1.4, 3.4, 0.9); ctx.fill();
    }
    grain(ctx, W, 400, 0.25, 0.9);
  };
}
function grillLayer() {
  return (ctx, W, lh, y0) => {
    for (let i = 0, x = -104; x < 104; x += 26, i++) {
      cylinder(ctx, { cx: CX + x + 12, y: y0 + 2, rx: 13, ry: 4.6, h: 7, top: i % 2 ? '#5aa05a' : '#8a56b0', side0: i % 2 ? '#2c6a38' : '#4d2a6e', side1: i % 2 ? '#183c22' : '#2a1640' });
      ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.6;
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(CX + x + 12 + k * 6 - 3, y0 - 1); ctx.lineTo(CX + x + 12 + k * 6 + 3, y0 + 5); ctx.stroke(); } ctx.restore();
    }
    grain(ctx, W, 400, 0.3, 0.9); spec(ctx, CX, y0 + 1, 90, 2.4, 0, 0.5);
  };
}
function eggLayer() {
  return (ctx, W, lh, y0) => {
    const r = rng(59);
    soft(ctx, 'rgba(60,40,0,0.4)', 5, 3);
    ctx.fillStyle = lin(ctx, 0, y0, 0, y0 + 18, [[0, '#ffffff'], [1, '#e9e3cf']]);
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; const k = 1 + Math.sin(a * 3 + 1) * 0.07 + Math.sin(a * 5) * 0.03; const x = CX + Math.cos(a) * 74 * k; const y = y0 + 10 + Math.sin(a) * 8.2 * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.fill(); nosoft(ctx);
    ctx.strokeStyle = 'rgba(200,190,150,0.7)'; ctx.lineWidth = 0.8; ctx.stroke();
    // yema
    soft(ctx, 'rgba(120,50,0,0.5)', 5, 3);
    ctx.fillStyle = rad(ctx, CX - 10, y0 + 7, 1, 11, [[0, '#ffe66a'], [0.6, '#ffb300'], [1, '#e67a00']], CX - 13, y0 + 4); ctx.beginPath(); ctx.arc(CX - 10, y0 + 8, 10.5, 0, TAU); ctx.fill(); nosoft(ctx);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ell(ctx, CX - 14, y0 + 4, 4.2, 2, -0.5); ctx.fill();
    grain(ctx, W, 400, 0.15, 0.9, 'soft-light');
  };
}

// ═══════════════════ SALSAS ═══════════════════
function sauceLayer(c0, c1, seed, hi = 'rgba(255,255,255,0.8)') {
  return (ctx, W, lh, y0) => {
    const r = rng(seed);
    soft(ctx, 'rgba(0,0,0,0.4)', 4, 2);
    ctx.fillStyle = lin(ctx, 0, y0 - 2, 0, y0 + 12, [[0, c0], [1, c1]]);
    // banda ondulada con goteos
    ctx.beginPath(); ctx.moveTo(CX - 104, y0 + 3);
    for (let x = -104; x <= 104; x += 8) ctx.lineTo(CX + x, y0 + 0.5 + Math.sin(x * 0.2 + seed) * 1.6);
    ctx.lineTo(CX + 104, y0 + 7);
    const drips = []; for (let i = 0; i < 7; i++) drips.push([-92 + i * 31 + (r() - 0.5) * 10, 5 + r() * 9]);
    for (let i = drips.length - 1; i >= 0; i--) { const [dx, L] = drips[i]; const x = CX + dx;
      ctx.bezierCurveTo(x + 7, y0 + 7, x + 4.5, y0 + 7 + L * 0.8, x + 2.8, y0 + 7 + L); ctx.bezierCurveTo(x + 1, y0 + 8 + L + 2.4, x - 1, y0 + 8 + L + 2.4, x - 2.8, y0 + 7 + L); ctx.bezierCurveTo(x - 4.5, y0 + 7 + L * 0.8, x - 7, y0 + 7, x - 12, y0 + 7); }
    ctx.lineTo(CX - 104, y0 + 7); ctx.closePath(); ctx.fill(); nosoft(ctx);
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = lin(ctx, 0, y0 + 3, 0, y0 + 11, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.3)']]); ctx.fillRect(0, y0, ART_W, 14); ctx.restore();
    spec(ctx, CX - 30, y0 + 1.5, 60, 2.2, 0, 0.9); spec(ctx, CX + 50, y0 + 2, 22, 1.8, 0, 0.8);
    drips.forEach(([dx, L]) => { ctx.fillStyle = hi; ell(ctx, CX + dx - 1, y0 + 7 + L * 0.55, 0.9, Math.max(1.8, L * 0.3)); ctx.fill(); });
  };
}
function chimiLayer() {
  const base = sauceLayer('#6fcf6a', '#2b8a30', 63, 'rgba(230,255,220,0.8)');
  return (ctx, W, lh, y0) => {
    base(ctx, W, lh, y0); const r = rng(64);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = r() > 0.5 ? 'rgba(20,80,20,0.7)' : 'rgba(210,60,40,0.6)'; ell(ctx, CX - 100 + r() * 200, y0 + 1 + r() * 6, 0.9 + r() * 1.5, 0.6 + r() * 1, r()); ctx.fill(); }
  };
}

const DRAW2 = {
  leaf: lettuceLayer(), arugula: arugulaLayer(), tomato: tomatoLayer(),
  onion: ringsLayer('#fbf4fb', '#d9c8e2', '#c9aed4'), onionRed: ringsLayer('#d97ab3', '#8a2c68', '#f2bde0'),
  pickles: picklesLayer(), grill: grillLayer(), egg: eggLayer(),
  mayo: sauceLayer('#fffdf0', '#efe0ac', 61), ketchup: sauceLayer('#f2503a', '#a81c10', 62), bruzz: sauceLayer('#ffbb5a', '#f2700f', 65), bbq: sauceLayer('#94562c', '#4a230d', 66, 'rgba(255,220,180,0.6)'),
  chimi: chimiLayer(),
  ham: hamLayer(), prosciutto: prosciuttoLayer(), bacon: baconLayer(),
  cheddar: cheddarLayer({ melt: true }), cheese: cheddarLayer({ melt: false, pale: true }),
  patty, lomo, veggie, ternera,
};

/** Dibuja la capa y devuelve { canvas, w, h, top } (top = margen sobre el tope lógico, en unidades de diseño). */
export function drawLayer2(type, pan = 'papa', S = 2.4) {
  const lh = LAYER_H2[type] || 12;
  const W = ART_W; const H = lh + PAD_TOP + PAD_BOT;
  const c = mkCanvas(W * S, H * S); const ctx = c.getContext('2d');
  ctx.scale(S, S);
  const fn = type === 'bunTop' ? bunTop(pan) : type === 'bunBottom' ? bunBottom(pan) : (DRAW2[type] || patty);
  fn(ctx, W, lh, PAD_TOP);
  return { canvas: c, w: W, h: H, top: PAD_TOP, lh };
}

// ═══════════════════ PAPAS Y DIP ═══════════════════
export function drawFries2(hot, S = 2.4) {
  const W = 84; const H = 90; const c = mkCanvas(W * S, H * S); const ctx = c.getContext('2d'); ctx.scale(S, S); const r = rng(hot ? 72 : 71);
  const c0 = hot ? '#ffb45a' : '#ffe27a'; const c1 = hot ? '#e0620f' : '#f0a922'; const cx = W / 2;
  const sticks = [];
  for (let i = 0; i < 15; i++) sticks.push({ x: cx - 21 + i * 3, h: 36 + r() * 24, rot: (i - 7) * 0.065 + (r() - 0.5) * 0.12, z: r() });
  sticks.sort((a, b) => a.z - b.z).forEach((s) => {
    ctx.save(); ctx.translate(s.x, 52); ctx.rotate(s.rot);
    soft(ctx, 'rgba(60,25,0,0.45)', 3, 1);
    ctx.fillStyle = lin(ctx, -2.8, 0, 2.8, 0, [[0, c1], [0.45, c0], [1, c1]]); ctx.beginPath(); ctx.roundRect(-2.8, -s.h, 5.6, s.h, 1.2); ctx.fill(); nosoft(ctx);
    ctx.fillStyle = 'rgba(255,250,220,0.5)'; ctx.fillRect(-1.6, -s.h + 1, 1.1, s.h - 3);
    if (hot) { ctx.fillStyle = 'rgba(120,40,0,0.7)'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc((r() - 0.5) * 3, -r() * s.h, 0.7, 0, TAU); ctx.fill(); } }
    ctx.restore();
  });
  grain(ctx, W, H, 0.3, 0.7);
  // cajita
  ctx.fillStyle = lin(ctx, 0, 0, W, 0, [[0, '#d81c4e'], [0.5, '#ff5a8a'], [1, '#b0123c']]);
  soft(ctx, 'rgba(0,0,0,0.5)', 5, 3);
  ctx.beginPath(); ctx.moveTo(cx - 25, 50); ctx.lineTo(cx + 25, 50); ctx.lineTo(cx + 19, H - 6); ctx.lineTo(cx - 19, H - 6); ctx.closePath(); ctx.fill(); nosoft(ctx);
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.moveTo(cx - 23, 62); ctx.lineTo(cx + 23, 62); ctx.lineTo(cx + 21.5, 74); ctx.lineTo(cx - 21.5, 74); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(cx - 24, 51, 3, 34);
  return { canvas: c, w: W, h: H };
}
export function drawDip2(S = 2.4) {
  const W = 62; const H = 44; const c = mkCanvas(W * S, H * S); const ctx = c.getContext('2d'); ctx.scale(S, S); const cx = W / 2;
  soft(ctx, 'rgba(0,0,0,0.5)', 5, 3); ctx.fillStyle = '#26418a'; ell(ctx, cx, 26, 26, 8); ctx.fill(); nosoft(ctx);
  ctx.fillStyle = lin(ctx, 0, 10, 0, 38, [[0, '#7aa0f0'], [1, '#2a4690']]); ctx.beginPath(); ctx.moveTo(cx - 26, 14); ctx.bezierCurveTo(cx - 24, 40, cx + 24, 40, cx + 26, 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lin(ctx, 0, 6, 0, 22, [[0, '#fffbe6'], [1, '#f0dc9c']]); ell(ctx, cx, 14, 24, 7.4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ell(ctx, cx - 7, 11.6, 8, 2, -0.2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ell(ctx, cx - 11, 27, 6, 3, -0.4); ctx.fill();
  return { canvas: c, w: W, h: H };
}
