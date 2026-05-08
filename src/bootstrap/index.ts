import { env } from '../shared/core/config.js';
import { buildServer } from './server.js';

const server = await buildServer();

const start = async () => {
  try {
    await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

signals.forEach((signal) => {
  process.on(signal, async () => {
    server.log.info(`Closing server on signal: ${signal}`);
    try {
      await server.close();
      server.log.info('Server closed successfully.');
      process.exit(0);
    } catch (err) {
      server.log.error(err as Error, 'Error during shutdown');
      process.exit(1);
    }
  });
});

start();
