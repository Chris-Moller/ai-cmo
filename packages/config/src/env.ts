import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://mog:mog@localhost:5432/mogdb'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(process.env);
