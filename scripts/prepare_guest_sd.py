"""Crop existing adult guest SD sheets; no generated artwork."""
from PIL import Image
from pathlib import Path
import io,json,os
out=Path('assets/guest-sd');out.mkdir(parents=True,exist_ok=True);records=[];num=0
for stem,rows in [('image-gen-1(20261011-154118).png',2),('image-gen-2(20261011-154122).png',2),('image-gen-3(20261011-154126).png',2),('image-gen-4(20261011-154130).png',2),('image-gen-5(20261011-154134).png',1)]:
 im=Image.open(Path('../source_assets/male')/stem).convert('RGBA');w,h=im.size
 for row in range(rows):
  for col,direction in enumerate(['front','left','right']):
   cell=im.crop((col*w//4,row*h//rows,(col+1)*w//4,(row+1)*h//rows));box=cell.getbbox();cell=cell.crop(box);cell.thumbnail((360,540),Image.Resampling.LANCZOS)
   b=io.BytesIO();cell.save(b,format='PNG',optimize=True);data=b.getvalue();Image.open(io.BytesIO(data)).load();target=out/f'{num}-{direction}.png';temp=target.with_suffix('.tmp');temp.write_bytes(data);os.replace(temp,target)
   records.append(dict(file=target.name,source=stem,row=row,column=col,size=list(cell.size)))
  num+=1
(out/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2));print('Cropped',num,'adult guest SD variants')
