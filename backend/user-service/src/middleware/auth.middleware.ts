import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { HttpError } from './error.middleware';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/**
 * Require a valid `Bearer <access-token>` header. Populates `req.userId`.
 * Throws 401 on missing/invalid/expired token.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'unauthorized', 'Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token, 'access');
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, 'unauthorized', 'Invalid or expired access token'));
  }
}
