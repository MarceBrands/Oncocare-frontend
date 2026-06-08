import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import type { ApiRepository } from './repository.ts';
import { createProductionApp } from './production-app.ts';

function createRepo(): ApiRepository {
  return {
    getDashboard: async () => ({
      statsCards: [],
      evolutionData: [],
      treatmentData: [],
      recentPatients: [],
      alerts: [],
    }),
  } as unknown as ApiRepository;
}

async function createStaticDir() {
  const staticDir = await mkdtemp(join(tmpdir(), 'oncocare-static-'));
  await writeFile(join(staticDir, 'index.html'), '<html><body>OncoCare app</body></html>');
  await writeFile(join(staticDir, 'app.js'), 'console.log("oncocare");');
  return staticDir;
}

async function withServer(
  staticDir: string,
  run: (request: (url: string) => Promise<TestResponse>) => Promise<void>
) {
  const app = createProductionApp({ repo: createRepo(), staticDir });
  await run((url) => request(app, url));
}

type TestResponse = {
  status: number;
  headers: Map<string, string>;
  body: string;
};

async function request(
  app: ReturnType<typeof createProductionApp>,
  url: string
): Promise<TestResponse> {
  const req = { method: 'GET', url } as IncomingMessage;
  const headers = new Map<string, string>();
  let body = '';
  const res = {
    statusCode: 200,
    headersSent: false,
    setHeader(name: string, value: number | string | readonly string[]) {
      headers.set(name.toLowerCase(), String(value));
      this.headersSent = true;
    },
    end(value?: string | Buffer) {
      if (value) {
        body = Buffer.isBuffer(value) ? value.toString('utf8') : value;
      }
      this.headersSent = true;
    },
  } as unknown as ServerResponse;

  await app(req, res);

  return {
    status: res.statusCode,
    headers,
    body,
  };
}

test('production app serves API routes with the existing router', async () => {
  const staticDir = await createStaticDir();

  try {
    await withServer(staticDir, async (request) => {
      const response = await request('/api/dashboard');
      const body = JSON.parse(response.body);

      assert.equal(response.status, 200);
      assert.deepEqual(body.statsCards, []);
    });
  } finally {
    await rm(staticDir, { recursive: true, force: true });
  }
});

test('production app serves static assets', async () => {
  const staticDir = await createStaticDir();

  try {
    await withServer(staticDir, async (request) => {
      const response = await request('/app.js');

      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') ?? '', /text\/javascript/);
      assert.equal(response.body, 'console.log("oncocare");');
    });
  } finally {
    await rm(staticDir, { recursive: true, force: true });
  }
});

test('production app falls back to index for SPA routes', async () => {
  const staticDir = await createStaticDir();

  try {
    await withServer(staticDir, async (request) => {
      const response = await request('/pacientes/abc');

      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') ?? '', /text\/html/);
      assert.equal(response.body, '<html><body>OncoCare app</body></html>');
    });
  } finally {
    await rm(staticDir, { recursive: true, force: true });
  }
});
