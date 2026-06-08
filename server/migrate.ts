import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

type MigrationOptions = {
  databaseUrl?: string;
  migrationsDir?: string;
  logger?: Pick<Console, 'log'>;
};

const currentDir = dirname(fileURLToPath(import.meta.url));

export async function runMigrations({
  databaseUrl = process.env.DATABASE_URL,
  migrationsDir = process.env.MIGRATIONS_DIR ?? resolve(currentDir, '../db/migrations'),
  logger = console,
}: MigrationOptions = {}) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await waitForDatabase(pool);
    await pool.query(`
      create table if not exists schema_migrations (
        version text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const version = file.replace(/\.sql$/, '');
      const applied = await pool.query('select 1 from schema_migrations where version = $1', [
        version,
      ]);

      if (applied.rowCount > 0) {
        logger.log(`Skipping ${version}`);
        continue;
      }

      logger.log(`Applying ${version}`);
      await pool.query(await readFile(resolve(migrationsDir, file), 'utf8'));
      await pool.query('insert into schema_migrations (version) values ($1)', [version]);
    }

    logger.log('Migrations complete.');
  } finally {
    await pool.end();
  }
}

async function waitForDatabase(pool: pg.Pool) {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await pool.query('select 1');
      return;
    } catch (error) {
      if (attempt === 30) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runMigrations().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
