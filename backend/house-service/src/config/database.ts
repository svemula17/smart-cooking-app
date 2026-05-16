import { Pool, PoolClient } from 'pg';
import { env } from './env';

/**
 * Enable TLS for managed Postgres providers (Supabase/Neon/RDS/Railway).
 * node-postgres does not auto-negotiate SSL — we have to opt in.
 */
function sslConfig(dsn: string) {
  if (/sslmode=/.test(dsn)) return undefined;
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
  console.error('[pg pool] unexpected error on idle client', err);
});

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

export async function closePool(): Promise<void> {
  await pool.end();
}
