// Local test server that behaves like the live static host: gzip for text, long cache for hashed assets, folder index, 404.html with 404 status.
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib";
const root = path.resolve(process.argv[2] || "dist"); const port = +(process.argv[3] || 8090);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };
const gz = new Set([".html", ".js", ".css", ".svg", ".json", ".txt", ".xml", ".webmanifest"]);
function send(req, res, file, status) {
  const ext = path.extname(file); const buf = fs.readFileSync(file);
  const h = { "Content-Type": types[ext] || "application/octet-stream" };
  if (file.includes(path.sep + "assets" + path.sep) || ext === ".woff2") h["Cache-Control"] = "public, max-age=31536000, immutable";
  if (gz.has(ext) && /gzip/.test(req.headers["accept-encoding"] || "")) { h["Content-Encoding"] = "gzip"; h.Vary = "Accept-Encoding"; res.writeHead(status, h); return res.end(zlib.gzipSync(buf, { level: 9 })); }
  res.writeHead(status, h); res.end(buf);
}
http.createServer((req, res) => {
  const url = new URL(req.url, "http://x"); let p = path.join(root, decodeURIComponent(url.pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) { if (!url.pathname.endsWith("/")) { res.writeHead(301, { Location: url.pathname + "/" + url.search }); return res.end(); } p = path.join(p, "index.html"); }
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return send(req, res, p, 200);
  send(req, res, path.join(root, "404.html"), 404);
}).listen(port, () => console.log("up " + port));
