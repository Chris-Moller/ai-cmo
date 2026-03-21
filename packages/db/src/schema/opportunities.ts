import { pgTable, uuid, varchar, text, real, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  confidence: real('confidence').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
