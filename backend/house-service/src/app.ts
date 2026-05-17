import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { houseRouter } from './routes/house.routes';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  // IP-based rate limiter — 100 requests per 15 minutes by default.
  // Tunable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX env vars.
  app.use(
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: {
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMITED',
        },
      },
    }),
  );

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'house-service' }));

  app.use('/houses', houseRouter);

  app.use(notFoundHandler);
  Sentry.setupExpressErrorHandler(app);
  app.use(errorHandler);

  return app;
}
