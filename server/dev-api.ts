import type { Plugin } from 'vite';
import { handleApiRequest } from './api-router';
import { getPool } from './database';
import { createPostgresRepository } from './postgres-repository';

export function devApiPlugin(): Plugin {
  return {
    name: 'oncocare-dev-api',
    configureServer(server) {
      const repo = createPostgresRepository(getPool());

      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          next();
          return;
        }

        void handleApiRequest(repo, req, res);
      });
    },
  };
}
