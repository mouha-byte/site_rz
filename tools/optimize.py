"""Audit the static export's transitive asset dependencies before pruning."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from html import unescape
import re, json, posixpath

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', '.vercel', 'tools', '.artifacts', 'node_modules'}
FILES = {p.relative_to(ROOT).as_posix(): p for p in ROOT.rglob('*') if p.is_file() and not any(x in EXCLUDE for x in p.relative_to(ROOT).parts)}
TEXT = {'.html', '.css', '.js', '.json', '.svg', '.xml', '.xsl', '.txt'}
keep, missing = set(), {}

def refs(text):
    text = unescape(text.replace(r'\/', '/'))
    yield from re.findall(r'''(?:["'`])([^"'`<>\s;(){}]+)(?:["'`])''', text)
    yield from re.findall(r'''url\(\s*["']?([^\s)'"<>]+)''', text)
    yield from re.findall(r'''(?:https?://(?:www\.)?rzprod\.tn)?/(?:wp-content|wp-includes|assets)/[^\s<>"'`),;]+''', text)
    for value in re.findall(r'''(?:srcset|data-srcset)=["']([^"']+)["']''', text):
        for part in value.split(','):
            if part.strip(): yield part.strip().split()[0]

def resolve(value, source):
    if value.startswith(('data:', '#', 'mailto:', 'tel:', 'javascript:', '//')): return
    try: u = urlsplit(value)
    except ValueError: return
    if u.scheme and (u.scheme not in ('http', 'https') or u.hostname not in ('rzprod.tn', 'www.rzprod.tn')): return
    path = unquote(u.path)
    if not path: return
    path = posixpath.normpath(path.lstrip('/') if path.startswith('/') else posixpath.join(posixpath.dirname(source), path))
    if path in FILES: return path
    if path.rstrip('/') + '/index.html' in FILES: return path.rstrip('/') + '/index.html'
    if path == '.': return 'index.html'
    if path.startswith(('wp-content/', 'wp-includes/', 'assets/')) and Path(path).suffix in TEXT | {'.png','.jpg','.jpeg','.webp','.woff','.woff2','.ttf','.mp4','.gif','.eot'}:
        missing.setdefault(path, set()).add(source)

def audit():
    queue = [k for k in FILES if k.endswith('.html') and not k.startswith(('wp-', 'assets/'))]
    queue += [k for k in FILES if '/' not in k]
    # Elementor's webpack loaders construct these filenames at runtime.
    queue += [k for k in FILES if k.startswith(('wp-content/plugins/elementor/assets/js/', 'wp-content/plugins/elementor-pro/assets/js/')) and k.endswith('.bundle.min.js')]
    queue += [k for k in FILES if k.startswith('wp-content/plugins/elementor/assets/lib/') and (k.endswith('.min.js') or k.endswith('.min.css'))]
    queue += [k for k in FILES if k.startswith('wp-content/plugins/elementor/assets/css/conditionals/') and k.endswith('.min.css') and '-rtl' not in k]
    while queue:
        name = queue.pop()
        if name in keep: continue
        keep.add(name)
        if FILES[name].suffix in TEXT:
            text = FILES[name].read_text(encoding='utf-8', errors='replace')
            for ref in refs(text):
                target = resolve(ref, name)
                if target and target not in keep: queue.append(target)
    report = {'before_files': len(FILES), 'before_bytes':sum(p.stat().st_size for p in FILES.values()),
              'keep_files': len(keep), 'keep_bytes':sum(FILES[k].stat().st_size for k in keep),
              'keep': sorted(keep), 'remove': sorted(set(FILES)-keep),
              'missing': {k:sorted(v) for k,v in missing.items()}}
    (ROOT/'.artifacts').mkdir(exist_ok=True)
    (ROOT/'.artifacts/audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k not in ('keep','remove','missing')}, indent=2))
    print('Missing:', len(missing))
    print('Largest kept:', [(k, FILES[k].stat().st_size) for k in sorted(keep,key=lambda k:FILES[k].stat().st_size,reverse=True)[:25]])

if __name__ == '__main__': audit()
