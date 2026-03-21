import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const competitorProfiles = pgTable(
  'competitor_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    name: text('name').notNull(),
    website: text('website'),
    description: text('description'),
    strengths: jsonb('strengths').notNull().$type<string[]>(),
    weaknesses: jsonb('weaknesses').notNull().$type<string[]>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('competitor_profiles_project_id_idx').on(table.projectId)],
);
