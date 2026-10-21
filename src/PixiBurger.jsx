// ════════════════════════════════════════════════════════════
//  🍔 PixiBurger v2 — hamburguesa en WebGL (PixiJS): arte detallado en Canvas2D,
//  parallax por capa, y animaciones físicas por ingrediente al sacar/poner.
//  Misma interfaz que <LiveBurger/> (que queda de respaldo).
//  FASE 2: poné fotos reales en LAYER_PHOTOS (tipo → URL) y listo.
// ════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useRef } from 'react';
import { Application, Container, Graphics, Sprite, Texture, FillGradient } from 'pixi.js';
import gsap from 'gsap';
import { buildLayers } from './LiveBurger';
import { drawLayer2, drawFries2, drawDip2, LAYER_H2, PAD_TOP } from './pixiBurgerArt2';

// Fase 2: { cheddar: '/capas/cheddar.png', ... }  (PNG con fondo transparente, ancho ~1000px)
// Si hay foto: { url, width } → se escala a `width` px de diseño; alto proporcional.
// Cada set: tipo → { f: archivo, w: ancho de diseño, sy: aplastado vertical, lh: alto que ocupa en la pila,
//                     top: true → el borde superior de la foto queda al ras de la capa (para goteos) }
export const PHOTO_SETS = {
  dilusso: {
    dir: 'fotos-burger/dilusso-capas/',
    bunTop:    { f: 'bunTop.png',    w: 214, sy: 0.56, lh: 58 },
    bunBottom: { f: 'bunBottom.png', w: 208, sy: 0.30, lh: 24 },
    patty:     { f: 'patty.png',     w: 214, sy: 0.32, lh: 26 },
    cheddar:   { f: 'cheddar.png',   w: 218, sy: 0.32, lh: 13, top: true },
    bacon:     { f: 'bacon.png',     w: 226, sy: 0.36, lh: 13 },
    onion:     { f: 'onion.png',     w: 220, sy: 0.32, lh: 12 },
    mayo:      { f: 'mayo.png',      w: 196, sy: 0.22, lh: 8 },
    ketchup:   { f: 'ketchup.png',   w: 196, sy: 0.22, lh: 8 },
  },
};
async function loadImageTexture(url) {
  const img = new Image();
  img.decoding = 'async'; img.crossOrigin = 'anonymous';
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const t = Texture.from(img);
  t.source.autoGenerateMipmaps = true; t.source.scaleMode = 'linear';
  return t;
}
async function loadPhotoSet(name) {
  const set = PHOTO_SETS[name]; const out = {};
  if (!set) return out;
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  const work = Promise.all(Object.keys(set).filter((k) => k !== 'dir').map(async (k) => {
    try { out[k] = { texture: await loadImageTexture(base + set.dir + set[k].f), ...set[k] }; } catch { /* sin foto → dibujo */ }
  }));
  // nunca bloquear la burger más de 5 s por las fotos
  await Promise.race([work, new Promise((r) => setTimeout(r, 5000))]);
  return out;
}

const DW = 300; const DH = 292;      // lienzo de diseño
const STACK_BASE_Y = 252;             // donde apoya la pila
const STACK_MAX = 232;

export function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

const radial = (stops) => new FillGradient({
  type: 'radial', center: { x: 0.5, y: 0.5 }, innerRadius: 0, outerCenter: { x: 0.5, y: 0.5 }, outerRadius: 0.5,
  colorStops: stops.map(([offset, color]) => ({ offset, color })),
});
const lin = (stops) => new FillGradient({ type: 'linear', start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, colorStops: stops.map(([offset, color]) => ({ offset, color })) });

// Personalidad de cada ingrediente al salir
const KIND = {
  cheddar: 'elastic', cheese: 'elastic',
  mayo: 'sauce', ketchup: 'sauce', bruzz: 'sauce', bbq: 'sauce', chimi: 'sauce',
  bacon: 'peel', ham: 'peel', prosciutto: 'peel',
  leaf: 'light', arugula: 'light', onion: 'light', onionRed: 'light', pickles: 'light', grill: 'light', tomato: 'slide', egg: 'slide',
  patty: 'heavy', lomo: 'heavy', veggie: 'heavy', ternera: 'heavy',
  bunTop: 'bun', bunBottom: 'bun',
};

