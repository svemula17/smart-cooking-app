import bcrypt from 'bcrypt';
import { env } from '../config/env';

/**
 * Hash a plaintext password with bcrypt.
 *
 * Uses `BCRYPT_ROUNDS` from env (default 10). Always returns a fresh hash
 * with a unique salt — never reuse a hash across users.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, env.bcryptRounds);
}

/**
 * Constant-time comparison of a plaintext password against a stored hash.
 */
export async function comparePassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Validate password complexity. Returns null if valid, otherwise a message.
 *
 * Rules: min 8 characters, at least one uppercase letter, one digit, and
 * one special character. (Whitespace counts as a character but not as
 * a letter/digit/special.)
 */
export function validatePasswordStrength(password: string): string | null {
  if (typeof password !== 'string') return 'Password must be a string';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
}
