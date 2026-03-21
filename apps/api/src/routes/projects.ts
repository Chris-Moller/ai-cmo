import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createProjectSchema } from '@mog/types';
import { db } from '@mog/db';
import { projects } from '@mog/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@mog/lib';
import { analysisQueue } from '../lib/queue';
import { randomUUID } from 'crypto';

export const projectRoutes = new Hono();

// List all projects
projectRoutes.get('/', async (c) => {
  const allProjects = await db.select().from(projects);
  return c.json(allProjects);
});

// Create a project
projectRoutes.post('/', zValidator('json', createProjectSchema), async (c) => {
  const data = c.req.valid('json');
  const userId = c.get('userId') || 'demo-user-id';

  const [project] = await db.insert(projects).values({
    name: data.name,
    description: data.description ?? null,
    userId,
  }).returning();

  return c.json(project, 201);
});

// Get single project
projectRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [project] = await db.select().from(projects).where(eq(projects.id, id));

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  return c.json(project);
});

// Trigger analysis
projectRoutes.post('/:id/analyze', async (c) => {
  const id = c.req.param('id');

  // Verify project exists
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const jobId = randomUUID();
  await analysisQueue.add('run-analysis', { projectId: id }, { jobId });

  return c.json({ jobId }, 202);
});
