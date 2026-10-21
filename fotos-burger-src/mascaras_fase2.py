"""Fase 2 · máscaras por ingrediente (2 por cada uno).
 <k>-cambio.png : amplia (diferencia + banda de la capa, dilatada, feather 8px) → crossfade base→sin-*
 <k>-pieza.png  : estricta (diferencia ∩ color ∩ banda, erosionada, feather 1.5px) → pieza que vuela
Uso: python3 mascaras_fase2.py  (desde cualquier lado; trabaja sobre public/fotos-burger/di-lusso/listas)"""
import os, numpy as np, cv2
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'fotos-burger', 'di-lusso', 'listas')
os.chdir(D); os.makedirs('masks', exist_ok=True)
def load(f): return np.array(Image.open(f).convert('RGBA')).astype(np.float32)
def comp(a): return a[..., :3] * (a[..., 3:] / 255)
B = load('base.webp'); Bc = comp(B).astype(np.uint8)
Bl = cv2.cvtColor(Bc, cv2.COLOR_RGB2LAB).astype(np.float32)
hsv = cv2.cvtColor(Bc, cv2.COLOR_RGB2HSV); H, S, V = [hsv[..., i].astype(np.int32) for i in range(3)]
Hh, Ww = B.shape[:2]
def band(y0, y1, x0=0, x1=Ww):
    m = np.zeros((Hh, Ww), np.uint8); m[y0:y1, x0:x1] = 255; return m
def ell(n): return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))
def fillholes(m):
    inv = 255 - m; ff = inv.copy(); mm = np.zeros((Hh + 2, Ww + 2), np.uint8); cv2.floodFill(ff, mm, (0, 0), 0); return m | ff
def keepbig(m, amin, blob=0):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m); out = np.zeros_like(m)
    for i in range(1, n):
        if st[i, 4] < amin: continue
        if blob:
            c = (lab == i).astype(np.uint8); dt = cv2.distanceTransform(c, cv2.DIST_L2, 3)
            if dt.max() < blob: continue          # hilos finos: no son blobs
        out[lab == i] = 255
    return out
# rojo (ketchup/bacon), blanco cálido, naranja
red = ((H <= 9) | (H >= 165)) & (S >= 90)
orange = (H >= 8) & (H <= 30) & (S >= 150) & (V >= 140)
white = (S <= 85) & (V >= 150)
CFG = {
 # banda_y, banda_x, color, umbral diff, dilatación 'cambio'
 'cheddar':   dict(band=(590, 905),  color=orange, thr=42, er=3, blob=0,  amin=4000),
 'cebolla':   dict(band=(440, 800),  color=(S <= 120) & (V >= 150) & (H <= 30), thr=40, er=1, blob=0, amin=1500),
 'bacon':     dict(band=(350, 575),  color=red & (V >= 55) & (V <= 215) & ~((S >= 175) & (V >= 150)), thr=40, er=3, blob=0, amin=2500),
 'ketchup':   dict(band=(350, 650),  color=red & (S >= 170) & (V >= 120), thr=40, er=2, blob=0, amin=800),
 'lactonesa': dict(band=(350, 560),  color=white & (V >= 185), thr=40, er=2, blob=7, amin=1200),
}
ORDER = ['cheddar', 'lactonesa', 'ketchup', 'cebolla', 'bacon']
res = {}
for k in ORDER:
    c = CFG[k]; Vimg = load(f'sin-{k}.png'); Vl = cv2.cvtColor(comp(Vimg).astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    d = np.sqrt(((cv2.GaussianBlur(Bl, (0, 0), 3) - cv2.GaussianBlur(Vl, (0, 0), 3)) ** 2).sum(2))
    both = cv2.erode(((B[..., 3] > 200) & (Vimg[..., 3] > 200)).astype(np.uint8), np.ones((9, 9), np.uint8))
    diff = ((d * both) > c['thr']).astype(np.uint8) * 255
    bd = band(*c['band'])
    # CAMBIO: diferencia ∩ banda, cierre, dilatación y feather grande
    ch = cv2.bitwise_and(diff, bd)
    ch = cv2.morphologyEx(ch, cv2.MORPH_OPEN, ell(5)); ch = cv2.morphologyEx(ch, cv2.MORPH_CLOSE, ell(25))
    ch = fillholes(keepbig(ch, 2500)); ch = cv2.dilate(ch, ell(15))
    ch = cv2.bitwise_and(ch, (B[..., 3] > 40).astype(np.uint8) * 255)
    ch = cv2.GaussianBlur(ch, (0, 0), 4.0)
    # PIEZA: diferencia ∩ color ∩ banda
    # la diferencia cruda es ruidosa (re-render): se usa la zona de cambio ya limpia y dilatada como 'diferencia'
    pc = cv2.bitwise_and(cv2.bitwise_and((ch > 100).astype(np.uint8) * 255, bd), c['color'].astype(np.uint8) * 255)
    pc = cv2.morphologyEx(pc, cv2.MORPH_OPEN, ell(5 if k not in ('lactonesa','cebolla') else 9 if k=='lactonesa' else 1))
    pc = cv2.morphologyEx(pc, cv2.MORPH_CLOSE, ell(11))
    pc = keepbig(pc, c['amin'], c['blob']); pc = fillholes(pc)
    pc = cv2.erode(pc, ell(c['er'] * 2 + 1)); pc = cv2.GaussianBlur(pc, (0, 0), 1.2)
    cv2.imwrite(f'masks/{k}-cambio.png', ch); cv2.imwrite(f'masks/{k}-pieza.png', pc); res[k] = (ch, pc)
    print(k, 'cambio %.1f%%' % ((ch > 127).mean() * 100), 'pieza %.1f%%' % ((pc > 127).mean() * 100))
# hoja de contacto
a = B[..., 3:] / 255.0; img = (B[..., :3] * a + 30 * (1 - a)).astype(np.uint8)
rows = []
for j, col in ((0, (255, 40, 200)), (1, (40, 255, 120))):
    tiles = []
    for k in ORDER:
        m = (res[k][j] / 255.0)[..., None] * 0.7
        t = img.astype(np.float32) * (1 - m) + np.array(col, np.float32) * m
        t = cv2.resize(t.astype(np.uint8), (467, 314)); cv2.putText(t, k + (' CAMBIO' if j == 0 else ' PIEZA'), (8, 24), 0, 0.7, (255, 255, 255), 2); tiles.append(t)
    rows += [np.hstack(tiles[:3]), np.hstack(tiles[3:] + [np.zeros_like(tiles[0])])]
Image.fromarray(np.vstack(rows)).save(os.path.join('/sessions/upbeat-determined-dirac/mnt/outputs', 'masks10.png'))
