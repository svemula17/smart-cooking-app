import { createApp } from './app';
import { closePool } from './config/database';
import { env } from './config/env';

/**
 * Bootstrap the user-service HTTP server.
 *
 * Handles SIGTERM/SIGINT gracefully so in-flight requests can finish and the
 * pg pool is drained before the process exits.
 */
function startServer(): void {
  const app = createApp();
  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[user-service] listening on :${env.port} (${env.nodeEnv})`);
  });

  function shutdown(signal: NodeJS.Signals): void {
    // eslint-disable-next-line no-console
    console.log(`[user-service] received ${signal}, shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    // Force exit if cleanup hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (require.main === module) {
  startServer();
}
