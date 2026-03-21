import type { Queues } from './index.js';
import { logger } from '@chief-mog-officer/lib';

export async function setupScheduler(queues: Queues): Promise<void> {
  await queues.dailyAnalysisQueue.add(
    'daily-run',
    {},
    {
      repeat: { pattern: '0 6 * * *' }, // 6 AM daily
    },
  );

  logger.info('Scheduler configured: daily-analysis at 0 6 * * *');
}
