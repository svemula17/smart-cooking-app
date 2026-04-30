import { Pool, PoolConfig } from 'pg';

/**
 * PostgreSQL connection pool. Reads `DATABASE_URL` if set, otherwise falls
 * back to discrete `POSTGRES_*` env vars. The pool is shared across the
 * service for the process lifetime.
 */
const config: PoolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      database: process.env.POSTGRES_DB ?? 'smart_cooking_app',
      user: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD,
    };

export const db = new Pool({
  ...config,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

db.on('error', (err) => {
  // Surface idle-client errors; pg won't crash the process by default.
  // eslint-disable-next-line no-console
  console.error('Unexpected pg pool error', err);
});
