import type { NextFunction, Request, Response } from 'express';
import type { ApiError } from '../types';

/**
 * Application error class. Throw with an HTTP status, a stable error code,
 * and a human-readable message. Optional `details` is JSON-serializable
 * extra context (e.g. validation field errors).
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Predefined errors for common cases — keeps codes consistent across handlers. */
export const Errors = {
  validationError: (details: unknown) =>
    new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details),
  invalidCredentials: () =>
    new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'),
  unauthorized: (msg = 'Authentication required') =>
    new AppError(401, 'UNAUTHORIZED', msg),
  invalidToken: (msg = 'Token is invalid or expired') =>
    new AppError(403, 'INVALID_TOKEN', msg),
  notFound: (msg = 'Resource not found') =>
    new AppError(404, 'NOT_FOUND', msg),
  emailExists: () =>
    new AppError(409, 'EMAIL_EXISTS', 'Email already exists'),
  rateLimited: () =>
    new AppError(429, 'RATE_LIMITED', 'Too many requests, please try again later'),
  internal: () =>
    new AppError(500, 'INTERNAL_ERROR', 'An unexpected error occurred'),
};

/** 404 fallback for unmatched routes. */
export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiError = {
    success: false,
    error: { message: 'Route not found', code: 'NOT_FOUND' },
  };
  res.status(404).json(body);
}

/**
 * Final error handler. Maps known errors to structured responses.
 * Anything unrecognized is logged and surfaced as a generic 500.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ApiError = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // pg unique-violation
  if (typeof err === 'object' && err && (err as { code?: string }).code === '23505') {
    const body: ApiError = {
      success: false,
      error: { message: 'Email already exists', code: 'EMAIL_EXISTS' },
    };
    res.status(409).json(body);
    return;
  }

  // jsonwebtoken errors
  const errName = (err as { name?: string })?.name;
  if (errName === 'JsonWebTokenError' || errName === 'TokenExpiredError') {
    const body: ApiError = {
      success: false,
      error: { message: 'Token is invalid or expired', code: 'INVALID_TOKEN' },
    };
    res.status(403).json(body);
    return;
  }

  // eslint-disable-next-line no-console
  console.error('[error.middleware] unhandled error:', err);
  const body: ApiError = {
    success: false,
    error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
  };
  res.status(500).json(body);
}
