import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const companyProfiles = pgTable(
  'company_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    name: text('name').notNull(),
    description: text('description'),
    industry: text('industry'),
    website: text('website'),
    positioning: text('positioning'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('company_profiles_project_id_idx').on(table.projectId)],
);