export default function PixiBurger({
  ingredientes, quitados, medallones, extras, dips, papas, bounceKey,
  pan = 'papa', mainType = 'patty', onError, lite = false, photoSet = null,
}) {
  const hostRef = useRef(null);
  const S = useRef({ ready: false, pending: null, layers: new Map(), texCache: new Map() });

  const layers = useMemo(
    () => buildLayers({ ingredientes, quitados, medallones, extras, mainType }),
    [ingredientes, quitados, medallones, extras, mainType],
  );
  const dipCount = dips?.mayo || 0;

  // ── montaje: crea la app y la escena ────────────────────────
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const st = S.current;
    let dead = false;
    const app = new Application();
    st.app = app;
    const isLite = lite || (typeof window !== 'undefined' && window.matchMedia?.('(max-width:760px),(pointer:coarse)').matches);
    st.lite = isLite;
    const cleanups = [];

    (async () => {
      try {
        await app.init({
          resizeTo: host, backgroundAlpha: 0, antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, isLite ? 1.75 : 2), autoDensity: true,
          powerPreference: 'high-performance',
        });
        if (dead) { app.destroy(true, { children: true, texture: true }); return; }
        app.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
        host.appendChild(app.canvas);
        st.photos = photoSet ? await loadPhotoSet(photoSet) : {};
        if (dead) { app.destroy(true, { children: true, texture: true }); return; }
        buildScene(st, app, isLite, host, cleanups);
        st.ready = true;
        fit(st, host);
        if (st.pending) { const p = st.pending; st.pending = null; sync(st, p.layers, p.pan, p.papas, p.dipCount, true); }
      } catch (e) {
        if (!dead) onError?.(e);
      }
    })();

    const ro = new ResizeObserver(() => fit(st, host));
    ro.observe(host);
    return () => {
      dead = true; ro.disconnect(); cleanups.forEach((f) => f());
      try {
        gsap.killTweensOf(st.root);
        st.layers.forEach((o) => gsap.killTweensOf([o.c, o.c.scale, o.sp, o.sp.scale]));
        if (st.ready) app.destroy(true, { children: true, texture: true });
      } catch { /* noop */ }
      st.ready = false; st.layers = new Map(); st.texCache = new Map();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── cambios de capas / acompañamientos ──────────────────────
  useEffect(() => {
    const st = S.current;
    if (!st.ready) { st.pending = { layers, pan, papas, dipCount }; return; }
    sync(st, layers, pan, papas, dipCount, false);
  }, [layers, pan, papas, dipCount]);

  // ── al tocar algo: ola que recorre las capas ────────────────
  useEffect(() => {
    const st = S.current;
    if (!st.ready || !(bounceKey > 0)) return;
    const arr = [...st.layers.values()].filter((o) => !o.leaving).sort((a, b) => b.idx - a.idx);   // de abajo hacia arriba
    arr.forEach((o, k) => {
      gsap.fromTo(o.sp.scale, { y: 1, x: 1 }, { y: 0.9, x: 1.03, duration: 0.09, delay: k * 0.035, yoyo: true, repeat: 1, ease: 'power2.out' });
    });
    st.flare = 1;
  }, [bounceKey]);

  return <div ref={hostRef} className="pb-host" aria-hidden="true" />;
}

// ════════ helpers de escena ════════

function fit(st, host) {
  if (!st.ready) return;
  const w = host.clientWidth || DW; const h = host.clientHeight || DH;
  const k = Math.min(w / DW, h / DH);
  st.root.scale.set(k);
  st.root.x = (w - DW * k) / 2;
  st.root.y = h - DH * k;
}

/** Canvas → textura (tamaño lógico = unidades de diseño). */
function canvasTex(st, key, make) {
  let t = st.texCache.get(key);
  if (t) return t;
  const d = make();
  const texture = Texture.from(d.canvas);                           // (se dimensiona en unidades de diseño al crear el sprite)
  texture.source.autoGenerateMipmaps = true; texture.source.scaleMode = 'linear';
  t = { texture, w: d.w, h: d.h, top: d.top || 0, lh: d.lh };
  st.texCache.set(key, t);
  return t;
}

