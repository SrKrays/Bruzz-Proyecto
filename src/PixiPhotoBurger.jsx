// ════════════════════════════════════════════════════════════
//  📸 PixiPhotoBurger — "FOTO VIVA": la foto real de la burger como protagonista.
//  · Parallax 3D con mapa de profundidad (mouse / dedo / giroscopio).
//  · Vida: vapor, brillo que recorre pan y cheddar, respiración, brasas, sombra.
//  · Al sacar/poner un ingrediente: salto con squash & stretch, crossfade a la
//    foto de esa combinación y "sticker" del ingrediente volando.
//  · Una foto por combinación: carta-bar/public/fotos-burger/<burger>/<combo>.webp|png
//    Si falta una combinación se usa la más parecida (+ sticker).
// ════════════════════════════════════════════════════════════
import React, { useEffect, useRef } from 'react';
import {
  Application, Container, Graphics, Sprite, Texture, Filter, GlProgram, defaultFilterVert, FillGradient,
} from 'pixi.js';
import gsap from 'gsap';
import { layerTypeOf } from './LiveBurger';

export const PHOTO_BURGERS = {
  dilusso: {
    dir: 'fotos-burger/dilusso/',
    stickerDir: 'fotos-burger/dilusso-capas/',
    // Orden CANÓNICO de los ingredientes que se pueden sacar (define el nombre de archivo)
    order: ['cheddar', 'lactonesa', 'ketchup', 'cebolla', 'bacon'],
    typeToKey: { cheddar: 'cheddar', mayo: 'lactonesa', ketchup: 'ketchup', onion: 'cebolla', bacon: 'bacon' },
    // sticker: archivo (PNG recortado) y desde dónde "sale" (fracción del ancho/alto de la foto)
    sticker: {
      cheddar:   { f: 'cheddar.png', at: [0.5, 0.73] },
      lactonesa: { f: 'mayo.png',    at: [0.4, 0.39] },
      ketchup:   { f: 'ketchup.png', at: [0.7, 0.49] },
      cebolla:   { f: 'onion.png',   at: [0.6, 0.56] },
      bacon:     { f: 'bacon.png',   at: [0.5, 0.44] },
    },
    steam: { x: 0.5, y: 0.49, w: 0.5 },
    // zonas que reciben el brillo (fracciones de la foto): pan y cheddar
    glints: [{ x: 0.1, y: 0.02, w: 0.8, h: 0.36 }, { x: 0.08, y: 0.63, w: 0.84, h: 0.15 }],
    // destellos fijos sobre el pan (donde brilla la foto)
    stars: [[0.3, 0.13], [0.62, 0.1], [0.78, 0.23], [0.18, 0.25]],
    feather: false,   // las fotos ya vienen recortadas (fondo transparente)
    width: 300,
  },
};

/** "base" o "sin-cheddar-sin-cebolla" (orden canónico). */
export function comboName(order, removed) {
  const r = order.filter((k) => removed.has(k));
  return r.length ? r.map((k) => `sin-${k}`).join('-') : 'base';
}
/** Todas las combinaciones posibles (para armar la lista de fotos). */
export function allCombos(order) {
  const out = [];
  for (let m = 0; m < (1 << order.length); m++) {
    out.push(comboName(order, new Set(order.filter((_, i) => m & (1 << i)))));
  }
  return out;
}
const removedOf = (cfg, quitados) => {
  const s = new Set();
  (quitados || []).forEach((q) => { const k = cfg.typeToKey[layerTypeOf(q)]; if (k) s.add(k); });
  return s;
};

const DW = 300; const DH = 340; const BASE_Y = 282;

const radial = (stops) => new FillGradient({
  type: 'radial', center: { x: 0.5, y: 0.5 }, innerRadius: 0, outerCenter: { x: 0.5, y: 0.5 }, outerRadius: 0.5,
  colorStops: stops.map(([offset, color]) => ({ offset, color })),
});

