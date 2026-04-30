import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import type { ApiError } from '../types';

/**
 * Global IP rate limiter. Defaults to 100 requests per 15 minutes.
 *
 * Tunable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` env vars. Returns
 * a structured ApiError so clients can branch on the `RATE_LIMITED` code.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMITED',
    },
  } satisfies ApiError,
});

/**
 * Stricter limiter for auth endpoints — guards against brute-force login.
 * 20 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    error: {
      message: 'Too many auth attempts, please try again later',
      code: 'RATE_LIMITED',
    },
  } satisfies ApiError,
});
