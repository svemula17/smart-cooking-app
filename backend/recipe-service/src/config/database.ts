import { Pool } from 'pg';
import { env } from './env';

/**
 * Shared connection pool. All queries use this pool with parameterized SQL —
 * never string-concatenate user input.
 */
export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[pg pool] unexpected idle-client error', err);
});

export async function closePool(): Promise<void> {
  await pool.end();
}
