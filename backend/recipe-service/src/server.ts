import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { recipesRouter } from './routes/recipes';

const logger = pino({ base: { service: 'recipe-service' } });
const app = express();
const PORT = Number(process.env.RECIPE_SERVICE_PORT ?? 4002);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'recipe-service' }));
app.use('/recipes', recipesRouter);

app.listen(PORT, () => logger.info(`recipe-service listening on :${PORT}`));
