import numpy as np, cv2
from scipy import ndimage as ndi
im=cv2.imread('/sessions/upbeat-determined-dirac/mnt/carta-bar/public/fotos-burger/dilusso.png')
rgb=im[:,:,::-1].astype(np.float32)
diff=255-rgb.min(axis=2)
mask=diff>12
mask=ndi.binary_closing(mask,iterations=3)
mx=rgb.max(axis=2);mn=rgb.min(axis=2);sat=(mx-mn)/np.maximum(mx,1)
core=(diff>110)|((sat>0.17)&(diff>30))
lab,n=ndi.label(mask)
objs=ndi.find_objects(lab)
sizes=ndi.sum(mask,lab,range(1,n+1))
comps=[(i,s) for i,s in enumerate(sizes) if s>6000]
print(len(comps))
res=[]
for i,s in comps:
    sl=objs[i]; y0,y1,x0,x1=sl[0].start,sl[0].stop,sl[1].start,sl[1].stop
    res.append((y0,x0,y1,x1,i+1))
for r in sorted(res,key=lambda r:(r[0]//300,r[1])): print(r)


names={1:'bunTop',3:'bunBottom',2:'patty',6:'cheddar',4:'bacon',5:'onion',7:'mayo',8:'ketchup'}
import os
out='/sessions/upbeat-determined-dirac/mnt/carta-bar/public/fotos-burger/dilusso'
os.makedirs(out,exist_ok=True)
for (y0,x0,y1,x1,l) in res:
    nm=names[l]
    reg=(lab==l)
    c0=core&ndi.binary_dilation(reg,iterations=1)
    if nm=='onion':
        c0=ndi.binary_closing(c0,iterations=2)
    else:
        c0=ndi.binary_closing(c0,iterations=3)
    # keep largest component
    l2,n2=ndi.label(c0)
    if n2>1:
        sz=ndi.sum(c0,l2,range(1,n2+1)); keep=np.zeros_like(c0)
        for k,z in enumerate(sz):
            if z>0.01*sz.max(): keep|=(l2==k+1)
        c0=keep
    if nm in ('onion','mayo'):
        base=ndi.binary_dilation(reg,iterations=1)
        satm=(sat>0.055)&(diff>14)&base
        if nm=='mayo':
            satm=ndi.binary_fill_holes(ndi.binary_closing(satm,iterations=4))
        c0=satm
    filled=c0 if nm=='onion' else ndi.binary_fill_holes(c0)
    a=filled.astype(np.float32)
    a=cv2.GaussianBlur(a,(0,0),1.1)
    a=np.clip((a-0.35)/0.5,0,1)
    if nm=='onion':
        a=np.clip(a*1.0,0,1)
    af=np.clip(a,0.001,1)[...,None]
    col=np.clip((rgb-255*(1-af)*0.0)/1,0,255)
    rgba=np.dstack([col,a*255]).astype(np.uint8)
    p=6
    c=rgba[max(0,y0-p):y1+p,max(0,x0-p):x1+p]
    ys,xs=np.where(c[...,3]>8)
    c=c[ys.min():ys.max()+1,xs.min():xs.max()+1]
    cv2.imwrite(f'{out}/{nm}.png',c[...,[2,1,0,3]])
    print(nm,c.shape)
