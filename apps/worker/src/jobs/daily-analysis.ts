import type { Job } from 'bullmq';
import { db } from '@chief-mog-officer/db';
import { projects } from '@chief-mog-officer/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@chief-mog-officer/lib';
import type { Queues } from '../queues/index.js';

export function createDailyAnalysisHandler(queues: Queues) {
  return async function dailyAnalysisHandler(_job: Job): Promise<void> {
    logger.info('Starting daily analysis run');

    const activeProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.status, 'active'));

    logger.info({ count: activeProjects.length }, 'Found active projects');

    for (const project of activeProjects) {
      await queues.manualAnalysisQueue.add('analyze-project', {
        projectId: project.id,
      });
    }

    logger.info({ count: activeProjects.length }, 'Queued manual-analysis jobs for all active projects');
  };
}
