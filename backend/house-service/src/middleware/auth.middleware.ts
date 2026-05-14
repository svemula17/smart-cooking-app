import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Errors } from './error.middleware';

interface AccessTokenPayload {
  userId: string;
  email: string;
  jti: string;
  type: string;
}

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
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    if (payload.type !== 'access') {
      return next(Errors.invalidToken());
    }
    req.auth = { userId: payload.userId, email: payload.email, jti: payload.jti };
    next();
  } catch {
    next(Errors.invalidToken());
  }
}
