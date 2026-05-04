import { createApp } from './app';
import { closePool } from './config/database';
import { closeRedis } from './config/redis';
import { env } from './config/env';

function startServer(): void {
  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[shopping-service] listening on :${env.port} (${env.nodeEnv})`);
  });

  function shutdown(signal: NodeJS.Signals): void {
    console.log(`[shopping-service] received ${signal}, shutting down...`);
    server.close(async () => {
      await Promise.all([closePool(), closeRedis()]);
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
