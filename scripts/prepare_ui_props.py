"""Extract supplied transparent atlases; coordinates are original source pixels."""
from PIL import Image
from pathlib import Path
import json,io,os
src=Path('../upload');out=Path('assets/ui');out.mkdir(parents=True,exist_ok=True);manifest=[]
def crop(source,name,box,width=500):
 im=Image.open(src/source).convert('RGBA').crop(box);bbox=im.getbbox()
 if bbox:im=im.crop(bbox)
 if im.width>width:im.thumbnail((width,2000),Image.Resampling.LANCZOS)
 
 if name in ('sign-pink','sign-purple'):
  # Remove a neighboring object's disconnected tip below the sign.
  im.paste((0,0,0,0),(0,int(im.height*.92),int(im.width*.58),im.height))
 buf=io.BytesIO();im.save(buf,format='PNG',optimize=True)
 data=buf.getvalue();Image.open(io.BytesIO(data)).load()
 target=out/(name+'.png');tmp=target.with_suffix('.tmp');tmp.write_bytes(data);os.replace(tmp,target)
 manifest.append(dict(file=name+'.png',source=source,box=box,size=list(im.size)))
a='판타지 선술집 빈 양피지와 장식 아틀라스-1.png'
for name,box in [('paper-wide',(0,0,1254,247)),('paper-dialog',(0,250,890,496)),('paper-tall',(897,247,1254,818)),('paper-card',(15,515,535,775)),('paper-square',(540,495,895,818)),('heart',(10,818,211,1030)),('bow-red',(210,818,430,1070)),('bow-purple',(432,842,650,1034)),('bell',(651,839,808,1030)),('rose',(812,817,1045,1040)),('flowers',(1046,822,1254,1038)),('corner-left',(0,1030,216,1254)),('corner-right',(214,1031,433,1254)),('heart-chain',(435,1035,563,1254)),('ribbon',(558,1038,797,1254)),('crown',(798,1050,1005,1254)),('wing-heart',(1005,1040,1254,1254))]:crop(a,name,box)
b='다섯 양피지와 열두 장식 세트-2.png'
for name,box in [('paper-popup',(0,157,601,677)),('bow-bell',(0,849,234,1077)),('paw',(446,861,644,1060)),('feather',(644,849,857,1060)),('roses',(844,845,1045,1068)),('pearls',(1044,847,1254,1052)),('clover',(0,1057,224,1254)),('key',(225,1062,376,1254)),('chain',(375,1064,633,1254)),('heart-lock',(1045,1040,1254,1254))]:crop(b,name,box)
c='판타지 선술집 네온 하트·클로버·랜턴·금화-4.png'
for name,box in [('neon-heart',(0,0,370,361)),('neon-pair',(370,0,723,362)),('neon-clover',(1080,0,1448,361)),('lantern',(0,360,366,727)),('candle',(367,360,724,727)),('heart-lantern',(724,360,1081,727)),('candles',(1081,360,1448,727)),('coin',(0,728,366,1086)),('coins',(1081,728,1448,1086))]:crop(c,name,box,220)
d='핑크 골드 판타지 UI 장식 4종-3.png'
for name,box in [('curtain-sign',(0,0,1100,510)),('paw-wand',(1100,0,1536,666))]:crop(d,name,box)
crop('하트 리본 장식 빈 간판 4종-2.png','wood-sign',(654,530,1536,1024),500)
crop('반짝이는 하트 장식의 빈 양피지 패널-1.png','decorated-paper',(160,0,1380,510),600)
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));print('Extracted',len(manifest),'assets')
# Individual decorated vacant-table signs and a separate feather finial.
crop('하트 리본 장식 빈 간판 4종-2.png','sign-pink',(0,0,765,530),420)
crop('하트 리본 장식 빈 간판 4종-2.png','sign-purple',(770,0,1536,550),420)
crop('하트 리본 장식 빈 간판 4종-2.png','sign-floral',(0,505,650,1024),420)
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
