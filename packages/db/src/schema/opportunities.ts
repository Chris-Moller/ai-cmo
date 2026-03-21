import { pgTable, uuid, text, timestamp, pgEnum, jsonb, real, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const opportunityTypeEnum = pgEnum('opportunity_type', [
  'search',
  'geo',
  'social',
  'competitive',
  'content',
]);

export const opportunityStatusEnum = pgEnum('opportunity_status', [
  'new',
  'reviewed',
  'accepted',
  'dismissed',
]);

export const opportunities = pgTable(
  'opportunities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    agentId: text('agent_id').notNull(),
    type: opportunityTypeEnum('type').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    confidence: real('confidence').notNull(),
    status: opportunityStatusEnum('status').notNull().default('new'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('opportunities_project_id_idx').on(table.projectId),
    index('opportunities_agent_id_idx').on(table.agentId),
  ],
);
