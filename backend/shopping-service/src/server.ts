import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { listsRouter } from './routes/lists';
import { checkoutRouter } from './routes/checkout';

const logger = pino({ base: { service: 'shopping-service' } });
const app = express();
const PORT = Number(process.env.SHOPPING_SERVICE_PORT ?? 4005);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'shopping-service' }));
app.use('/lists', listsRouter);
app.use('/checkout', checkoutRouter);

app.listen(PORT, () => logger.info(`shopping-service listening on :${PORT}`));
