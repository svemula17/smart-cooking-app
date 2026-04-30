import { createApp } from './app';
import { closePool } from './config/database';
import { env } from './config/env';

function startServer(): void {
  const app = createApp();
  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[recipe-service] listening on :${env.port} (${env.nodeEnv})`);
  });

  function shutdown(signal: NodeJS.Signals): void {
    // eslint-disable-next-line no-console
    console.log(`[recipe-service] received ${signal}, shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (require.main === module) {
  startServer();
}
