# Procesa fotos nuevas de la Di Lusso: quita el fondo, recorta igual que las demás y las deja en public/.
# Uso (desde la carpeta carta-bar):  python3 fotos-burger-src/procesar_fotos.py
# Poné las fotos de GPT (1402x1122, con fondo) en fotos-burger-src/nuevas/ con el nombre final:
#   sin-panceta.png, sin-cheddar-sin-cebolla.png, ...
import os, json, shutil, importlib.util
from PIL import Image
import cv2
spec=importlib.util.spec_from_file_location('rb','fotos-burger-src/recortar_burger.py'); rb=importlib.util.module_from_spec(spec); spec.loader.exec_module(rb)
B=json.load(open('fotos-burger-src/bbox-dilusso.json'))
SRC='fotos-burger-src/nuevas/'; DST='public/fotos-burger/dilusso/'; ORIG='fotos-burger-src/originales-dilusso/con-fondo/'
os.makedirs(ORIG,exist_ok=True)
for f in sorted(os.listdir(SRC)):
    n,ext=os.path.splitext(f)
    if ext.lower() not in ('.png','.webp','.jpg','.jpeg'): continue
    im=Image.open(SRC+f).convert('RGB')
    if im.size!=(1402,1122): im=im.resize((1402,1122),Image.LANCZOS); print(' (reescalada a 1402x1122)')
    im.save(ORIG+n+'.webp','WEBP',quality=90)
    rb.D=ORIG
    c=rb.cut(n)[B['y0']:B['y1'],B['x0']:B['x1']]
    Image.fromarray(c[...,[2,1,0,3]]).save(DST+n+'.webp','WEBP',quality=88,alpha_quality=100,method=6)
    shutil.move(SRC+f,'fotos-burger-src/originales-dilusso/'+f)
    print('OK',n)
