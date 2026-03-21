import type { ErrorHandler } from 'hono';
import { createLogger } from '@mog/lib';

const logger = createLogger('error-handler');

function isAppError(err: unknown): err is { message: string; code: string; status: number } {
  return (
    err instanceof Error &&
    'code' in err &&
    'status' in err &&
    typeof (err as Record<string, unknown>).code === 'string' &&
    typeof (err as Record<string, unknown>).status === 'number'
  );
}

export const errorHandler: ErrorHandler = (err, c) => {
  logger.error({ err: err.message }, 'Request error');

  if (isAppError(err)) {
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
