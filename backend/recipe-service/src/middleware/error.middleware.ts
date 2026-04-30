import type { NextFunction, Request, Response } from 'express';
import type { ApiError } from '../types';

/** HTTP error with stable code, status, and optional structured details. */
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

export const Errors = {
  validationError: (details: unknown) =>
    new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details),
  unauthorized: (msg = 'Authentication required') =>
    new AppError(401, 'UNAUTHORIZED', msg),
  invalidToken: (msg = 'Token is invalid or expired') =>
    new AppError(403, 'INVALID_TOKEN', msg),
  forbidden: (msg = 'Forbidden') =>
    new AppError(403, 'FORBIDDEN', msg),
  notFound: (msg = 'Resource not found') =>
    new AppError(404, 'NOT_FOUND', msg),
  conflict: (msg = 'Conflict') =>
    new AppError(409, 'CONFLICT', msg),
  alreadyRated: () =>
    new AppError(409, 'ALREADY_RATED', 'You have already rated this recipe'),
};

export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiError = {
    success: false,
    error: { message: 'Route not found', code: 'NOT_FOUND' },
  };
  res.status(404).json(body);
}

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
      error: { message: 'Duplicate entry', code: 'CONFLICT' },
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
  console.error('[recipe-service] unhandled error:', err);
  const body: ApiError = {
    success: false,
    error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
  };
  res.status(500).json(body);
}