function buildScene(st, app, isLite, host, cleanups) {
  const root = new Container(); app.stage.addChild(root); st.root = root;

  // Resplandor cálido muy tenue detrás
  const glow = new Graphics().circle(0, 0, 150).fill(radial([[0, 'rgba(255,170,60,0.5)'], [0.6, 'rgba(255,120,30,0.13)'], [1, 'rgba(255,100,20,0)']]));
  glow.position.set(DW / 2, 150); glow.blendMode = 'add'; root.addChild(glow); st.glow = glow;

  // Plato oscuro con borde dorado (igual que la versión con foto)
  const plate = new Graphics();
  plate.ellipse(0, 8, 160, 27).fill({ color: '#000', alpha: 0.5 });
  plate.ellipse(0, 0, 154, 25).fill(lin([[0, '#54422f'], [1, '#1d1511']]));
  plate.ellipse(0, -1, 132, 19).fill(lin([[0, '#2a2019'], [1, '#3d2e22']]));
  plate.ellipse(0, -2, 152, 23).stroke({ width: 1.5, color: '#ffcf8a', alpha: 0.35 });
  plate.position.set(DW / 2, STACK_BASE_Y + 8); root.addChild(plate); st.plate = plate;

  const shadow = new Graphics().ellipse(0, 0, 118, 12).fill(radial([[0, 'rgba(0,0,0,0.6)'], [1, 'rgba(0,0,0,0)']]));
  shadow.position.set(DW / 2, STACK_BASE_Y + 3); root.addChild(shadow); st.shadow = shadow;

  // Pila
  const bounce = new Container(); bounce.position.set(DW / 2, STACK_BASE_Y); root.addChild(bounce); st.bounce = bounce;
  const stack = new Container(); stack.sortableChildren = true; bounce.addChild(stack); st.stack = stack;

  // Acompañamientos (papas adelante a la izquierda, dips a la derecha)
  st.sides = new Container(); root.addChild(st.sides);

  // Chispas doradas SOLO cuando cambia algo
  const dotTex = app.renderer.generateTexture(new Graphics().circle(0, 0, 4).fill(radial([[0, 'rgba(255,225,150,1)'], [1, 'rgba(255,190,70,0)']])));
  st.dotTex = dotTex; st.fx = new Container(); root.addChild(st.fx);

  // parallax con el mouse / dedo
  st.par = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    st.par.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    st.par.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2)); st.touched = performance.now();
  };
  const onLeave = () => { st.par.tx = 0; st.par.ty = 0; };
  host.addEventListener('pointermove', onMove); host.addEventListener('pointerleave', onLeave);
  cleanups.push(() => { host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave); });

  st.flare = 0; st.time = 0;
  app.ticker.add((tk) => {
    const dt = tk.deltaMS / 1000; st.time += dt; const t = st.time;
    const idle = performance.now() - (st.touched || 0) > 2500;
    const tx = idle ? Math.sin(t * 0.5) * 0.4 : st.par.tx; const ty = idle ? Math.cos(t * 0.37) * 0.2 : st.par.ty;
    st.par.x += (tx - st.par.x) * Math.min(1, dt * 6); st.par.y += (ty - st.par.y) * Math.min(1, dt * 6);
    stack.rotation = st.par.x * 0.018 + Math.sin(t * 0.9) * 0.004;
    stack.skew.x = st.par.x * 0.02;
    // parallax por capa: cada capa se desplaza distinto (sensación 3D) + movimiento secundario suave
    const n = st.layers.size || 1;
    st.layers.forEach((o) => {
      if (o.leaving) return;
      const depth = (o.idx || 0) / n;            // 0 arriba … 1 abajo
      const soft = KIND[o.type] === 'sauce' || KIND[o.type] === 'light' || KIND[o.type] === 'elastic' ? 0.55 : 0.15;
      o.sp.x = (o.baseX || 0) + st.par.x * (1 - depth) * 7 + Math.sin(t * 1.3 + (o.idx || 0) * 0.9) * soft;
    });
    st.flare = Math.max(0, st.flare - dt * 1.6);
    glow.alpha = 0.42 + Math.sin(t * 1.7) * 0.06 + st.flare * 0.3;
    plate.x = DW / 2 + st.par.x * -3;
  });
}

