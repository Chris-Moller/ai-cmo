import type { Job } from 'bullmq';
import { db } from '@chief-mog-officer/db';
import { agentRuns } from '@chief-mog-officer/db/schema';
import { getAllAgents } from '@chief-mog-officer/agents';
import { logger } from '@chief-mog-officer/lib';
import type { Queues } from '../queues/index.js';

interface ManualAnalysisData {
  projectId: string;
}

export function createManualAnalysisHandler(queues: Queues) {
  return async function manualAnalysisHandler(job: Job<ManualAnalysisData>): Promise<void> {
    const { projectId } = job.data;
    logger.info({ projectId }, 'Starting manual analysis');

    const agents = getAllAgents();

    for (const agent of agents) {
      const [run] = await db
        .insert(agentRuns)
        .values({
          projectId,
          agentId: agent.id,
          status: 'pending',
        })
        .returning();

      await queues.agentExecutionQueue.add('execute-agent', {
        projectId,
        agentId: agent.id,
        runId: run.id,
      });
    }

    logger.info({ projectId, agentCount: agents.length }, 'Queued agent-execution jobs');
  };
}
