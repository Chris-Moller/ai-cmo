import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const opportunities = pgTable('opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull(),
  agentId: varchar('agent_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('new'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('opportunities_project_id_idx').on(table.projectId),
  index('opportunities_status_idx').on(table.status),
]);