function boxed(img, lh) {
  // la caja escala/ondula desde la base de la capa (squash & stretch) sin pisar la escala de la imagen
  const box = new Container(); box.pivot.set(0, lh); box.position.set(0, lh); box.addChild(img);
  const c = new Container(); c.addChild(box);
  return { c, sp: box, img };
}
function makeLayerSprite(st, l, pan) {
  const ph = st.photos?.[l.type];
  if (ph && (l.type !== 'bunTop' && l.type !== 'bunBottom' ? true : pan === 'papa')) {
    const img = new Sprite(ph.texture);
    const k = ph.w / ph.texture.width;
    img.width = ph.w; img.height = ph.texture.height * k * ph.sy;
    img.anchor.set(0.5, ph.top ? 0 : 0.5);
    img.y = ph.top ? -2 : ph.lh / 2;
    return { ...boxed(img, ph.lh), lh: ph.lh, type: l.type, photo: true, baseX: 0 };
  }
  const key = l.type === 'bunTop' || l.type === 'bunBottom' ? `${l.type}:${pan}` : l.type;
  const t = canvasTex(st, key, () => drawLayer2(l.type, pan, st.lite ? 1.8 : 2.4));
  const img = new Sprite(t.texture);
  img.anchor.set(0.5, 0); img.width = t.w; img.height = t.h; img.y = -t.top;
  const lh = LAYER_H2[l.type] || 12;
  return { ...boxed(img, lh), lh, type: l.type, baseX: 0 };
}

/** Resalta un ingrediente con un contorno dorado antes de sacarlo */
function flash(o) {
  try {
    const h = new Sprite(o.img.texture); h.anchor.copy(o.img.anchor); h.width = o.img.width; h.height = o.img.height; h.position.copy(o.img.position);
    h.tint = 0xffd27a; h.blendMode = 'add'; h.alpha = 0; o.sp.addChild(h);
    gsap.timeline({ onComplete: () => h.destroy() }).to(h, { alpha: 0.85, duration: 0.09 }).to(h, { alpha: 0, duration: 0.24 });
  } catch { /* noop */ }
}

function spark(st, x, y, n = 8, spread = 36, color = 0xffe1a0) {
  if (!st.fx) return;
  const cnt = st.lite ? Math.ceil(n / 2) : n;
  for (let i = 0; i < cnt; i++) {
    const sp = new Sprite(st.dotTex); sp.anchor.set(0.5); sp.blendMode = 'add'; sp.tint = color; sp.position.set(x, y); sp.scale.set(0.2); st.fx.addChild(sp);
    const a = Math.random() * Math.PI * 2; const r = spread * (0.5 + Math.random() * 0.8); const sc = 0.5 + Math.random() * 0.7;
    gsap.to(sp, { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r - 10, duration: 0.6, ease: 'power2.out' });
    gsap.to(sp.scale, { x: sc, y: sc, duration: 0.2 });
    gsap.to(sp, { alpha: 0, duration: 0.35, delay: 0.3, onComplete: () => sp.destroy() });
  }
}

