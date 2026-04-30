/**
 * Jest setup — runs before each test file. Sets test-mode env vars so the
 * service skips rate-limiting and uses deterministic JWT secrets.
 *
 * Tests assume a local Postgres reachable via DATABASE_URL with the schema
 * already migrated. Each test file isolates its data with random emails and
 * cleans up after itself.
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-for-jest-runs-only';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-for-jest-runs-only';
process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? '15m';
process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? '4';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://saikumarvemula@localhost:5432/smart_cooking_app';
