import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from './database.ts';
import { createPostgresRepository } from './postgres-repository.ts';
import { createProductionApp } from './production-app.ts';

const currentDir = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 5173);
const staticDir = process.env.STATIC_DIR ?? resolve(currentDir, '../dist');
const repo = createPostgresRepository(getPool());
const app = createProductionApp({ repo, staticDir });

const server = createServer((req, res) => {
  void app(req, res).catch((error) => {
    console.error(error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error');
      return;
    }

    res.destroy(error);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`OncoCare listening on http://0.0.0.0:${port}`);
});
