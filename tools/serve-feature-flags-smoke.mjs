import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(
  fileURLToPath(new URL('../dist/apps/faith-giving-ui/', import.meta.url))
);
const contentTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const file = resolve(root, `.${url.pathname.replace(/^\/give(?=\/|$)/, '')}`);
  if (file !== root && !file.startsWith(`${root}/`)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const path = extname(file) ? file : resolve(root, 'index.html');
    const body = await readFile(path);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(path)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(48179, '127.0.0.1', () =>
  console.log('Local smoke preview: http://127.0.0.1:48179/give/')
);

process.stdin.on('data', (chunk) => {
  if (chunk.toString().trim() === 'stop') server.close(() => process.stdin.pause());
});
