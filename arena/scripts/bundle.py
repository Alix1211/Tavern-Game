from pathlib import Path
import base64,re,mimetypes,zipfile
root=Path(__file__).resolve().parents[1]
def data(p):
 b=(root/p).read_bytes();return 'data:'+mimetypes.guess_type(p)[0]+';base64,'+base64.b64encode(b).decode()
h=(root/'index.html').read_text();css=(root/'arena.css').read_text();css=re.sub(r"url\('([^']+)'\)",lambda m:"url('"+data(m[1])+"')",css)
h=h.replace('<link rel="stylesheet" href="arena.css">','<style>'+css+'</style>')
h=re.sub(r'src="(assets/[^\"]+)"',lambda m:'src="'+data(m[1])+'"',h)
assets={str(p.relative_to(root)):data(str(p.relative_to(root))) for p in (root/'assets').glob('*.png')}
import json
js=(root/'arena.js').read_text().replace("(() => {",'(() => {\n const ASSETS='+json.dumps(assets)+';\n',1)
js=js.replace('`assets/${ARENA_DATA.fighters[side].id}-${p}.png`','ASSETS[`assets/${ARENA_DATA.fighters[side].id}-${p}.png`]').replace('`assets/${name}.png`','ASSETS[`assets/${name}.png`]')
js=js.replace('`assets/${e.enemy}.png`','ASSETS[`assets/${e.enemy}.png`]').replace('`assets/${e.choice}.png`','ASSETS[`assets/${e.choice}.png`]').replace('`assets/${id}-${p}.png`','ASSETS[`assets/${id}-${p}.png`]')
h=h.replace('<script src="arena-data.js"></script><script src="arena-auto-engine.js"></script><script src="arena.js"></script>','<script>'+(root/'arena-data.js').read_text()+'</script><script>'+(root/'arena-auto-engine.js').read_text()+'</script><script>'+js+'</script>')
(root/'arena-auto.html').write_text(h)
with zipfile.ZipFile(root/'arena-auto.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in root.rglob('*'):
  if p.is_file() and p.suffix!='.zip' and p.name not in ['arena-preview.html','arena-qte.html']:z.write(p,'arena/'+str(p.relative_to(root)))
print('HTML',round(len(h)/1024/1024,1),'MB; zip',round((root/'arena-auto.zip').stat().st_size/1024/1024,1),'MB')
