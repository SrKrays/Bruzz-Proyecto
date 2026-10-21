// ════════════════════════════════════════════════════════════
//  🍔 PixiBurger — hamburguesa en WebGL (PixiJS) con arte procedural.
//  Misma interfaz que <LiveBurger/> (que queda de respaldo).
//  FASE 2: poné fotos reales en LAYER_PHOTOS (tipo → URL) y listo.
// ════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useRef } from 'react';
import { Application, Container, Graphics, Sprite, Texture, Assets, FillGradient } from 'pixi.js';
import gsap from 'gsap';
import { buildLayers } from './LiveBurger';
import { drawLayer, drawFries, drawDip, LAYER_H } from './pixiBurgerArt';

// Fase 2: { cheddar: '/capas/cheddar.png', ... }  (PNG con fondo transparente, ancho ~1000px)
// Si hay foto: { url, width } → se escala a `width` px de diseño; alto proporcional.
// Cada set: tipo → { f: archivo, w: ancho de diseño, sy: aplastado vertical, lh: alto que ocupa en la pila,
//                     top: true → el borde superior de la foto queda al ras de la capa (para goteos) }
export const PHOTO_SETS = {
  dilusso: {
    dir: 'fotos-burger/dilusso/',
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

const DW = 300; const DH = 340;       // lienzo de diseño
const STACK_BASE_Y = 262;             // donde apoya la pila
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
        buildScene(st, app, isLite);
        st.ready = true;
        fit(st, host);
        if (st.pending) { const p = st.pending; st.pending = null; sync(st, p.layers, p.pan, p.papas, p.dipCount, true); }
      } catch (e) {
        if (!dead) onError?.(e);
      }
    })();

    const ro = new ResizeObserver(() => fit(st, host));
    ro.observe(host);
    const onLost = (ev) => { ev.preventDefault(); onError?.(new Error('webgl context lost')); };
    return () => {
      dead = true; ro.disconnect();
      try {
        gsap.killTweensOf(st.root);
        st.layers.forEach((o) => gsap.killTweensOf([o.c, o.c.scale]));
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

  // ── rebote al cambiar algo ──────────────────────────────────
  useEffect(() => {
    const st = S.current;
    if (!st.ready || !(bounceKey > 0)) return;
    const b = st.bounce;
    gsap.killTweensOf(b); gsap.killTweensOf(b.scale);
    gsap.timeline()
      .to(b, { y: STACK_BASE_Y - 16, duration: 0.16, ease: 'power2.out' })
      .to(b.scale, { x: 0.97, y: 1.04, duration: 0.16 }, 0)
      .to(b, { y: STACK_BASE_Y, duration: 0.32, ease: "bounce.out" })
      .to(b.scale, { x: 1, y: 1, duration: 0.32, ease: 'elastic.out(1,0.5)' }, 0.16);
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

function tex(st, key, make) {
  let t = st.texCache.get(key);
  if (t) return t;
  const d = make();
  const res = st.lite ? 1.5 : 2.25;
  const texture = st.app.renderer.generateTexture({ target: d.g, resolution: res, antialias: true });
  const b = d.g.getLocalBounds();
  t = { texture, ax: -b.x / b.width, ay: -b.y / b.height, off: d.offsetY || 0, d, bw: b.width, bh: b.height };
  d.g.destroy();
  st.texCache.set(key, t);
  return t;
}

function buildScene(st, app, isLite) {
  const root = new Container(); app.stage.addChild(root); st.root = root;

  // Resplandor cálido detrás
  const glow = new Graphics().circle(0, 0, 150).fill(radial([[0, 'rgba(255,170,60,0.55)'], [0.6, 'rgba(255,120,30,0.16)'], [1, 'rgba(255,100,20,0)']]));
  glow.position.set(DW / 2, 190); glow.blendMode = 'add'; root.addChild(glow); st.glow = glow;

  // Plato + sombra de contacto
  const plate = new Container(); root.addChild(plate);
  const pl = new Graphics();
  pl.ellipse(0, 6, 150, 26).fill({ color: '#000', alpha: 0.35 });
  pl.ellipse(0, 0, 144, 24).fill(new FillGradient({ type: 'linear', start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, colorStops: [{ offset: 0, color: '#f3ecdf' }, { offset: 1, color: '#bdb09a' }] }));
  pl.ellipse(0, -1, 118, 17).fill(new FillGradient({ type: 'linear', start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, colorStops: [{ offset: 0, color: '#d9cfbb' }, { offset: 1, color: '#fbf6ea' }] }));
  plate.addChild(pl); plate.position.set(DW / 2, STACK_BASE_Y + 14);
  st.plate = plate;

  const shadow = new Graphics().ellipse(0, 0, 112, 12).fill(radial([[0, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']]));
  shadow.position.set(DW / 2, STACK_BASE_Y + 6); root.addChild(shadow); st.shadow = shadow;

  // Pila (bounce → stack)
  const bounce = new Container(); bounce.position.set(DW / 2, STACK_BASE_Y); root.addChild(bounce); st.bounce = bounce;
  const stack = new Container(); bounce.addChild(stack); st.stack = stack;

  // Vapor
  const steamTex = app.renderer.generateTexture({
    target: new Graphics().circle(0, 0, 22).fill(radial([[0, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']])), resolution: 1,
  });
  const steam = new Container(); root.addChild(steam); st.steam = [];
  const N = isLite ? 5 : 9;
  for (let i = 0; i < N; i++) {
    const s = new Sprite(steamTex); s.anchor.set(0.5); s.alpha = 0; steam.addChild(s);
    st.steam.push({ s, t: i / N, sp: 0.1 + Math.random() * 0.05, dx: (Math.random() - 0.5) * 70, ph: Math.random() * 6 });
  }
  st.steamBase = { x: DW / 2, y: 0 };

  // Brasas / chispas (aditivas)
  const emTex = app.renderer.generateTexture({
    target: new Graphics().circle(0, 0, 5).fill(radial([[0, 'rgba(255,230,150,1)'], [0.4, 'rgba(255,150,40,0.7)'], [1, 'rgba(255,90,10,0)']])), resolution: 1,
  });
  const em = new Container(); root.addChild(em); st.embers = [];
  const M = isLite ? 7 : 14;
  for (let i = 0; i < M; i++) {
    const s = new Sprite(emTex); s.anchor.set(0.5); s.blendMode = 'add'; s.alpha = 0; em.addChild(s);
    st.embers.push({ s, t: Math.random(), sp: 0.12 + Math.random() * 0.14, x0: DW / 2 + (Math.random() - 0.5) * 220, sz: 0.4 + Math.random() * 0.7, ph: Math.random() * 6 });
  }

  // Acompañamientos
  st.sides = new Container(); root.addChild(st.sides);

  st.flare = 0; st.time = 0;
  app.ticker.add((tk) => {
    const dt = tk.deltaMS / 1000; st.time += dt;
    const t = st.time;
    // respiración suave
    stack.rotation = Math.sin(t * 0.9) * 0.006;
    stack.x = Math.sin(t * 0.6) * 1.2;
    st.flare = Math.max(0, st.flare - dt * 1.6);
    glow.alpha = 0.78 + Math.sin(t * 1.7) * 0.1 + st.flare * 0.35;
    glow.scale.set(1 + Math.sin(t * 1.2) * 0.03 + st.flare * 0.12);
    const topY = STACK_BASE_Y - (st.stackH || 100) * (st.stackScale || 1);
    st.steam.forEach((p) => {
      p.t += dt * p.sp * 3; if (p.t > 1) { p.t = 0; p.dx = (Math.random() - 0.5) * 80; }
      p.s.x = st.steamBase.x + p.dx * 0.6 + Math.sin(t * 1.4 + p.ph) * 14 * p.t;
      p.s.y = topY - 6 - p.t * 82;
      p.s.alpha = Math.sin(p.t * Math.PI) * 0.5;
      p.s.scale.set(0.6 + p.t * 1.5);
    });
    st.embers.forEach((p) => {
      p.t += dt * p.sp; if (p.t > 1) { p.t = 0; p.x0 = DW / 2 + (Math.random() - 0.5) * 220; }
      p.s.x = p.x0 + Math.sin(t * 2 + p.ph) * 9;
      p.s.y = 290 - p.t * 270;
      p.s.alpha = Math.sin(p.t * Math.PI) * (0.65 + 0.35 * Math.sin(t * 9 + p.ph));
      p.s.scale.set(p.sz * (1 - p.t * 0.5));
    });
  });
}

function layerTexture(st, type, pan) {
  const key = type === 'bunTop' || type === 'bunBottom' ? `${type}:${pan}` : type;
  return tex(st, key, () => drawLayer(type, pan));
}

function makeLayerSprite(st, l, pan) {
  const ph = st.photos?.[l.type];
  if (ph && (l.type !== 'bunTop' && l.type !== 'bunBottom' ? true : pan === 'papa')) {
    const sp = new Sprite(ph.texture);
    const k = ph.w / ph.texture.width;
    sp.width = ph.w; sp.height = ph.texture.height * k * ph.sy;
    sp.anchor.set(0.5, ph.top ? 0 : 0.5);
    sp.y = ph.top ? -2 : ph.lh / 2;
    const c = new Container(); c.addChild(sp);
    return { c, lh: ph.lh, sp, type: l.type, photo: true };
  }
  const t = layerTexture(st, l.type, pan);
  const sp = new Sprite(t.texture);
  sp.anchor.set(t.ax, t.ay);
  // La textura se genera a `resolution` mayor; Pixi la muestra a tamaño lógico
  const c = new Container(); c.addChild(sp);
  const lh = t.off ? t.d.h - t.off : (LAYER_H[l.type] || 12);
  sp.y = -t.off;
  return { c, lh, sp, type: l.type };
}

function sync(st, layers, pan, papas, dipCount, first) {
  // pan distinto → rehacer panes
  if (st.pan !== undefined && st.pan !== pan) {
    st.layers.forEach((o, id) => { if (o.type === 'bunTop' || o.type === 'bunBottom') { gsap.killTweensOf([o.c, o.c.scale]); st.stack.removeChild(o.c); o.c.destroy({ children: true }); st.layers.delete(id); } });
  }
  st.pan = pan;

  const incoming = new Set(layers.map((l) => l.id));
  // salen
  st.layers.forEach((o, id) => {
    if (incoming.has(id) || o.leaving) return;
    o.leaving = true;
    const dir = (o.idx % 2) ? 1 : -1;
    gsap.killTweensOf([o.c, o.c.scale]);
    gsap.to(o.c, { x: dir * 190, rotation: dir * 0.7, alpha: 0, duration: 0.34, ease: 'power2.in' });
    gsap.to(o.c.scale, {
      x: 0.35, y: 0.35, duration: 0.34, ease: 'power2.in',
      onComplete: () => { st.stack.removeChild(o.c); o.c.destroy({ children: true }); st.layers.delete(id); },
    });
  });

  // posiciones (de abajo hacia arriba, y negativo)
  const heights = layers.map((l) => {
    let o = st.layers.get(l.id);
    if (!o || o.leaving) {
      const made = makeLayerSprite(st, l, pan);
      o = { ...made, isNew: true, leaving: false };
      st.layers.set(l.id, o); st.stack.addChild(o.c);
    }
    return o.lh;
  });
  const total = heights.reduce((a, b) => a + b, 0);
  st.stackH = total;
  const scale = Math.min(1, STACK_MAX / total);
  st.stackScale = scale;
  gsap.to(st.stack.scale, { x: scale, y: scale, duration: 0.45, ease: 'power3.out', overwrite: true });

  let y = 0; // base = 0, hacia arriba negativo
  const order = layers.map((l, i) => ({ l, i }));
  let acc = total;
  let newCount = 0;
  order.forEach(({ l, i }) => {
    const o = st.layers.get(l.id);
    o.idx = i;
    const top = -acc; // y de la parte superior de esta capa
    acc -= o.lh;
    o.c.zIndex = layers.length - i;
    if (o.isNew) {
      o.isNew = false;
      o.c.position.set(0, top - 110); o.c.alpha = 0; o.c.rotation = (i % 2 ? 0.25 : -0.25); o.c.scale.set(0.7);
      const delay = first ? (layers.length - 1 - i) * 0.075 : 0.05 * newCount++;
      gsap.to(o.c, { y: top, alpha: 1, rotation: 0, duration: 0.55, delay, ease: 'back.out(1.5)' });
      gsap.to(o.c.scale, { x: 1, y: 1, duration: 0.55, delay, ease: 'back.out(2)' });
      // aplastar un poco al caer
      if (!o.photo) gsap.fromTo(o.sp.scale, { y: 1.12, x: 0.94 }, { y: 1, x: 1, duration: 0.5, delay: delay + 0.28, ease: 'elastic.out(1,0.4)' });
    } else if (!o.leaving) {
      gsap.to(o.c, { y: top, duration: 0.45, ease: 'back.out(1.6)', overwrite: 'auto' });
    }
  });
  st.stack.sortableChildren = true;

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
      const t = tex(st, `fries:${hot}`, () => { const d = drawFries(hot); return d; });
      const sp = new Sprite(t.texture); sp.anchor.set(t.ax, t.ay);
      const c = new Container(); c.addChild(sp);
      c.position.set(50, STACK_BASE_Y + 4); c.alpha = 0; c.scale.set(0.3); c.rotation = -0.5;
      sides.addChild(c); st.fries = c;
      gsap.to(c, { alpha: 1, rotation: -0.04, duration: 0.5, ease: 'back.out(1.8)' });
      gsap.to(c.scale, { x: 1.2, y: 1.2, duration: 0.5, ease: 'back.out(2)' });
      c.sp = sp;
    }
  }
  // dip
  if (st.dipCount !== dipCount) {
    st.dipCount = dipCount;
    (st.dips || []).forEach((d) => d.destroy({ children: true }));
    st.dips = [];
    if (dipCount > 0) {
      const t = tex(st, 'dip', drawDip);
      for (let i = 0; i < Math.min(dipCount, 3); i++) {
        const sp = new Sprite(t.texture); sp.anchor.set(t.ax, t.ay);
        const c = new Container(); c.addChild(sp);
        c.position.set(DW - 40 - i * 22, STACK_BASE_Y + 12 - i * 5); c.alpha = 0; c.scale.set(0.2);
        sides.addChild(c); st.dips.push(c);
        gsap.to(c, { alpha: 1, duration: 0.4, delay: i * 0.08 });
        gsap.to(c.scale, { x: 1.2, y: 1.2, duration: 0.5, delay: i * 0.08, ease: 'back.out(2)' });
      }
    }
  }
}
