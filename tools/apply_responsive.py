from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
audit=json.loads((root/'.artifacts/audit.json').read_text())
redirects=[]
for name in audit['keep']:
 if not name.endswith('.html'):continue
 p=root/name;s=p.read_text(encoding='utf-8')
 if 'There has been a critical error' in s:
  route='/'+name.removesuffix('index.html')
  redirects.append({'source':route.rstrip('/'),'destination':'/portfolio/','permanent':False})
  s='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=/portfolio/"><title>Nos réalisations — RZ Prod</title></head><body><p><a href="/portfolio/">Retrouvez nos réalisations dans le portfolio.</a></p></body></html>'
 if '/assets/responsive.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/assets/responsive.css"></head>')
 p.write_text(s,encoding='utf-8')
p=root/'vercel.json';config=json.loads(p.read_text());config['redirects']=config.get('redirects',[])+redirects;p.write_text(json.dumps(config,indent=2)+'\n')
print('Shared mobile styles installed; legacy redirects:',len(redirects))
