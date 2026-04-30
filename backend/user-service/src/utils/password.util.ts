import bcrypt from 'bcrypt';

const ROUNDS = 10;

/**
 * Hash a plaintext password with bcrypt at 10 rounds.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash. Constant-time.
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Validate password strength. Returns null if valid, otherwise a human-readable
 * reason. Rules: 8+ chars, at least one upper, lower, digit, and symbol.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/\d/.test(password)) return 'Password must contain a digit';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a symbol';
  return null;
}
