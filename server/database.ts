import pg from 'pg';

const { Pool } = pg;

const defaultDatabaseUrl = 'postgres://oncocare:oncocare@localhost:5432/oncocare';

let pool: pg.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL ?? defaultDatabaseUrl,
    });
  }

  return pool;
}

