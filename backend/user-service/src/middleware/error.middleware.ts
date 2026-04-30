import type { Request, Response, NextFunction } from 'express';

/** Lightweight HTTP error class — throw with a status and a stable code. */
export class HttpError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

/**
 * Final error handler. Maps known errors to JSON responses; logs and 500s
 * everything else.
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }

  // pg unique violation
  if (typeof err === 'object' && err && 'code' in err && (err as { code: string }).code === '23505') {
    res.status(409).json({ error: 'conflict', message: 'Resource already exists' });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'internal_error', message: 'Something went wrong' });
}

/** 404 handler for unmatched routes. */
export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({ error: 'not_found' });
}
