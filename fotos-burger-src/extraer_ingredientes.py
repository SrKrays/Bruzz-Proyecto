# Saca el "sprite" real de un ingrediente: píxeles de la foto base que (a) cambian al sacarlo y (b) tienen el color del ingrediente.
# Salida: public/fotos-burger/dilusso/ext-<ingrediente>.webp (mismo tamaño y recorte que las fotos → calzan exacto).
import cv2, numpy as np, json
from PIL import Image
B=json.load(open('fotos-burger-src/bbox-dilusso.json'))
O='fotos-burger-src/originales-dilusso/con-fondo/'; D='public/fotos-burger/dilusso/'
base=cv2.imread(O+'base.webp'); basef=base.astype(np.float32)
bc=np.array(Image.open(D+'base.webp').convert('RGBA'))   # recortada
H,W=base.shape[:2]
hsv=cv2.cvtColor(base,cv2.COLOR_BGR2HSV)
Hh,Ss,Vv=hsv[...,0].astype(int),hsv[...,1].astype(int),hsv[...,2].astype(int)
yy=np.arange(H)[:,None]*np.ones((1,W))
def run(key,variant,colormask,y0,y1,minarea,grow,use_diff=True):
    v=cv2.imread(O+variant+'.webp').astype(np.float32)
    d=cv2.GaussianBlur(np.abs(basef-v).max(axis=2),(0,0),1.0)
    m=((d>26) if use_diff else True)&colormask&(yy>H*y0)&(yy<H*y1)
    m=m.astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    keep=np.zeros_like(m)
    for i in range(1,n):
        if st[i,4]>=minarea: keep[lab==i]=1
    keep=cv2.morphologyEx(keep,cv2.MORPH_CLOSE,np.ones((grow,grow),np.uint8))
    keep=cv2.dilate(keep,np.ones((3,3),np.uint8))
    a=cv2.GaussianBlur(keep.astype(np.float32),(0,0),1.6); a=np.clip((a-0.2)/0.6,0,1)
    a=a[B['y0']:B['y1'],B['x0']:B['x1']]*(bc[...,3]/255.)
    rgb=cv2.cvtColor(base,cv2.COLOR_BGR2RGB)[B['y0']:B['y1'],B['x0']:B['x1']]
    out=np.dstack([rgb,(a*255).astype(np.uint8)])
    Image.fromarray(out).save(f'{D}ext-{key}.webp','WEBP',quality=88,alpha_quality=100,method=6)
    ys,xs=np.where(a>0.3); print(key,'pivot',round(xs.mean()/a.shape[1],3),round(ys.mean()/a.shape[0],3),'cobertura',round(float((a>0.3).mean()),3))
    return out
# cheddar: naranja-amarillo saturado
cheddar=((Hh>=8)&(Hh<=32)&(Ss>=150)&(Vv>=150))
run('cheddar','sin-cheddar',cheddar,0.50,0.92,400,9)
# cebolla: blanca/crema en la base y que YA NO está blanca en la variante (la mayonesa se queda en las dos)
v2=cv2.cvtColor(cv2.imread(O+'sin-cebolla.webp'),cv2.COLOR_BGR2HSV)
white_v=((v2[...,1]<120)&(v2[...,2]>=135)).astype(np.uint8)
white_v=cv2.dilate(white_v,np.ones((5,5),np.uint8))
cebolla=((Ss<120)&(Vv>=135)&(white_v==0))
run('cebolla','sin-cebolla',cebolla|False,0.28,0.86,40,5,use_diff=False)
