import { Hono } from 'hono';
import { db } from '@mog/db';
import { opportunities } from '@mog/db/schema';
import { eq } from 'drizzle-orm';

export const opportunityRoutes = new Hono();

// List opportunities for a project
opportunityRoutes.get('/:id/opportunities', async (c) => {
  const projectId = c.req.param('id');

  const projectOpportunities = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.projectId, projectId));

  return c.json(projectOpportunities);
});