/** Movimiento de salida propio de cada ingrediente */
function leave(st, o, idx) {
  const kind = KIND[o.type] || 'light'; const side = idx % 2 ? 1 : -1;
  const done = () => { try { st.stack.removeChild(o.c); o.c.destroy({ children: true }); } catch { /* noop */ } st.layers.delete(o.id); };
  gsap.killTweensOf([o.c, o.c.scale, o.sp, o.sp.scale]);
  o.c.zIndex = 99; flash(o);
  const wx = DW / 2; const wy = STACK_BASE_Y + o.c.y * (st.stackScale || 1);
  const tl = gsap.timeline({ onComplete: done });
  if (kind === 'elastic') {
    tl.to(o.c.scale, { x: 0.99, y: 1.13, duration: 0.15, ease: 'power2.out' }, 0.05)            // se estira antes de soltarse
      .to(o.c, { y: o.c.y - 8, duration: 0.15 }, 0.05)
      .to(o.c, { y: o.c.y - 56, x: side * 14, rotation: side * 0.07, duration: 0.6, ease: 'power3.out' }, 0.2)
      .to(o.c.scale, { x: 1.06, y: 0.9, duration: 0.4 }, 0.26)
      .to(o.c, { alpha: 0, duration: 0.32, ease: 'power1.in' }, 0.44);
  } else if (kind === 'sauce') {
    tl.to(o.c.scale, { x: 1.03, y: 1.2, duration: 0.1, ease: 'power2.out' }, 0.05)
      .to(o.c.scale, { x: 0.5, y: 0.3, duration: 0.4, ease: 'power3.in' }, 0.15)
      .to(o.c, { y: o.c.y + 6, alpha: 0, duration: 0.34 }, 0.22);
  } else if (kind === 'peel') {
    o.c.pivot.set(-90, 0); o.c.x += -90 * 0;                                                       // se despega desde un extremo
    tl.to(o.c, { rotation: side * -0.16, y: o.c.y - 16, duration: 0.2, ease: 'power2.out' }, 0.05)
      .to(o.c, { x: o.c.x + side * 150, y: o.c.y - 56, rotation: side * -0.5, duration: 0.55, ease: 'power2.in' }, 0.25)
      .to(o.c, { alpha: 0, duration: 0.3 }, 0.4);
  } else if (kind === 'slide') {
    tl.to(o.c, { y: o.c.y - 14, duration: 0.14, ease: 'power2.out' }, 0.05)
      .to(o.c, { x: side * 170, y: o.c.y - 24, rotation: side * 0.4, duration: 0.55, ease: 'power2.in' }, 0.19)
      .to(o.c, { alpha: 0, duration: 0.3 }, 0.4);
  } else if (kind === 'heavy') {
    tl.to(o.c.scale, { x: 1.05, y: 0.92, duration: 0.12 }, 0.05)
      .to(o.c, { y: o.c.y - 44, duration: 0.3, ease: 'power3.out' }, 0.17)
      .to(o.c, { x: side * 200, rotation: side * 0.35, duration: 0.42, ease: 'power3.in' }, 0.42)
      .to(o.c, { alpha: 0, duration: 0.25 }, 0.55);
  } else if (kind === 'bun') {
    tl.to(o.c, { y: o.c.y - 70, rotation: side * 0.2, duration: 0.45, ease: 'power3.out' }, 0.1)
      .to(o.c, { alpha: 0, duration: 0.3 }, 0.35);
  } else { // light
    tl.to(o.c, { y: o.c.y - 6, duration: 0.12, ease: 'power2.out' }, 0.05)
      .to(o.c, { y: o.c.y - 46, x: side * 22, duration: 0.7, ease: 'power2.out' }, 0.17)
      .to(o.c, { rotation: side * 0.12, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.17)
      .to(o.c.scale, { x: 1.05, y: 1.05, duration: 0.6 }, 0.17)
      .to(o.c, { alpha: 0, duration: 0.34 }, 0.45);
  }
  tl.add(() => spark(st, wx + (side * 0), wy - 14, 8, 38), 0.4);
}

function sync(st, layers, pan, papas, dipCount, first) {
  // pan distinto → rehacer panes
  if (st.pan !== undefined && st.pan !== pan) {
    st.layers.forEach((o, id) => { if (o.type === 'bunTop' || o.type === 'bunBottom') { gsap.killTweensOf([o.c, o.c.scale, o.sp, o.sp.scale]); st.stack.removeChild(o.c); o.c.destroy({ children: true }); st.layers.delete(id); } });
  }
  st.pan = pan;

  const incoming = new Set(layers.map((l) => l.id));
  // salen (cada uno con su movimiento)
  let removedIdx = -1;
  st.layers.forEach((o, id) => {
    if (incoming.has(id) || o.leaving) return;
    o.leaving = true; o.id = id; removedIdx = Math.max(removedIdx, o.idx ?? -1);
    leave(st, o, o.idx || 0);
  });

  // entran
  const heights = layers.map((l) => {
    let o = st.layers.get(l.id);
    if (!o || o.leaving) {
      const made = makeLayerSprite(st, l, pan);
      o = { ...made, id: l.id, isNew: true, leaving: false };
      st.layers.set(l.id, o); st.stack.addChild(o.c);
    }
    return o.lh;
  });
  const total = heights.reduce((a, b) => a + b, 0);
  st.stackH = total;
  const scale = Math.min(1, STACK_MAX / total);
  st.stackScale = scale;
  gsap.to(st.stack.scale, { x: scale, y: scale, duration: 0.5, delay: removedIdx >= 0 ? 0.18 : 0, ease: 'power3.out', overwrite: true });

  let acc = total; let newCount = 0;
  layers.forEach((l, i) => {
    const o = st.layers.get(l.id);
    const prevIdx = o.idx;
    o.idx = i;
    const top = -acc; acc -= o.lh;
    o.c.zIndex = layers.length - i;
    if (o.isNew) {
      o.isNew = false;
      o.c.position.set(0, top - 120); o.c.alpha = 0; o.c.rotation = (i % 2 ? 0.28 : -0.28); o.c.scale.set(0.7);
      const delay = first ? (layers.length - 1 - i) * 0.08 : 0.06 * newCount++;
      gsap.to(o.c, { y: top, alpha: 1, rotation: 0, duration: 0.55, delay, ease: 'back.out(1.5)' });
      gsap.to(o.c.scale, { x: 1, y: 1, duration: 0.55, delay, ease: 'back.out(2)' });
      gsap.fromTo(o.sp.scale, { y: 1.14, x: 0.94 }, { y: 1, x: 1, duration: 0.55, delay: delay + 0.3, ease: 'elastic.out(1,0.4)' });
      if (!first) gsap.delayedCall(delay + 0.34, () => spark(st, DW / 2, STACK_BASE_Y + top * scale, 5, 30));
    } else if (!o.leaving && Math.abs(o.c.y - top) > 0.5) {
      // las capas de arriba "caen" para cerrar el hueco, en cascada, con un asentamiento elástico
      const dist = removedIdx >= 0 ? Math.max(0, removedIdx - i) : 0;
      const delay = removedIdx >= 0 ? 0.2 + 0.04 * dist : 0;
      gsap.to(o.c, { y: top, duration: 0.5, delay, ease: removedIdx >= 0 ? 'bounce.out' : 'back.out(1.6)', overwrite: 'auto' });
      if (removedIdx >= 0) gsap.fromTo(o.sp.scale, { y: 1.0 }, { y: 0.93, duration: 0.08, delay: delay + 0.22, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
  });

  // Acompañamientos
  syncSides(st, papas, dipCount);
}

function syncSides(st, papas, dipCount) {
  const sides = st.sides;
  // papas
  if (st.friesKind !== (papas || null)) {
    if (st.fries) { const old = st.fries; gsap.to(old, { alpha: 0, duration: 0.2, onComplete: () => old.destroy({ children: true }) }); st.fries = null; }
    st.friesKind = papas || null;
    if (papas) {
      const hot = papas === 'sazonadas';
      const t = canvasTex(st, `fries:${hot}`, () => drawFries2(hot, st.lite ? 1.8 : 2.4));
      const sp = new Sprite(t.texture); sp.anchor.set(0.5, 1); sp.width = t.w; sp.height = t.h;
      const c = new Container(); c.addChild(sp);
      c.position.set(44, STACK_BASE_Y + 28); c.alpha = 0; c.scale.set(0.3); c.rotation = -0.5;
      sides.addChild(c); st.fries = c;
      gsap.to(c, { alpha: 1, rotation: -0.04, duration: 0.5, ease: 'back.out(1.8)' });
      gsap.to(c.scale, { x: 0.95, y: 0.95, duration: 0.5, ease: 'back.out(2)' });
    }
  }
  // dip
  if (st.dipCount !== dipCount) {
    st.dipCount = dipCount;
    (st.dips || []).forEach((d) => d.destroy({ children: true }));
    st.dips = [];
    if (dipCount > 0) {
      const t = canvasTex(st, 'dip', () => drawDip2(st.lite ? 1.8 : 2.4));
      for (let i = 0; i < Math.min(dipCount, 3); i++) {
        const sp = new Sprite(t.texture); sp.anchor.set(0.5, 1); sp.width = t.w; sp.height = t.h;
        const c = new Container(); c.addChild(sp);
        c.position.set(DW - 36 - i * 20, STACK_BASE_Y + 24 - i * 5); c.alpha = 0; c.scale.set(0.2);
        sides.addChild(c); st.dips.push(c);
        gsap.to(c, { alpha: 1, duration: 0.4, delay: i * 0.08 });
        gsap.to(c.scale, { x: 1.1, y: 1.1, duration: 0.5, delay: i * 0.08, ease: 'back.out(2)' });
      }
    }
  }
}
