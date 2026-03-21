import { serve } from '@hono/node-server';
import { app } from './app';
import { createLogger } from '@mog/lib';

const logger = createLogger('api');
const port = parseInt(process.env.PORT || '3001', 10);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  logger.info({ port: info.port }, `API server listening on port ${info.port}`);
});
