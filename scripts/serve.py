"""Preview static HTML at both / and the GitHub Pages project prefix."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse

DOCS = Path(__file__).resolve().parents[1] / 'docs'
PREFIX = '/white-lab-bind-model'


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DOCS), **kwargs)

    def do_GET(self):
        if self.path == PREFIX or self.path.startswith(PREFIX + '/'):
            self.path = self.path[len(PREFIX):] or '/'
        super().do_GET()

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            body = (DOCS / '404.html').read_bytes()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(body)
        else:
            super().send_error(code, message, explain)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4183)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Local: http://127.0.0.1:{args.port}/', flush=True)
    print(f'Pages path: http://127.0.0.1:{args.port}{PREFIX}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
