import { pgTable, uuid, text, timestamp, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const agentRunStatusEnum = pgEnum('agent_run_status', [
  'pending',
  'running',
  'completed',
  'failed',
]);

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    agentId: text('agent_id').notNull(),
    status: agentRunStatusEnum('status').notNull().default('pending'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    result: jsonb('result').$type<Record<string, unknown>>(),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('agent_runs_project_id_idx').on(table.projectId),
    index('agent_runs_agent_id_idx').on(table.agentId),
  ],
);
