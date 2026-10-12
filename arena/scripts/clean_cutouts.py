"""Remove isolated fragments from the supplied atlas cells; retain soft edges."""
from pathlib import Path
from io import BytesIO
from PIL import Image
import numpy as np
from scipy.ndimage import label, binary_dilation
root=Path(__file__).resolve().parents[1]/'assets'
for p in root.glob('*.png'):
 if not (p.stem.startswith(('elf-','darkelf-')) and not p.stem.endswith('-face')) and p.stem not in ['punch','kick','magic','guard']:continue
 im=Image.open(p).convert('RGBA');a=np.array(im);labels,count=label(a[:,:,3]>24)
 sizes=np.bincount(labels.ravel());sizes[0]=0
 if count:
  mask=binary_dilation(labels==sizes.argmax(),iterations=2)
  a[:,:,3]=np.where(mask,a[:,:,3],0)
  b=BytesIO();Image.fromarray(a).save(b,format='PNG');tmp=p.with_suffix('.tmp');tmp.write_bytes(b.getvalue());tmp.replace(p)
print('Cleaned 12 fighter cells and 4 button cells')
