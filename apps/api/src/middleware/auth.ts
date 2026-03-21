import type { MiddlewareHandler } from 'hono';

// TODO: Implement JWT validation. For now, this middleware passes through all requests.
// Future implementation should:
// 1. Check for Authorization header (Bearer token)
// 2. Validate JWT signature and expiry
// 3. Attach decoded user to context
export const auth: MiddlewareHandler = async (_c, next) => {
  await next();
};
