import type { ErrorHandler } from 'hono';
import { AppError, createLogger } from '@mog/lib';

const logger = createLogger('error-handler');

export const errorHandler: ErrorHandler = (err, c) => {
  logger.error({ err: err.message }, 'Request error');

  if (err instanceof AppError) {
    return c.json(
      { error: { message: err.message, code: err.code, status: err.status } },
      err.status as 400 | 404 | 500,
    );
  }

  return c.json(
    { error: { message: 'Internal server error', code: 'INTERNAL_ERROR', status: 500 } },
    500,
  );
};
