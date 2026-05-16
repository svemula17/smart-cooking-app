import { Pool, PoolClient } from 'pg';
import { env } from './env';

/**
 * Shared PostgreSQL connection pool.
 *
 * All queries should go through this pool — never instantiate ad-hoc Clients.
 * For multi-statement work, wrap callers in `withTransaction` so BEGIN/COMMIT/
 * ROLLBACK is handled correctly even on thrown errors.
 */
/**
 * Enable TLS for managed Postgres providers (Supabase/Neon/RDS/Railway).
 * node-postgres does not auto-negotiate SSL — we have to opt in. We respect
 * an explicit `sslmode=` in the URL when present; otherwise we enable TLS
 * for known managed providers and leave it disabled for local dev hosts.
 */
function sslConfig(dsn: string) {
  if (/sslmode=/.test(dsn)) return undefined; // pg parses it from the URL
  const managed = /supabase|amazonaws|neon\.tech|render\.com|railway/i;
  return managed.test(dsn) ? { rejectUnauthorized: false } : false;
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: sslConfig(env.databaseUrl),
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[pg pool] unexpected error on idle client', err);
});

/**
 * Run `fn` inside a transaction. The client is released even if `fn` throws.
 *
 * @example
 *   await withTransaction(async (client) => {
 *     await client.query('INSERT INTO users ...');
 *     await client.query('INSERT INTO user_preferences ...');
 *   });
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/** Closes the pool. Useful in tests and graceful shutdown. */
export async function closePool(): Promise<void> {
  await pool.end();
}
