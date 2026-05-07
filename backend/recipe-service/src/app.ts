import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { recipeRouter } from './routes/recipe.routes';
import { mealPlanRouter } from './routes/mealPlan.routes';
import { pantryRouter } from './routes/pantry.routes';
import type { ApiError, ApiSuccess } from './types';

/**
 * Build the Express application without binding to a port — exported so tests
 * can attach `supertest` directly without a real server.
 */
export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '512kb' }));

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
      data: { status: 'ok', timestamp: new Date().toISOString(), service: 'recipe-service' },
    };
    res.status(200).json(body);
  });

  app.use('/recipes', recipeRouter);
  app.use('/meal-plans', mealPlanRouter);
  app.use('/pantry', pantryRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
