import type { NextFunction, Request, Response } from 'express';
import type { PaginationParams } from '../types';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse `?page=&limit=` from the query string into `req.pagination`.
 *
 * - page defaults to 1 (clamped to >= 1)
 * - limit defaults to 20, capped at 100
 * - non-numeric values fall back to defaults rather than 400ing
 */
export function pagination(req: Request, _res: Response, next: NextFunction): void {
  const pageRaw = Number(req.query.page);
  const limitRaw = Number(req.query.limit);

  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw >= 1
    ? Math.min(Math.floor(limitRaw), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const params: PaginationParams = { page, limit, offset: (page - 1) * limit };
  req.pagination = params;
  next();
}
