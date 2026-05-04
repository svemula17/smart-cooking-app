import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { shoppingRouter } from './routes/shopping.routes';
import type { ApiError, ApiSuccess } from './types';

/**
 * Build the Express application without binding to a port.
 * Exported so tests can attach supertest directly.
 */
export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '256kb' }));

  app.use(
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => env.isTest,
      message: {
        success: false,
        error: { message: 'Too many requests, please try again later', code: 'RATE_LIMITED' },
      } satisfies ApiError,
    }),
  );

  /**
   * @route GET /health
   */
  app.get('/health', (_req: Request, res: Response) => {
    const body: ApiSuccess<{ status: string; timestamp: string; service: string }> = {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'shopping-service',
      },
    };
    res.status(200).json(body);
  });

  app.use('/shopping', shoppingRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
