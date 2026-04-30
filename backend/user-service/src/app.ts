import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import type { ApiSuccess } from './types';

/**
 * Build the Express application without binding to a port.
 *
 * Exported so tests can attach `supertest` directly without a real server.
 */
export function createApp(): express.Express {
  const app = express();

  // Trust the first proxy hop (e.g. nginx/ingress) so client IPs are correct
  // for rate-limit and logging purposes.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '256kb' }));
  app.use(globalRateLimiter);

  /**
   * @route GET /health
   * @returns 200 { success, data: { status, timestamp } }
   */
  app.get('/health', (_req: Request, res: Response) => {
    const body: ApiSuccess<{ status: string; timestamp: string }> = {
      success: true,
      data: { status: 'ok', timestamp: new Date().toISOString() },
    };
    res.status(200).json(body);
  });

  app.use('/auth', authRouter);
  app.use('/users', userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
