import { serve } from '@hono/node-server';
import { env } from '@chief-mog-officer/config';
import { logger } from '@chief-mog-officer/lib';
import { app } from './app.js';

const port = env.API_PORT;

serve({ fetch: app.fetch, port }, () => {
  logger.info({ port }, `API server running on port ${port}`);
});
