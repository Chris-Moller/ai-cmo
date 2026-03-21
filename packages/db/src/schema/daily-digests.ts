import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const dailyDigests = pgTable(
  'daily_digests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    date: timestamp('date', { withTimezone: true }).notNull(),
    summary: text('summary').notNull(),
    opportunityIds: jsonb('opportunity_ids').notNull().$type<string[]>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('daily_digests_project_id_idx').on(table.projectId)],
);
