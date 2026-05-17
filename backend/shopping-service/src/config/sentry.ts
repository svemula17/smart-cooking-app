import * as Sentry from '@sentry/node';
import { env } from './env';

const SENTRY_DSN =
  'https://7e23c244e58c91bb1d45c60d7098997d@o4511403615387648.ingest.us.sentry.io/4511403620433920';

Sentry.init({
  dsn: SENTRY_DSN,
  serverName: 'shopping-service',
  environment: env.nodeEnv,
  enabled: !env.isTest,
  tracesSampleRate: 0.1,
});

export { Sentry };
