import { Worker, type ConnectionOptions } from 'bullmq';
import { createDailyAnalysisHandler } from '../jobs/daily-analysis.js';
import { createManualAnalysisHandler } from '../jobs/manual-analysis.js';
import { agentExecutionHandler } from '../jobs/agent-execution.js';
import type { Queues } from '../queues/index.js';

export function createWorkers(connection: ConnectionOptions, queues: Queues): Worker[] {
  const dailyWorker = new Worker('daily-analysis', createDailyAnalysisHandler(queues), {
    connection,
    concurrency: 1,
  });

  const manualWorker = new Worker('manual-analysis', createManualAnalysisHandler(queues), {
    connection,
    concurrency: 5,
  });

  const agentWorker = new Worker('agent-execution', agentExecutionHandler, {
    connection,
    concurrency: 10,
    limiter: { max: 20, duration: 60000 },
  });

  return [dailyWorker, manualWorker, agentWorker];
}