function baseUrl() { return (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'; }

function loadImg(url) {
  return new Promise((res, rej) => {
    const img = new Image(); img.crossOrigin = 'anonymous'; img.decoding = 'async';
    img.onload = () => res(img); img.onerror = rej; img.src = url;
  });
}
async function loadTex(url) {
  const t = Texture.from(await loadImg(url));
  t.source.autoGenerateMipmaps = true; t.source.scaleMode = 'linear';
  return t;
}

// Mapa de profundidad "a mano": cúpula suave (más cerca en el centro, más lejos en los bordes).
function makeDepthTexture() {
  const W = 128; const H = 96;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const im = g.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = (x / (W - 1) - 0.5) * 2; const v = (y / (H - 1) - 0.5) * 2;
      const dome = Math.sqrt(Math.max(0, 1 - u * u * 0.9)) * (0.55 + 0.45 * Math.sqrt(Math.max(0, 1 - v * v)));
      const val = Math.round(255 * Math.min(1, 0.12 + dome * 0.88));
      const i = (y * W + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = val; im.data[i + 3] = 255;
    }
  }
  g.putImageData(im, 0, 0);
  const t = Texture.from(c); t.source.scaleMode = 'linear';
  return t;
}

// Máscara con bordes suaves: la foto tiene fondo propio y así se funde con el panel
function makeFeatherTexture() {
  const W = 128; const H = 128; const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const im = g.createImageData(W, H);
  const f = (v) => { const e = Math.min(v, 1 - v) / 0.07; const x = Math.max(0, Math.min(1, e)); return x * x * (3 - 2 * x); };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = Math.round(255 * f(x / (W - 1)) * f(y / (H - 1))); const i = (y * W + x) * 4;
    im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = a;
  }
  g.putImageData(im, 0, 0); return Texture.from(c);
}

