import IORedis from 'ioredis';
import { loadEnv } from '@chief-mog-officer/config';
import { logger } from '@chief-mog-officer/lib';
import { createQueues } from './queues/index.js';
import { setupScheduler } from './queues/scheduler.js';
import { createWorkers } from './workers/index.js';

async function main(): Promise<void> {
  const env = loadEnv();

  logger.info('Starting worker process...');

  const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
  });

  connection.on('connect', () => {
    logger.info('Connected to Redis');
  });

  connection.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  const queues = createQueues(connection);
  await setupScheduler(queues);
  const workers = createWorkers(connection, queues);

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down workers...');
    await Promise.all(workers.map((w) => w.close()));
    await Promise.all([
      queues.dailyAnalysisQueue.close(),
      queues.manualAnalysisQueue.close(),
      queues.agentExecutionQueue.close(),
    ]);
    await connection.quit();
    logger.info('Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  logger.info(
    { workers: workers.length },
    'Worker process started. Waiting for jobs...',
  );
}

main().catch((err) => {
  logger.error({ err }, 'Worker process failed to start');
  process.exit(1);
});
