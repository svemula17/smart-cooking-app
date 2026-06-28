/**
 * Jest setup for house-service. Assumes a local Postgres reachable via
 * DATABASE_URL with the house schema migrated (migrations 022–039).
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-for-jest-runs-only';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://saikumarvemula@localhost:5432/smart_cooking_app';
