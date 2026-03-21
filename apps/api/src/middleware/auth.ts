import { createMiddleware } from 'hono/factory';
import { createLogger } from '@mog/lib';

const logger = createLogger('auth');

export const authMiddleware = createMiddleware(async (c, next) => {
  // TODO: Implement actual auth (JWT/session)
  logger.info('auth: skip');
  c.set('userId', 'demo-user-id');
  await next();
});
