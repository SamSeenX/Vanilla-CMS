import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { FileSystemController } from './fs-controller.js';
import { handleApiRoute } from './api-router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CMS_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(CMS_ROOT, 'public');

const targetArg = process.argv[2] || process.cwd();
const fsCtrl = new FileSystemController(targetArg);
const PORT = process.env.PORT || 4321;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

async function serveStaticFile(res, filePath) {
  try {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      await handleApiRoute(req, res, fsCtrl, body);
    });
    return;
  }

  let staticPath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!staticPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  await serveStaticFile(res, staticPath);
});

server.listen(PORT, async () => {
  const isValid = await fsCtrl.validateTarget();
  console.log(`\n⚡ Vanilla-CMS Companion Active: http://localhost:${PORT}`);
  console.log(`📁 Target Directory: ${fsCtrl.targetDir}`);
  if (!isValid) {
    console.warn(`⚠️  Warning: Target does not appear to have 'content/items/' directory.`);
  } else {
    console.log(`✅ Connected to VanillaSSG site content successfully.`);
  }
  console.log(`Press Ctrl+C to stop.\n`);
});
