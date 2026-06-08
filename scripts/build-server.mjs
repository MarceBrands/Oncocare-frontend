import { build } from 'esbuild';

await build({
  entryPoints: ['server/production-server.ts', 'server/migrate.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  packages: 'external',
  outdir: 'dist-server',
  outbase: 'server',
});
