import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
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

  port: optionalNumber('PORT', 3002),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),

  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  rateLimitWindowMs: optionalNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  rateLimitMax: optionalNumber('RATE_LIMIT_MAX', 100),

  logLevel: process.env.LOG_LEVEL ?? 'info',
} as const;
