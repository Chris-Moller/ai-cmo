import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse redis URL to connection options
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379', 10),
  };
}

export const analysisQueue = new Queue('analysis', {
  connection: parseRedisUrl(redisUrl),
});
