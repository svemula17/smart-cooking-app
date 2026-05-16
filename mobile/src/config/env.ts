/**
 * Environment configuration for API endpoints.
 *
 * Resolution order:
 *   1. If EXPO_PUBLIC_API_BASE_URL is set → use one gateway URL for all services
 *      (Railway / production: every service lives under one HTTPS host with path prefixes,
 *       OR you have per-service env vars below.)
 *   2. Per-service env vars (EXPO_PUBLIC_USER_API, etc.) → use those.
 *   3. Fallback to dev defaults (LAN IP for real device, localhost for simulator/web).
 *
 * Expo automatically inlines any process.env var prefixed with `EXPO_PUBLIC_`
 * at build time. Set them in a `.env` file at the mobile/ project root.
 *
 * See mobile/.env.example for the variable list.
 */

const DEV_HOST = process.env.EXPO_PUBLIC_DEV_HOST ?? '10.0.0.34';

// Per-service env vars take precedence if provided
const env = {
  user:      process.env.EXPO_PUBLIC_USER_API,
  recipe:    process.env.EXPO_PUBLIC_RECIPE_API,
  shopping:  process.env.EXPO_PUBLIC_SHOPPING_API,
  nutrition: process.env.EXPO_PUBLIC_NUTRITION_API,
  ai:        process.env.EXPO_PUBLIC_AI_API,
  house:     process.env.EXPO_PUBLIC_HOUSE_API,
};

// Single gateway fallback (one HTTPS URL serves all services)
const gateway = process.env.EXPO_PUBLIC_API_BASE_URL;

function resolve(serviceKey: keyof typeof env, devPort: number): string {
  if (env[serviceKey]) return env[serviceKey] as string;
  if (gateway) return gateway;
  return `http://${DEV_HOST}:${devPort}`;
}

export const API_URLS = {
  user:      resolve('user',      4001),
  recipe:    resolve('recipe',    4002),
  nutrition: resolve('nutrition', 4003),
  ai:        resolve('ai',        4004),
  shopping:  resolve('shopping',  4005),
  house:     resolve('house',     4006),
};

// Useful for debug screens
export const ENV_INFO = {
  isProduction: !!(gateway || env.user),
  devHost: DEV_HOST,
  source: gateway ? 'gateway' : env.user ? 'per-service' : 'dev-defaults',
};
