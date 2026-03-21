import { Hono } from 'hono';
import { sql } from 'drizzle-orm';

export const healthRoutes = new Hono();

healthRoutes.get('/', async (c) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  // Try DB ping
  try {
    const { db } = await import('@mog/db');
    await db.execute(sql`SELECT 1`);
    dbStatus = 'connected';
  } catch {
    // DB not available
  }

  // Try Redis ping
  try {
    const { analysisQueue } = await import('../lib/queue');
    const client = await analysisQueue.client;
    await client.ping();
    redisStatus = 'connected';
  } catch {
    // Redis not available
  }

  return c.json({
    status: 'ok',
    db: dbStatus,
    redis: redisStatus,
  });
});
