import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { houseRouter } from './routes/house.routes';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'house-service' }));

  app.use('/houses', houseRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
