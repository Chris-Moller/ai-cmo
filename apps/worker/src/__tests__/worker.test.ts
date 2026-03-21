import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis before any imports that use it
vi.mock('ioredis', () => {
  const MockIORedis = vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    quit: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
    status: 'ready',
  }));
  return { default: MockIORedis };
});

// Mock bullmq
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation((name: string) => ({
    name,
    add: vi.fn().mockResolvedValue({ id: '1' }),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  Worker: vi.fn().mockImplementation((name: string) => ({
    name,
    close: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  })),
}));

// Mock db
vi.mock('@chief-mog-officer/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'run-1' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock('@chief-mog-officer/db/schema', () => ({
  projects: { id: 'id', status: 'status' },
  agentRuns: { id: 'id' },
  opportunities: {},
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

vi.mock('@chief-mog-officer/config', () => ({
  loadEnv: vi.fn(() => ({
    NODE_ENV: 'test',
    REDIS_URL: 'redis://localhost:6379',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    LOG_LEVEL: 'error',
  })),
}));

vi.mock('@chief-mog-officer/lib', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@chief-mog-officer/agents', () => ({
  getAllAgents: vi.fn(() => [
    { id: 'test-agent', name: 'Test Agent' },
  ]),
  getAgent: vi.fn((id: string) => ({
    id,
    name: 'Test Agent',
    ingest: vi.fn().mockResolvedValue({ dataPoints: 1, sources: [] }),
    analyze: vi.fn().mockResolvedValue({ insights: [], confidence: 0.5 }),
    generateOpportunities: vi.fn().mockResolvedValue([]),
    summarize: vi.fn().mockResolvedValue('summary'),
  })),
}));

describe('Worker module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createQueues', () => {
    it('creates three named queues', async () => {
      const { createQueues } = await import('../queues/index.js');
      const mockConnection = { on: vi.fn(), quit: vi.fn() } as never;

      const queues = createQueues(mockConnection);

      expect(queues.dailyAnalysisQueue).toBeDefined();
      expect(queues.manualAnalysisQueue).toBeDefined();
      expect(queues.agentExecutionQueue).toBeDefined();
    });
  });

  describe('createWorkers', () => {
    it('creates three workers', async () => {
      const { createQueues } = await import('../queues/index.js');
      const { createWorkers } = await import('../workers/index.js');
      const mockConnection = { on: vi.fn(), quit: vi.fn() } as never;

      const queues = createQueues(mockConnection);
      const workers = createWorkers(mockConnection, queues);

      expect(workers).toHaveLength(3);
    });
  });

  describe('setupScheduler', () => {
    it('adds a repeatable job to the daily-analysis queue', async () => {
      const { createQueues } = await import('../queues/index.js');
      const { setupScheduler } = await import('../queues/scheduler.js');
      const mockConnection = { on: vi.fn(), quit: vi.fn() } as never;

      const queues = createQueues(mockConnection);
      await setupScheduler(queues);

      expect(queues.dailyAnalysisQueue.add).toHaveBeenCalledWith(
        'daily-run',
        {},
        { repeat: { pattern: '0 6 * * *' } },
      );
    });
  });

  describe('agentExecutionHandler', () => {
    it('is a function', async () => {
      const { agentExecutionHandler } = await import('../jobs/agent-execution.js');
      expect(typeof agentExecutionHandler).toBe('function');
    });
  });

  describe('dailyAnalysisHandler', () => {
    it('creates a handler function', async () => {
      const { createDailyAnalysisHandler } = await import('../jobs/daily-analysis.js');
      const { createQueues } = await import('../queues/index.js');
      const mockConnection = { on: vi.fn(), quit: vi.fn() } as never;

      const queues = createQueues(mockConnection);
      const handler = createDailyAnalysisHandler(queues);

      expect(typeof handler).toBe('function');
    });
  });

  describe('manualAnalysisHandler', () => {
    it('creates a handler function', async () => {
      const { createManualAnalysisHandler } = await import('../jobs/manual-analysis.js');
      const { createQueues } = await import('../queues/index.js');
      const mockConnection = { on: vi.fn(), quit: vi.fn() } as never;

      const queues = createQueues(mockConnection);
      const handler = createManualAnalysisHandler(queues);

      expect(typeof handler).toBe('function');
    });
  });
});
