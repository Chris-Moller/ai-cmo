import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { projects } from './projects.js';

export const narrativeModels = pgTable(
  'narrative_models',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    coreNarrative: text('core_narrative').notNull(),
    themes: jsonb('themes').notNull().$type<string[]>(),
    audience: text('audience'),
    tone: text('tone'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('narrative_models_project_id_idx').on(table.projectId)],
);
