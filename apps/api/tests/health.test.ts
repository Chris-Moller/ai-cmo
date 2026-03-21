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

import './setup-mocks';
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