const FRAG = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform sampler2D uDepth;
uniform vec2 uOffset;
void main(void){
  float d = texture(uDepth, vTextureCoord).r;
  vec2 uv = vTextureCoord + uOffset * (d - 0.5);
  finalColor = texture(uTexture, clamp(uv, 0.001, 0.999));
}`;

export default function PixiPhotoBurger({
  quitados, bounceKey, photoLive = 'dilusso', onError, lite = false,
}) {
  const hostRef = useRef(null);
  const S = useRef({ ready: false, want: null, shown: null, busy: false, ok: new Map(), bad: new Set() });
  const cfg = PHOTO_BURGERS[photoLive];
  const wantName = comboName(cfg.order, removedOf(cfg, quitados));

  useEffect(() => {
    const host = hostRef.current; const st = S.current;
    if (!host) return undefined;
    let dead = false;
    const app = new Application(); st.app = app;
    const isLite = lite || window.matchMedia?.('(max-width:760px),(pointer:coarse)').matches;
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
        try { st.depthFile = await loadTex(baseUrl() + cfg.dir + 'depth.png'); } catch { st.depthFile = null; }
        if (dead) return;
        build(st, app, cfg, isLite, host, cleanups);
        st.ready = true; fit(st, host);
        // primera foto (con respaldo a la más parecida)
        const first = await resolveTex(st, cfg, st.want || wantName);
        if (dead) return;
        if (!first) { onError?.(new Error('no-photo')); return; }
        st.shown = first.name; setPhoto(st, st.spA, first.tex);
        st.spA.alpha = 0;
        gsap.fromTo(st.wrapState, { jy: -26 }, { jy: 0, duration: 0.7, ease: 'bounce.out' });
        gsap.fromTo(st.sq, { x: 0.9, y: 0.9 }, { x: 1, y: 1, duration: 0.9, ease: 'elastic.out(1,0.5)' });
        st.flare = 1.4;
        gsap.to(st.spA, { alpha: 1, duration: 0.35 });
        prefetch(st, cfg);
        if (st.want && st.want !== first.name) go(st, cfg, st.want);
      } catch (e) { if (!dead) onError?.(e); }
    })();

    const ro = new ResizeObserver(() => fit(st, host)); ro.observe(host);
    return () => {
      dead = true; ro.disconnect(); cleanups.forEach((f) => f());
      try {
        gsap.killTweensOf(st.wrapState); gsap.killTweensOf(st.sq);
        if (st.ready) app.destroy(true, { children: true, texture: true });
      } catch { /* noop */ }
      st.ready = false; st.ok = new Map(); st.bad = new Set();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cambio de combinación → salto + crossfade
  useEffect(() => {
    const st = S.current;
    st.want = wantName;
    if (st.ready && st.shown) go(st, cfg, wantName);
  }, [wantName]); // eslint-disable-line react-hooks/exhaustive-deps

  // brillo extra al tocar algo
  useEffect(() => { const st = S.current; if (st.ready && bounceKey > 0) st.flare = 1; }, [bounceKey]);

  return <div ref={hostRef} className="pb-host" aria-hidden="true" />;
}

// ════════ escena ════════
function fit(st, host) {
  if (!st.ready) return;
  const w = host.clientWidth || DW; const h = host.clientHeight || DH;
  const k = Math.min(w / DW, h / DH);
  st.root.scale.set(k); st.root.x = (w - DW * k) / 2; st.root.y = h - DH * k;
}

function setPhoto(st, sp, tex) {
  sp.texture = tex;
  const k = st.photoW / tex.width;
  sp.width = st.photoW; sp.height = tex.height * k;
  st.photoH = sp.height;
  if (st.feather) { st.feather.width = st.photoW; st.feather.height = st.photoH; }
  layoutFx(st);
}

function layoutFx(st) {
  const H = st.photoH || 200; const W = st.photoW;
  // vapor / brillos se ubican según el tamaño real de la foto
  st.steamBase = { x: DW / 2 + (st.cfg.steam.x - 0.5) * W, y: BASE_Y - H * (1 - st.cfg.steam.y), w: st.cfg.steam.w * W };
  st.glintMask.clear();
  st.cfg.glints.forEach((g) => {
    st.glintMask.roundRect(DW / 2 - W / 2 + g.x * W, BASE_Y - H + g.y * H, g.w * W, g.h * H, 18).fill('#fff');
  });
  if (st.spotMask) { st.spotMask.clear(); st.spotMask.roundRect(DW / 2 - W / 2, BASE_Y - H, W, H, 14).fill('#fff'); }
  st.glint.position.y = BASE_Y - H;
  st.glint.height = H;
}

function build(st, app, cfg, isLite, host, cleanups) {
  st.cfg = cfg; st.photoW = cfg.width; st.photoH = 200;
  const root = new Container(); app.stage.addChild(root); st.root = root;

  const glow = new Graphics().circle(0, 0, 150).fill(radial([[0, 'rgba(255,170,60,0.5)'], [0.6, 'rgba(255,120,30,0.14)'], [1, 'rgba(255,100,20,0)']]));
  glow.position.set(DW / 2, 190); glow.blendMode = 'add'; root.addChild(glow); st.glow = glow;

  // plato oscuro con brillo en el borde (la burger apoya sobre él)
  const plate = new Graphics();
  plate.ellipse(0, 7, 156, 26).fill({ color: '#000', alpha: 0.5 });
  plate.ellipse(0, 0, 150, 24).fill(new FillGradient({ type: 'linear', start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, colorStops: [{ offset: 0, color: '#4a3a2c' }, { offset: 1, color: '#1d1511' }] }));
  plate.ellipse(0, -1, 128, 18).fill(new FillGradient({ type: 'linear', start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, colorStops: [{ offset: 0, color: '#2a2019' }, { offset: 1, color: '#3b2d22' }] }));
  plate.ellipse(0, -2, 148, 22).stroke({ width: 1.5, color: '#ffcf8a', alpha: 0.35 });
  plate.position.set(DW / 2, BASE_Y - 9); root.addChild(plate); st.plate = plate;

  // bokeh que flota detrás (reemplaza al fondo de la foto)
  const bokehTex = app.renderer.generateTexture(new Graphics().circle(0, 0, 20).fill(radial([[0, 'rgba(255,214,140,0.85)'], [0.7, 'rgba(255,170,70,0.35)'], [1, 'rgba(255,150,50,0)']])));
  st.bokeh = [];
  const BN = isLite ? 7 : 14;
  for (let i = 0; i < BN; i++) {
    const sp = new Sprite(bokehTex); sp.anchor.set(0.5); sp.blendMode = 'add'; root.addChildAt(sp, 1);
    st.bokeh.push({ sp, x: Math.random() * DW, y: 20 + Math.random() * 230, z: 0.4 + Math.random() * 1.0, ph: Math.random() * 6, sz: 0.5 + Math.random() * 1.2 });
  }

  const shadow = new Graphics().ellipse(0, 0, 118, 12).fill(radial([[0, 'rgba(0,0,0,0.6)'], [1, 'rgba(0,0,0,0)']]));
  shadow.position.set(DW / 2, BASE_Y + 3); root.addChild(shadow); st.shadow = shadow;

  // envoltorio animable (salto/respiración) con el filtro de parallax
  const wrap = new Container(); wrap.position.set(DW / 2, BASE_Y); root.addChild(wrap); st.wrap = wrap;
  const spA = new Sprite(Texture.EMPTY); spA.anchor.set(0.5, 1);
  const spB = new Sprite(Texture.EMPTY); spB.anchor.set(0.5, 1); spB.alpha = 0;
  wrap.addChild(spA, spB); st.spA = spA; st.spB = spB;
  if (cfg.feather) { const feather = new Sprite(makeFeatherTexture()); feather.anchor.set(0.5, 1); wrap.addChild(feather); wrap.mask = feather; st.feather = feather; }

  st.depth = st.depthFile || makeDepthTexture();
  st.parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!isLite) {
    try {
      const filter = new Filter({
        glProgram: GlProgram.from({ vertex: defaultFilterVert, fragment: FRAG, name: 'photo-parallax' }),
        resources: {
          uDepth: st.depth.source,
          parallaxUniforms: { uOffset: { value: new Float32Array([0, 0]), type: 'vec2<f32>' } },
        },
        padding: 0,
      });
      wrap.filters = [filter]; st.filter = filter;
    } catch { st.filter = null; }
  }

  // brillo que recorre pan y cheddar
  const glintMask = new Graphics(); st.glintMask = glintMask; root.addChild(glintMask);
  const band = new Graphics().rect(0, 0, 60, 10).fill(new FillGradient({
    type: 'linear', start: { x: 0, y: 0 }, end: { x: 1, y: 0 },
    colorStops: [{ offset: 0, color: 'rgba(255,255,255,0)' }, { offset: 0.5, color: 'rgba(255,248,220,0.55)' }, { offset: 1, color: 'rgba(255,255,255,0)' }],
  }));
  const glint = new Sprite(app.renderer.generateTexture(band)); glint.blendMode = 'add'; glint.width = 70; glint.rotation = 0; glint.skew.x = -0.35;
  glint.alpha = 0; glint.mask = glintMask; root.addChild(glint); st.glint = glint;
  const sweep = () => {
    if (!st.ready) return;
    glint.x = DW / 2 - st.photoW / 2 - 80; glint.alpha = 0.9;
    gsap.to(glint, { x: DW / 2 + st.photoW / 2 + 10, duration: 1.3, ease: 'power1.inOut' });
    gsap.to(glint, { alpha: 0, duration: 0.3, delay: 1.1 });
  };
  const sweepTimer = setInterval(sweep, 5200); setTimeout(sweep, 1400);
  cleanups.push(() => { clearInterval(sweepTimer); gsap.killTweensOf(glint); });

  // vapor
  const steamTex = app.renderer.generateTexture(new Graphics().circle(0, 0, 22).fill(radial([[0, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']])));
  const steam = new Container(); root.addChild(steam); st.steam = [];
  const N = isLite ? 4 : 8;
  for (let i = 0; i < N; i++) {
    const s = new Sprite(steamTex); s.anchor.set(0.5); s.alpha = 0; steam.addChild(s);
    st.steam.push({ s, t: i / N, sp: 0.1 + Math.random() * 0.05, dx: (Math.random() - 0.5), ph: Math.random() * 6 });
  }
  // brasas
  const emTex = app.renderer.generateTexture(new Graphics().circle(0, 0, 5).fill(radial([[0, 'rgba(255,230,150,1)'], [0.4, 'rgba(255,150,40,0.7)'], [1, 'rgba(255,90,10,0)']])));
  const em = new Container(); root.addChild(em); st.embers = [];
  const M = isLite ? 5 : 10;
  for (let i = 0; i < M; i++) {
    const s = new Sprite(emTex); s.anchor.set(0.5); s.blendMode = 'add'; s.alpha = 0; em.addChild(s);
    st.embers.push({ s, t: Math.random(), sp: 0.1 + Math.random() * 0.12, x0: DW / 2 + (Math.random() - 0.5) * 230, sz: 0.4 + Math.random() * 0.6, ph: Math.random() * 6 });
  }
  st.stickers = new Container(); root.addChild(st.stickers);


  // ✨ MAGIA: polvo dorado, destellos en el pan y luz que sigue al dedo/mouse
  const starTex = app.renderer.generateTexture(new Graphics()
    .circle(0, 0, 14).fill(radial([[0, 'rgba(255,240,190,0.9)'], [1, 'rgba(255,200,90,0)']]))
    .poly([0, -14, 1.8, -1.8, 14, 0, 1.8, 1.8, 0, 14, -1.8, 1.8, -14, 0, -1.8, -1.8]).fill('#fff6d8'));
  const dotTex = app.renderer.generateTexture(new Graphics().circle(0, 0, 4).fill(radial([[0, 'rgba(255,225,150,1)'], [1, 'rgba(255,190,70,0)']])));
  const fxTop = new Container(); root.addChild(fxTop); st.fxTop = fxTop;
  st.dust = [];
  const DN = isLite ? 10 : 22;
  for (let i = 0; i < DN; i++) {
    const sp = new Sprite(dotTex); sp.anchor.set(0.5); sp.blendMode = 'add'; sp.alpha = 0; fxTop.addChild(sp);
    st.dust.push({ sp, x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.02, vy: -0.01 - Math.random() * 0.03, ph: Math.random() * 6, sz: 0.35 + Math.random() * 0.8 });
  }
  st.twinkles = (cfg.stars || []).map(([fx, fy], i) => {
    const sp = new Sprite(starTex); sp.anchor.set(0.5); sp.blendMode = 'add'; sp.alpha = 0; fxTop.addChild(sp);
    return { sp, fx, fy, ph: i * 1.7 };
  });
  // luz que sigue al dedo / mouse (solo sobre la burger)
  const spotTex = app.renderer.generateTexture(new Graphics().circle(0, 0, 90).fill(radial([[0, 'rgba(255,236,190,0.55)'], [0.5, 'rgba(255,200,110,0.16)'], [1, 'rgba(255,180,80,0)']])));
  const spot = new Sprite(spotTex); spot.anchor.set(0.5); spot.blendMode = 'add'; spot.alpha = 0.55; st.spot = spot;
  const spotMask = new Graphics(); st.spotMask = spotMask; root.addChild(spotMask); spot.mask = spotMask; root.addChild(spot);
  st.starTex = starTex;

  // estado animado por GSAP
  st.wrapState = { jy: 0 }; st.sq = { x: 1, y: 1 }; st.flare = 0; st.time = 0;

  // ── parallax: mouse / dedo / giroscopio ──
  const setT = (nx, ny) => { st.parallax.tx = Math.max(-1, Math.min(1, nx)); st.parallax.ty = Math.max(-1, Math.min(1, ny)); st.touched = performance.now(); };
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    setT(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => { st.parallax.tx = 0; st.parallax.ty = 0; };
  const onOri = (e) => {
    if (e.gamma == null) return;
    setT((e.gamma || 0) / 25, ((e.beta || 45) - 45) / 25);
  };
  const askGyro = () => {
    try {
      const D = window.DeviceOrientationEvent;
      if (D && typeof D.requestPermission === 'function') {
        D.requestPermission().then((r) => { if (r === 'granted') window.addEventListener('deviceorientation', onOri); }).catch(() => {});
      } else if (D) window.addEventListener('deviceorientation', onOri);
    } catch { /* noop */ }
  };
  host.addEventListener('pointermove', onMove); host.addEventListener('pointerleave', onLeave);
  host.addEventListener('pointerdown', askGyro, { once: true });
  if (!(window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function')) askGyro();
  cleanups.push(() => {
    host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
    host.removeEventListener('pointerdown', askGyro); window.removeEventListener('deviceorientation', onOri);
  });

  app.ticker.add((tk) => {
    const dt = tk.deltaMS / 1000; st.time += dt; const t = st.time;
    // parallax suave (+ deriva lenta si nadie toca)
    const idle = performance.now() - (st.touched || 0) > 2500;
    const tx = idle ? Math.sin(t * 0.5) * 0.35 : st.parallax.tx; const ty = idle ? Math.cos(t * 0.37) * 0.2 : st.parallax.ty;
    st.parallax.x += (tx - st.parallax.x) * Math.min(1, dt * 6); st.parallax.y += (ty - st.parallax.y) * Math.min(1, dt * 6);
    if (st.filter) {
      const u = st.filter.resources.parallaxUniforms.uniforms.uOffset;
      u[0] = -st.parallax.x * 0.014; u[1] = -st.parallax.y * 0.01;
      st.filter.resources.parallaxUniforms.update?.();
    } else {
      wrap.x = DW / 2 + st.parallax.x * 3;
    }
    wrap.rotation = st.parallax.x * 0.012;
    const breath = 1 + (Math.sin(t * 1.5) * 0.5 + 0.5) * 0.015;
    wrap.scale.set(st.sq.x * breath, st.sq.y * breath);
    wrap.y = BASE_Y + st.wrapState.jy;
    shadow.scale.set(1 - Math.abs(Math.min(0, st.wrapState.jy)) / 120, 1);
    shadow.alpha = 0.9 - Math.abs(Math.min(0, st.wrapState.jy)) / 90;


    // ✨ polvo dorado + destellos + luz que sigue al dedo
    {
      const W = st.photoW; const H = st.photoH; const left = DW / 2 - W / 2; const top = BASE_Y - H;
      st.dust.forEach((d) => {
        d.x += d.vx * dt; d.y += d.vy * dt; d.ph += dt;
        if (d.y < -0.05 || d.x < -0.05 || d.x > 1.05) { d.y = 1.02; d.x = Math.random(); }
        d.sp.x = left + d.x * W + Math.sin(d.ph * 1.3) * 5; d.sp.y = top + d.y * H;
        d.sp.alpha = Math.max(0, Math.sin(d.ph * 2.2)) * 0.8 * Math.min(1, d.y * 4) ; d.sp.scale.set(d.sz);
      });
      st.twinkles.forEach((q) => {
        const k = Math.max(0, Math.sin(t * 1.15 + q.ph)); const v = k * k * k;
        q.sp.x = left + q.fx * W; q.sp.y = top + q.fy * H; q.sp.alpha = v; q.sp.scale.set(0.35 + v * 0.9); q.sp.rotation = Math.sin(t * 0.7 + q.ph) * 0.3;
      });
      st.spot.x = DW / 2 + st.parallax.x * W * 0.42; st.spot.y = top + H * (0.45 + st.parallax.y * 0.35);
      st.spot.alpha = 0.4 + st.flare * 0.5;
    }
    st.bokeh.forEach((b) => {
      b.sp.x = b.x + Math.sin(t * 0.25 + b.ph) * 10 - st.parallax.x * 10 * b.z; b.sp.y = b.y + Math.cos(t * 0.2 + b.ph) * 6 - st.parallax.y * 6 * b.z;
      b.sp.scale.set(b.sz * (1 + Math.sin(t * 0.8 + b.ph) * 0.08)); b.sp.alpha = (0.28 + 0.2 * Math.sin(t * 0.6 + b.ph)) * (0.6 + st.flare * 0.5);
    });
    st.flare = Math.max(0, st.flare - dt * 1.5);
    glow.alpha = 0.75 + Math.sin(t * 1.6) * 0.1 + st.flare * 0.35;
    const sb = st.steamBase || { x: DW / 2, y: 140, w: 120 };
    st.steam.forEach((p) => {
      p.t += dt * p.sp * 3; if (p.t > 1) { p.t = 0; p.dx = Math.random() - 0.5; }
      p.s.x = sb.x + p.dx * sb.w * 0.6 + Math.sin(t * 1.4 + p.ph) * 12 * p.t;
      p.s.y = sb.y - p.t * 90; p.s.alpha = Math.sin(p.t * Math.PI) * 0.42; p.s.scale.set(0.6 + p.t * 1.5);
    });
    st.embers.forEach((p) => {
      p.t += dt * p.sp; if (p.t > 1) { p.t = 0; p.x0 = DW / 2 + (Math.random() - 0.5) * 230; }
      p.s.x = p.x0 + Math.sin(t * 2 + p.ph) * 9; p.s.y = 312 - p.t * 150;
      p.s.alpha = Math.sin(p.t * Math.PI) * (0.55 + 0.45 * Math.sin(t * 9 + p.ph)); p.s.scale.set(p.sz * (1 - p.t * 0.5));
    });
  });
}

// ════════ fotos y combinaciones ════════
async function fetchCombo(st, cfg, name) {
  if (st.ok.has(name)) return st.ok.get(name);
  if (st.bad.has(name)) return null;
  const b = baseUrl() + cfg.dir + name;
  for (const ext of ['.webp', '.png', '.jpg']) {
    try { const tex = await loadTex(b + ext); st.ok.set(name, tex); return tex; } catch { /* siguiente */ }
  }
  st.bad.add(name); return null;
}
const dist = (a, b) => {
  const A = new Set(a === 'base' ? [] : a.split('sin-').filter(Boolean).map((s) => s.replace(/-$/, '')));
  const B = new Set(b === 'base' ? [] : b.split('sin-').filter(Boolean).map((s) => s.replace(/-$/, '')));
  let d = 0; A.forEach((x) => { if (!B.has(x)) d++; }); B.forEach((x) => { if (!A.has(x)) d++; });
  return d;
};
/** La combinación pedida, o la foto más parecida que exista. */
async function resolveTex(st, cfg, name) {
  const exact = await fetchCombo(st, cfg, name);
  if (exact) return { name, tex: exact };
  const cands = allCombos(cfg.order).filter((c) => c !== name && !st.bad.has(c)).sort((a, b) => dist(a, name) - dist(b, name));
  for (const c of cands.slice(0, 8)) {
    const t = await fetchCombo(st, cfg, c);
    if (t) return { name: c, tex: t };
  }
  return null;
}
function prefetch(st, cfg) {
  // base + las 5 variantes de "sin 1 ingrediente" en segundo plano
  [...cfg.order.map((k) => `sin-${k}`)].forEach((n, i) => setTimeout(() => { if (st.ready) fetchCombo(st, cfg, n); }, 600 + i * 350));
}

// ════════ el salto ════════
function diffKeys(a, b) {
  const parse = (n) => new Set(n === 'base' ? [] : n.split('sin-').filter(Boolean).map((s) => s.replace(/-$/, '')));
  const A = parse(a); const B = parse(b);
  return { removed: [...B].filter((x) => !A.has(x)), added: [...A].filter((x) => !B.has(x)) };
}

async function go(st, cfg, want) {
  if (st.busy) { st.queued = want; return; }
  if (!st.ready || want === st.shown) return;
  st.busy = true;
  try {
    const res = await resolveTex(st, cfg, want);
    if (!res || res.name === st.shown) {
      // no hay foto distinta: solo el salto + sticker
      jumpOnly(st, cfg, diffKeys(st.shown, want));
      await new Promise((r) => setTimeout(r, 800));
      return;
    }
    const { removed, added } = diffKeys(res.name === want ? st.shown : st.shown, want);
    const prevShown = st.shown;
    const dk = diffKeys(prevShown, want);
    const apexDone = new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(st.sq, { x: 1.05, y: 0.9, duration: 0.11, ease: 'power2.out' })
        .to(st.sq, { x: 0.96, y: 1.07, duration: 0.2, ease: 'power2.out' })
        .to(st.wrapState, { jy: -42, duration: 0.2, ease: 'power2.out' }, '<')
        .add(() => {
          // en lo más alto: crossfade a la foto nueva
          setPhoto(st, st.spB, res.tex); st.spB.alpha = 0;
          gsap.to(st.spB, { alpha: 1, duration: 0.18, onComplete: () => { setPhoto(st, st.spA, res.tex); st.spA.alpha = 1; st.spB.alpha = 0; } });
          st.flare = 1;
        })
        .to(st.wrapState, { jy: 0, duration: 0.55, ease: 'bounce.out' })
        .to(st.sq, { x: 1.06, y: 0.88, duration: 0.1, ease: 'power2.in' }, '-=0.46')
        .to(st.sq, { x: 1, y: 1, duration: 0.5, ease: 'elastic.out(1,0.45)' });
    });
    st.shown = res.name;
    flySticker(st, cfg, dk);
    await apexDone;
  } finally {
    st.busy = false;
    if (st.queued && st.queued !== st.shown) { const q = st.queued; st.queued = null; go(st, cfg, q); } else st.queued = null;
  }
}

function jumpOnly(st, cfg, dk) {
  gsap.timeline()
    .to(st.sq, { x: 1.05, y: 0.9, duration: 0.11 })
    .to(st.sq, { x: 0.97, y: 1.06, duration: 0.18 })
    .to(st.wrapState, { jy: -34, duration: 0.18 }, '<')
    .to(st.wrapState, { jy: 0, duration: 0.5, ease: 'bounce.out' })
    .to(st.sq, { x: 1, y: 1, duration: 0.5, ease: 'elastic.out(1,0.45)' }, '-=0.4');
  flySticker(st, cfg, dk);
}


function magicBurst(st, x, y, big = 1) {
  if (!st.ready) return;
  const ring = new Graphics().circle(0, 0, 30).stroke({ width: 3, color: '#ffd98a', alpha: 0.95 });
  ring.position.set(x, y); ring.scale.set(0.2); ring.blendMode = 'add'; st.fxTop.addChild(ring);
  gsap.to(ring.scale, { x: 1.7 * big, y: 1.7 * big, duration: 0.7, ease: 'power2.out' });
  gsap.to(ring, { alpha: 0, duration: 0.7, ease: 'power1.in', onComplete: () => ring.destroy() });
  const n = st.lite ? 7 : 14;
  for (let i = 0; i < n; i++) {
    const sp = new Sprite(st.starTex); sp.anchor.set(0.5); sp.blendMode = 'add'; sp.position.set(x, y); sp.scale.set(0.1);
    st.fxTop.addChild(sp);
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5; const r = (40 + Math.random() * 50) * big; const sc = 0.4 + Math.random() * 0.7;
    gsap.to(sp, { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r - 12, duration: 0.8, ease: 'power2.out' });
    gsap.to(sp.scale, { x: sc, y: sc, duration: 0.25, ease: 'back.out(2)' });
    gsap.to(sp, { alpha: 0, rotation: 2, duration: 0.45, delay: 0.4, onComplete: () => sp.destroy() });
  }
  st.flare = Math.max(st.flare, 1);
}

async function flySticker(st, cfg, { removed, added }) {
  const items = [...removed.map((k) => ({ k, out: true })), ...added.map((k) => ({ k, out: false }))];
  for (let i = 0; i < items.length; i++) {
    const { k, out } = items[i]; const def = cfg.sticker[k]; if (!def) continue;
    let tex = st.ok.get(`sticker:${k}`);
    if (!tex) { try { tex = await loadTex(baseUrl() + cfg.stickerDir + def.f); st.ok.set(`sticker:${k}`, tex); } catch { continue; } }
    if (!st.ready) return;
    const sp = new Sprite(tex); sp.anchor.set(0.5);
    const w = 64; sp.scale.set(w / tex.width); const s0 = sp.scale.x;
    const H = st.photoH; const W = st.photoW;
    const px = DW / 2 - W / 2 + def.at[0] * W; const py = BASE_Y - H + def.at[1] * H;
    magicBurst(st, px, py, 1);
    const side = (i % 2 ? 1 : -1) * (out ? 1 : -1);
    const ox = px + side * (110 + Math.random() * 30); const oy = py - 70 - Math.random() * 30;
    st.stickers.addChild(sp);
    const kill = () => { st.stickers.removeChild(sp); sp.destroy(); };
    if (out) {
      sp.position.set(px, py); sp.scale.set(s0 * 0.4); sp.alpha = 0;
      const tl = gsap.timeline({ onComplete: kill });
      tl.to(sp, { alpha: 1, duration: 0.1 })
        .to(sp.scale, { x: s0, y: s0, duration: 0.25, ease: 'back.out(2)' }, 0)
        .to(sp, { x: ox, y: oy, rotation: side * 1.2, duration: 0.8, ease: 'power2.out' }, 0.05)
        .to(sp, { y: oy + 70, alpha: 0, duration: 0.7, ease: 'power1.in' }, 0.85)
        .to(sp.scale, { x: s0 * 0.6, y: s0 * 0.6, duration: 0.7 }, 0.85);
    } else {
      sp.position.set(ox, oy); sp.alpha = 0; sp.rotation = side * 1.2;
      const tl = gsap.timeline({ onComplete: kill });
      tl.to(sp, { alpha: 1, duration: 0.15 })
        .to(sp, { x: px, y: py, rotation: 0, duration: 0.5, ease: 'power2.in' }, 0)
        .to(sp.scale, { x: s0 * 0.4, y: s0 * 0.4, duration: 0.5 }, 0)
        .to(sp, { alpha: 0, duration: 0.12 }, 0.45);
    }
  }
}
