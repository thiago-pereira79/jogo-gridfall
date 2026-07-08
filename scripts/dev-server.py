from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import contextlib
import socket


ROOT = Path(__file__).resolve().parents[1]
PORT = 5173


class NoCacheStaticHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


class DualStackThreadingHTTPServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        with contextlib.suppress(Exception):
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)

        super().server_bind()


def main():
    server = DualStackThreadingHTTPServer(("::", PORT), NoCacheStaticHandler)
    print(f"Gridfall dev server running at http://localhost:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
