import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();

// Mock @mog/db
vi.mock('@mog/db', () => ({
  db: {
    execute: vi.fn().mockRejectedValue(new Error('No DB')),
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
  },
}));

mockFrom.mockReturnValue({ where: mockWhere });
mockValues.mockReturnValue({ returning: mockReturning });

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

describe('Project Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockValues.mockReturnValue({ returning: mockReturning });
  });

  it('GET /api/projects returns an array of projects', async () => {
    const mockProjects = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Acme Corp Intelligence',
        description: 'Competitive intel for Acme',
        status: 'active',
        userId: 'demo-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    mockFrom.mockResolvedValue(mockProjects);

    const res = await app.request('/api/projects');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toEqual(mockProjects);
  });

  it('POST /api/projects creates a project with valid data', async () => {
    const newProject = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'New Project',
      description: 'A test project',
      status: 'active',
      userId: 'demo-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReturning.mockResolvedValue([newProject]);

    const res = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Project', description: 'A test project' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('New Project');
  });

  it('POST /api/projects returns 400 for invalid data', async () => {
    const res = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/projects/:id returns 404 for non-existent project', async () => {
    mockWhere.mockResolvedValue([]);

    const res = await app.request('/api/projects/123e4567-e89b-12d3-a456-426614174999');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
