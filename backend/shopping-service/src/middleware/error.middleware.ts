import { NextFunction, Request, Response } from 'express';
import type { ApiError } from '../types';

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const Errors = {
  notFound: (resource = 'Resource') =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),

  unauthorized: (msg = 'Authentication required') =>
    new AppError(msg, 401, 'UNAUTHORIZED'),

  forbidden: (msg = 'Insufficient permissions') =>
    new AppError(msg, 403, 'FORBIDDEN'),

  badRequest: (msg: string, details?: unknown) =>
    new AppError(msg, 400, 'BAD_REQUEST', details),

  validation: (details: unknown) =>
    new AppError('Validation failed', 400, 'VALIDATION_ERROR', details),

  conflict: (msg: string, code = 'CONFLICT') =>
    new AppError(msg, 409, code),

  internal: (msg = 'Internal server error') =>
    new AppError(msg, 500, 'INTERNAL_ERROR'),
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    const body: ApiError = {
      success: false,
      error: { message: err.message, code: err.code, details: err.details },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error('[shopping-service] Unhandled error:', err);
  const body: ApiError = {
    success: false,
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
  };
  res.status(500).json(body);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiError = {
    success: false,
    error: { message: 'Route not found', code: 'NOT_FOUND' },
  };
  res.status(404).json(body);
}
