import * as Sentry from '@sentry/node';
import { env } from './env';

const SENTRY_DSN =
  'https://7e23c244e58c91bb1d45c60d7098997d@o4511403615387648.ingest.us.sentry.io/4511403620433920';

Sentry.init({
  dsn: SENTRY_DSN,
  serverName: 'house-service',
  environment: env.nodeEnv,
  // No isTest flag in house-service env — fine to enable unconditionally;
  // unit tests can set SENTRY_DSN='' via env override to disable.
  enabled: env.nodeEnv !== 'test',
  tracesSampleRate: 0.1,
});

export { Sentry };
