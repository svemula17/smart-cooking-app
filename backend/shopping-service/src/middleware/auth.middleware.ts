import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthPayload } from '../types';
import { Errors } from './error.middleware';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(Errors.unauthorized());
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    if (payload.type !== 'access') {
      return next(Errors.unauthorized('Invalid token type'));
    }
    req.user = payload;
    next();
  } catch {
    next(Errors.unauthorized('Invalid or expired token'));
  }
}
