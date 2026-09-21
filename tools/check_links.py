from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='a' and 'href' in attrs: self.links.append(attrs['href'])
missing={}
pages=[ROOT/p for p in json.loads((ROOT/'.artifacts/audit.json').read_text())['keep'] if p.endswith('.html')]
for p in pages:
    parser=Links();parser.feed(p.read_text(encoding='utf-8'))
    for href in parser.links:
        u=urlsplit(href)
        if u.scheme or u.netloc or not u.path: continue
        target=(ROOT/u.path.lstrip('/')) if u.path.startswith('/') else p.parent/u.path
        target=Path(unquote(str(target)))
        if not target.exists(): missing.setdefault(href,[]).append(p.relative_to(ROOT).as_posix())
print(json.dumps({'pages':len(pages),'missing':missing},indent=2))
