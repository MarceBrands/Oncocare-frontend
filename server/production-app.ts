import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { handleApiRequest } from './api-router.ts';
import type { ApiRepository } from './repository.ts';

type ProductionAppOptions = {
  repo: ApiRepository;
  staticDir: string;
};

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export function createProductionApp({ repo, staticDir }: ProductionAppOptions) {
  const publicRoot = resolve(staticDir);

  return async function productionApp(req: IncomingMessage, res: ServerResponse) {
    if (req.url?.startsWith('/api/')) {
      await handleApiRequest(repo, req, res);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      res.setHeader('allow', 'GET, HEAD');
      res.end('Method Not Allowed');
      return;
    }

    await serveStaticAsset(req, res, publicRoot);
  };
}

async function serveStaticAsset(req: IncomingMessage, res: ServerResponse, publicRoot: string) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const assetPath = resolve(publicRoot, `.${requestedPath}`);

  if (!isInsideDirectory(assetPath, publicRoot)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  const filePath = await resolveExistingFile(assetPath, publicRoot, pathname);

  if (!filePath) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  const body = await readFile(filePath);
  const extension = extname(filePath);
  res.statusCode = 200;
  res.setHeader('content-type', contentTypes[extension] ?? 'application/octet-stream');
  res.setHeader('cache-control', extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable');
  res.end(req.method === 'HEAD' ? undefined : body);
}

async function resolveExistingFile(assetPath: string, publicRoot: string, pathname: string) {
  if (await isFile(assetPath)) {
    return assetPath;
  }

  if (!extname(pathname)) {
    const indexPath = resolve(publicRoot, 'index.html');
    return (await isFile(indexPath)) ? indexPath : null;
  }

  return null;
}

async function isFile(path: string) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function isInsideDirectory(path: string, directory: string) {
  return path === directory || path.startsWith(`${directory}/`);
}
