import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { Errors } from './error.middleware';

/**
 * Authenticate a request via the `Authorization: Bearer <token>` header.
 *
 * On success, attaches `req.auth = { userId, email, jti }`.
 * On failure (missing/malformed/invalid/expired token), throws 401/403.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header) {
    return next(Errors.unauthorized('Authorization header is required'));
  }
  if (!header.startsWith('Bearer ')) {
    return next(Errors.unauthorized('Authorization header must use Bearer scheme'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(Errors.unauthorized('Bearer token is empty'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.userId, email: payload.email, jti: payload.jti };
    next();
  } catch {
    next(Errors.invalidToken());
  }
}
