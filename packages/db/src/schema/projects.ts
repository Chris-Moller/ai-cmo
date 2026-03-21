import { pgTable, uuid, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const projectStatusEnum = pgEnum('project_status', ['active', 'paused', 'archived']);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    companyProfileId: uuid('company_profile_id'),
    status: projectStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('projects_user_id_idx').on(table.userId)],
);
