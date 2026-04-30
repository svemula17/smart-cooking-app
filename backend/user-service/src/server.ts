import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';

import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';

const logger = pino({ base: { service: 'user-service' }, level: process.env.LOG_LEVEL ?? 'info' });
const app = express();
const PORT = Number(process.env.USER_SERVICE_PORT ?? process.env.PORT ?? 4001);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
app.use(express.json({ limit: '256kb' }));
// pino + pino-http have a stale type mismatch; cast through unknown.
app.use(pinoHttp({ logger } as unknown as Parameters<typeof pinoHttp>[0]));

// 100 requests / 15 min / IP across the whole service.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'rate_limited', message: 'Too many requests, please try again later' },
  }),
);

/**
 * @route GET /health
 * @returns 200 { status, service, timestamp }
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(PORT, () => logger.info(`user-service listening on :${PORT}`));
}

export { app };
