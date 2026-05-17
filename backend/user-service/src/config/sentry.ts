import * as Sentry from '@sentry/node';
import { env } from './env';

/**
 * Initialize Sentry crash reporting for this service.
 *
 * MUST be called before importing/loading any other application code so that
 * @sentry/node can patch http, express, and pg modules before they're used.
 *
 * We share one Sentry project across all 6 backend services + the mobile app.
 * Events are tagged with `serverName` so the dashboard can filter per-service.
 *
 * Hardcoded DSN is intentional — it's a public, write-only ingest token.
 */
const SENTRY_DSN =
  'https://7e23c244e58c91bb1d45c60d7098997d@o4511403615387648.ingest.us.sentry.io/4511403620433920';

Sentry.init({
  dsn: SENTRY_DSN,
  serverName: 'user-service',
  environment: env.isProd ? 'production' : env.isTest ? 'test' : 'development',
  // Disable in test runs so Jest doesn't ship spurious events.
  enabled: !env.isTest,
  // Sample 10% of transactions for performance monitoring (free-tier friendly).
  tracesSampleRate: 0.1,
});

export { Sentry };
