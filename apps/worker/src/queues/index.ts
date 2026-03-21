import { Queue, type ConnectionOptions } from 'bullmq';

export function createQueues(connection: ConnectionOptions) {
  const defaultJobOptions = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  };

  const dailyAnalysisQueue = new Queue('daily-analysis', {
    connection,
    defaultJobOptions,
  });

  const manualAnalysisQueue = new Queue('manual-analysis', {
    connection,
    defaultJobOptions,
  });

  const agentExecutionQueue = new Queue('agent-execution', {
    connection,
    defaultJobOptions,
  });

  return { dailyAnalysisQueue, manualAnalysisQueue, agentExecutionQueue };
}

export type Queues = ReturnType<typeof createQueues>;
