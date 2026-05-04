import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function optionalNum(name: string, fallback: number): number {
  const val = process.env[name];
  return val ? parseInt(val, 10) : fallback;
}

export const env = {
  port: optionalNum('PORT', 3003),
  nodeEnv: optional('NODE_ENV', 'development'),
  isTest: optional('NODE_ENV', 'development') === 'test',

  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),

  redisUrl: optional('REDIS_URL', 'redis://localhost:6379'),

  instacartApiKey: optional('INSTACART_API_KEY', ''),
  walmartClientId: optional('WALMART_CLIENT_ID', ''),
  walmartClientSecret: optional('WALMART_CLIENT_SECRET', ''),
  googlePlacesApiKey: optional('GOOGLE_PLACES_API_KEY', ''),

  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:3000'),
  rateLimitWindowMs: optionalNum('RATE_LIMIT_WINDOW_MS', 900_000),
  rateLimitMax: optionalNum('RATE_LIMIT_MAX', 100),
} as const;
