import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', 'site');
const port = Number(process.env.PORT || 4173);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webm', 'video/webm'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
]);

function safeFilePath(urlPath) {
  const pathname = decodeURIComponent((urlPath || '/').split('?')[0]);
  const normalized = pathname === '/' ? '/index.html' : pathname;
  const target = path.normalize(path.join(rootDir, normalized));
  if (!target.startsWith(rootDir)) {
    return null;
  }
  return target;
}

const server = http.createServer(async (request, response) => {
  const resolved = safeFilePath(request.url);
  if (!resolved) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  let filePath = resolved;
  try {
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    if (!path.extname(filePath)) {
      filePath = `${filePath}.html`;
    }
  }

  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Content-Type': mimeTypes.get(ext) || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`FatCat Guardian site preview: http://localhost:${port}`);
});
