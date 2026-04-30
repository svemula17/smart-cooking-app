import 'dotenv/config';

/**
 * Centralized, validated environment configuration.
 *
 * Required variables throw at startup so the process fails fast rather than
 * producing confusing runtime errors later.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`Env var ${name} must be a number`);
  return n;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  port: optionalNumber('PORT', 3001),

  databaseUrl: required('DATABASE_URL'),

  jwtSecret: required('JWT_SECRET'),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? required('JWT_SECRET'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',

  corsOrigin: process.env.CORS_ORIGIN ?? '*',

  rateLimitWindowMs: optionalNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  rateLimitMax: optionalNumber('RATE_LIMIT_MAX', 100),

  bcryptRounds: optionalNumber('BCRYPT_ROUNDS', 10),

  logLevel: process.env.LOG_LEVEL ?? 'info',
} as const;
