import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { pool } from '../config/database';
import { Errors } from './error.middleware';

interface AccessTokenPayload {
  userId: string;
  email: string;
  type?: string;
}

/**
 * Verify a JWT access token issued by the user-service. Both services share
 * `JWT_SECRET`. Populates `req.user` on success.
 *
 * Tokens are typed with `type: 'access'` — we reject anything that doesn't
 * carry that claim to prevent refresh tokens from being used as access tokens.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header) return next(Errors.unauthorized('Authorization header is required'));
  if (!header.startsWith('Bearer ')) {
    return next(Errors.unauthorized('Authorization header must use Bearer scheme'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) return next(Errors.unauthorized('Bearer token is empty'));

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    if (payload.type && payload.type !== 'access') {
      return next(Errors.invalidToken('Token is not an access token'));
    }
    if (!payload.userId || !payload.email) {
      return next(Errors.invalidToken('Token is missing required claims'));
    }
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    next(Errors.invalidToken());
  }
}

/**
 * Run after `authenticate`. Loads the user's `is_admin` flag from Postgres
 * (single-row, indexed lookup) and forbids non-admin requests.
 */
export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) return next(Errors.unauthorized());
    const { rows } = await pool.query<{ is_admin: boolean }>(
      `SELECT is_admin FROM users WHERE id = $1`,
      [req.user.userId],
    );
    if (!rows[0]) return next(Errors.unauthorized('User no longer exists'));
    if (!rows[0].is_admin) return next(Errors.forbidden('Admin access required'));
    next();
  } catch (err) {
    next(err);
  }
}
