import { vi } from 'vitest';

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

// Mock @mog/lib — preserve inheritance chain matching real implementation
vi.mock('@mog/lib', () => {
  class AppError extends Error {
    code: string;
    status: number;
    constructor(message: string, code: string, status: number) {
      super(message);
      this.name = 'AppError';
      this.code = code;
      this.status = status;
    }
  }

  class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
      super(message, 'NOT_FOUND', 404);
      this.name = 'NotFoundError';
    }
  }

  class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
      super(message, 'VALIDATION_ERROR', 400);
      this.name = 'ValidationError';
    }
  }

  return {
    createLogger: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    }),
    AppError,
    NotFoundError,
    ValidationError,
  };
});

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
