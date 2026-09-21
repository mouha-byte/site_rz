from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from urllib.parse import urlsplit,unquote
from pathlib import Path
import subprocess,mimetypes,re,functools
ROOT=Path(__file__).resolve().parents[1]
@functools.lru_cache(maxsize=700)
def original(path):
    r=subprocess.run(['git','show','HEAD:'+path],cwd=ROOT,capture_output=True)
    return r.stdout if r.returncode==0 else None
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path=unquote(urlsplit(self.path).path).lstrip('/')
        if '..' in path.split('/') or path.startswith('.'):self.send_error(404);return
        if not path or path.endswith('/'):path+='index.html'
        data=original(path)
        if data is None:self.send_error(404);return
        if path.endswith('.html'):
            s=data.decode('utf-8')
            s=re.sub(r'<script\b[^>]*>.*?</script>',lambda m:'' if 'window.litespeed_ui_events' in m.group() else m.group(),s,flags=re.S)
            s=re.sub(r'<script\b[^>]*>\s*var litespeed_vary=.*?</script>','',s,flags=re.S)
            s=re.sub(r'<script\b[^>]*id="wp-i18n-js-after"[^>]*>.*?</script>','',s,flags=re.S)
            s=re.sub(r'<script\b[^>]*>',lambda m:re.sub(r'\s+type=["\x27]text/javascript["\x27]','',m.group()) if 'litespeed/javascript' in m.group() else m.group(),s)
            matches=re.findall(r'<script\b[^>]*id=["\x27]unlimited-elements-scripts["\x27][^>]*>.*?</script>',s,re.S)
            for match in matches:s=s.replace(match,'')
            loader=(ROOT/'assets/static.js').read_text(encoding='utf-8')
            loader=loader[loader.index('window.rzThemeReady'):loader.index('// A static site')]
            s=s.replace('</body>',''.join(matches)+'<script>'+loader+'</script></body>')
            data=s.encode()
        self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(path)[0] or 'application/octet-stream');self.send_header('Content-Length',len(data));self.end_headers()
        try:self.wfile.write(data)
        except (BrokenPipeError,ConnectionResetError):pass
    def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8082),Handler).serve_forever()
