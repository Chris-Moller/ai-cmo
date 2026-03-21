import { pgTable, uuid, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';
import { opportunities } from './opportunities.js';

export const assetTypeEnum = pgEnum('asset_type', [
  'blog_post',
  'social_post',
  'email',
  'ad_copy',
  'landing_page',
]);

export const assetStatusEnum = pgEnum('asset_status', ['draft', 'review', 'approved', 'published']);

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    opportunityId: uuid('opportunity_id').references(() => opportunities.id),
    type: assetTypeEnum('type').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    status: assetStatusEnum('status').notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('assets_project_id_idx').on(table.projectId),
    index('assets_opportunity_id_idx').on(table.opportunityId),
  ],
);
