import type { Job } from 'bullmq';
import { db } from '@chief-mog-officer/db';
import { agentRuns, opportunities, projects } from '@chief-mog-officer/db/schema';
import { eq } from 'drizzle-orm';
import { getAgent } from '@chief-mog-officer/agents';
import { logger } from '@chief-mog-officer/lib';

interface AgentExecutionData {
  projectId: string;
  agentId: string;
  runId: string;
}

export async function agentExecutionHandler(job: Job<AgentExecutionData>): Promise<void> {
  const { projectId, agentId, runId } = job.data;
  logger.info({ projectId, agentId, runId }, 'Starting agent execution');

  // Update status to running
  await db
    .update(agentRuns)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(agentRuns.id, runId));

  try {
    const agent = getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Get project for context
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const context = { projectId, project };

    // Run agent pipeline
    await agent.ingest(context);
    await agent.analyze(context);
    const generatedOpportunities = await agent.generateOpportunities(context);

    // Store opportunities in DB
    if (generatedOpportunities.length > 0) {
      await db.insert(opportunities).values(
        generatedOpportunities.map((opp) => ({
          projectId: opp.projectId,
          agentId: opp.agentId,
          type: opp.type,
          title: opp.title,
          description: opp.description,
          confidence: opp.confidence,
          status: opp.status,
          metadata: opp.metadata,
        })),
      );
    }

    // Update status to completed
    await db
      .update(agentRuns)
      .set({
        status: 'completed',
        completedAt: new Date(),
        result: { opportunitiesGenerated: generatedOpportunities.length },
      })
      .where(eq(agentRuns.id, runId));

    logger.info(
      { projectId, agentId, runId, opportunities: generatedOpportunities.length },
      'Agent execution completed',
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await db
      .update(agentRuns)
      .set({
        status: 'failed',
        completedAt: new Date(),
        error: errorMessage,
      })
      .where(eq(agentRuns.id, runId));

    logger.error({ projectId, agentId, runId, error: errorMessage }, 'Agent execution failed');
    throw error;
  }
}
