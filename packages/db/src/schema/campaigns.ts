import { pgTable, uuid, text, timestamp, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft',
  'active',
  'paused',
  'completed',
]);

export const campaigns = pgTable(
  'campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    name: text('name').notNull(),
    description: text('description'),
    status: campaignStatusEnum('status').notNull().default('draft'),
    assetIds: jsonb('asset_ids').notNull().$type<string[]>(),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('campaigns_project_id_idx').on(table.projectId)],
);
