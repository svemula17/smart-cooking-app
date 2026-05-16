import { Pool } from 'pg';
import { env } from './env';

/**
 * Shared connection pool. All queries use this pool with parameterized SQL —
 * never string-concatenate user input.
 */
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
  // eslint-disable-next-line no-console
  console.error('[pg pool] unexpected idle-client error', err);
});

export async function closePool(): Promise<void> {
  await pool.end();
}
