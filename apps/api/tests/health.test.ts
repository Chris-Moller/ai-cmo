import { describe, it, expect, vi } from 'vitest';

// Mock @mog/db to avoid real DB connection
vi.mock('@mog/db', () => ({
  db: {
    execute: vi.fn().mockRejectedValue(new Error('No DB')),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

// Mock @mog/db/schema
vi.mock('@mog/db/schema', () => ({
  projects: {
    id: 'id',
    name: 'name',
    description: 'description',
    status: 'status',
    userId: 'user_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  opportunities: {
    id: 'id',
    projectId: 'project_id',
    agentId: 'agent_id',
    title: 'title',
    description: 'description',
    category: 'category',
    priority: 'priority',
    status: 'status',
    metadata: 'metadata',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
}));

// Mock @mog/lib
vi.mock('@mog/lib', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
  AppError: class AppError extends Error {
    code: string;
    status: number;
    constructor(message: string, code: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  },
  NotFoundError: class NotFoundError extends Error {
    code = 'NOT_FOUND';
    status = 404;
    constructor(message = 'Resource not found') {
      super(message);
    }
  },
  ValidationError: class ValidationError extends Error {
    code = 'VALIDATION_ERROR';
    status = 400;
    constructor(message = 'Validation failed') {
      super(message);
    }
  },
}));

// Mock @mog/config
vi.mock('@mog/config', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
    REDIS_URL: 'redis://localhost:6379',
    PORT: 3001,
    NODE_ENV: 'test',
    LOG_LEVEL: 'info',
  },
}));

// Mock BullMQ
vi.mock('bullmq', () => {
  const rejectedPromise = Promise.reject(new Error('No Redis'));
  rejectedPromise.catch(() => {}); // prevent unhandled rejection
  return {
    Queue: vi.fn().mockImplementation(() => ({
      add: vi.fn().mockResolvedValue({ id: 'test-job-id' }),
      client: rejectedPromise,
    })),
  };
});

import { app } from '../src/app';

describe('Health Route', () => {
  it('GET /health returns ok status', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('db');
    expect(body).toHaveProperty('redis');
  });

  it('GET /health reports disconnected when services are unavailable', async () => {
    const res = await app.request('/health');
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe('disconnected');
    expect(body.redis).toBe('disconnected');
  });
});
