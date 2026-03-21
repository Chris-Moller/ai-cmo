import type { ErrorHandler } from 'hono';
import { AppError, logger } from '@chief-mog-officer/lib';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    logger.warn({ err, code: err.code, status: err.status }, 'application error');
    return c.json(
      {
        error: {
          message: err.message,
          code: err.code,
          status: err.status,
        },
      },
      err.status as 400 | 404 | 500,
    );
  }

  logger.error({ err }, 'unhandled error');
  return c.json(
    {
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
      },
    },
    500,
  );
};
