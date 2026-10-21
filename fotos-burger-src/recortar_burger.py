# Recorta el fondo de las fotos de la burger (GrabCut + refinado). Uso: python3 recortar_burger.py
import cv2, numpy as np, os, sys
D='public/fotos-burger/dilusso/'
names=[f[:-5] for f in sorted(os.listdir(D)) if f.endswith('.webp') and not f.startswith('cut')]
def cut(name):
    im=cv2.imread(D+name+'.webp'); h,w=im.shape[:2]
    S=2; sm=cv2.resize(im,(w//S,h//S)); hh,ww=sm.shape[:2]
    m=np.full((hh,ww),cv2.GC_BGD,np.uint8)
    # probable: todo el rectángulo de la burger; seguro: núcleo central
    y0,y1=int(hh*0.07),int(hh*0.915)
    m[y0:y1,int(ww*0.01):int(ww*0.99)]=cv2.GC_PR_BGD
    m[int(hh*0.16):int(hh*0.86),int(ww*0.12):int(ww*0.88)]=cv2.GC_PR_FGD
    m[int(hh*0.30):int(hh*0.80),int(ww*0.2):int(ww*0.8)]=cv2.GC_FGD
    # base del pan: zona segura (la tabla es del mismo color y confunde a GrabCut)
    poly=np.array([[int(ww*0.10),int(hh*0.74)],[int(ww*0.90),int(hh*0.74)],[int(ww*0.84),int(hh*0.905)],[int(ww*0.16),int(hh*0.905)]],np.int32)
    cv2.fillPoly(m,[poly],cv2.GC_FGD)
    bg=np.zeros((1,65));fg=np.zeros((1,65))
    cv2.grabCut(sm,m,None,bg,fg,7,cv2.GC_INIT_WITH_MASK)
    fgm=((m==1)|(m==3)).astype(np.uint8)
    # borde inferior: la burger termina en la base del pan (la tabla no entra)
    # hebras de cebolla (blancas, finas): se suman si tocan la burger
    hsv=cv2.cvtColor(sm,cv2.COLOR_BGR2HSV)
    wh=((hsv[...,2]>150)&(hsv[...,1]<80)).astype(np.uint8)
    wh[:int(hh*0.27)]=0; wh[int(hh*0.88):]=0
    near=cv2.dilate(fgm,np.ones((13,13),np.uint8))
    cand=(wh&near)
    n3,l3,s3,_=cv2.connectedComponentsWithStats(cand)
    for i in range(1,n3):
        if s3[i,4]>=6: fgm[l3==i]=1
    fgm[int(hh*0.915):]=0
    fgm=cv2.morphologyEx(fgm,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    fgm=cv2.morphologyEx(fgm,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(fgm); 
    if n>1: fgm=(lab==1+np.argmax(st[1:,4])).astype(np.uint8)
    # rellenar agujeros chicos
    inv=1-fgm; n2,l2,s2,_=cv2.connectedComponentsWithStats(inv)
    for i in range(1,n2):
        if s2[i,4]<400: fgm[l2==i]=1
    a=cv2.resize(fgm.astype(np.float32),(w,h),interpolation=cv2.INTER_LINEAR)
    a=cv2.GaussianBlur(a,(0,0),1.6); a=np.clip((a-0.3)/0.5,0,1)
    out=np.dstack([im,(a*255).astype(np.uint8)])
    return out
if __name__=='__main__':
    for n in names:
        o=cut(n); cv2.imwrite(f'/tmp/cut_{n}.png',o); print(n)
