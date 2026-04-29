import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const PORT = Number(process.env.USER_SERVICE_PORT ?? 4001);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'user-service' }));

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.use(errorHandler);

app.listen(PORT, () => logger.info(`user-service listening on :${PORT}`));
