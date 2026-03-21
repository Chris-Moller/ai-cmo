import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@chief-mog-officer/db';
import { projects, opportunities } from '@chief-mog-officer/db/schema';
import { NotFoundError, ValidationError } from '@chief-mog-officer/lib';
import { eq, desc } from 'drizzle-orm';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const projectRoutes = new Hono();

// GET /api/projects — list all projects
projectRoutes.get('/', async (c) => {
  const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return c.json(result);
});

// POST /api/projects — create a project
projectRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const [project] = await db
    .insert(projects)
    .values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .returning();

  return c.json(project, 201);
});

// GET /api/projects/:id — get a single project
projectRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const [project] = await db.select().from(projects).where(eq(projects.id, id));

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  return c.json(project);
});

// POST /api/projects/:id/analyze — trigger analysis (stub)
projectRoutes.post('/:id/analyze', async (c) => {
  const projectId = c.req.param('id');

  // Verify project exists
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // In production, this would add a BullMQ job
  return c.json({ message: 'Analysis queued', projectId }, 202);
});

// GET /api/projects/:id/opportunities — list opportunities for a project
projectRoutes.get('/:id/opportunities', async (c) => {
  const projectId = c.req.param('id');
  const result = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.projectId, projectId));

  return c.json(result);
});
