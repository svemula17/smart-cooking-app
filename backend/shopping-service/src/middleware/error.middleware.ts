import { NextFunction, Request, Response } from 'express';
import type { ApiError } from '../types';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const Errors = {
  notFound: (resource = 'Resource') =>
    new AppError(404, 'NOT_FOUND', `${resource} not found`),

  unauthorized: (msg = 'Authentication required') =>
    new AppError(401, 'UNAUTHORIZED', msg),

  forbidden: (msg = 'Insufficient permissions') =>
    new AppError(403, 'FORBIDDEN', msg),

  badRequest: (msg: string, details?: unknown) =>
    new AppError(400, 'BAD_REQUEST', msg, details),

  validation: (details: unknown) =>
    new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details),

  conflict: (msg: string, code = 'CONFLICT') =>
    new AppError(409, code, msg),

  internal: (msg = 'Internal server error') =>
    new AppError(500, 'INTERNAL_ERROR', msg),
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
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

  console.error('[shopping-service] unhandled error:', err);
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
