from pathlib import Path
from PIL import Image
from scipy.ndimage import label,binary_dilation
from io import BytesIO
import numpy as np
root=Path(__file__).resolve().parents[1];src=root.parent.parent/'upload'
def save(im,p):
 b=BytesIO();im.save(b,format='PNG');p.write_bytes(b.getvalue())
def isolate(im,box):
 a=np.array(im.crop(box));l,n=label(a[:,:,3]>24);sz=np.bincount(l.ravel());sz[0]=0;m=binary_dilation(l==sz.argmax(),iterations=2);a[:,:,3]=np.where(m,a[:,:,3],0);r=Image.fromarray(a);return r.crop(r.getbbox())
for id,file,boxes in [('elf','10_10_12-5',[(0,0,560,610),(525,60,950,500),(1040,495,1448,1086)]),('darkelf','10_10_00-1',[(30,0,515,521),(495,90,992,505),(1035,505,1448,1086)])]:
 im=Image.open(src/('ChatGPT 이미지 2026년 10월 12일 오후 '+file+'.png'))
 for pose,box in zip(['win','kneel','blush'],boxes):save(isolate(im,box),root/'assets'/f'{id}-{pose}.png')
cur=Image.open(root.parent/'assets/curtain-1.png')
for i in range(6):
 frame=cur.crop((round(i*cur.width/6),0,round((i+1)*cur.width/6),cur.height));save(frame,root/'assets'/f'curtain-frame-{i}.png')
print('Prepared existing victory/kneel/blush poses and six curtain frames')
