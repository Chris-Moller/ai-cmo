import { pgTable, uuid, text, timestamp, real, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const projectStatusEnum = pgEnum('project_status', ['active', 'paused', 'archived']);
export const agentRunStatusEnum = pgEnum('agent_run_status', ['pending', 'running', 'completed', 'failed']);
export const opportunityStatusEnum = pgEnum('opportunity_status', ['new', 'reviewed', 'accepted', 'dismissed']);
export const opportunityTypeEnum = pgEnum('opportunity_type', ['search', 'geo', 'reddit', 'competitor', 'content']);

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull(),
  companyProfileId: uuid('company_profile_id'),
  status: projectStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const agentRuns = pgTable('agent_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  agentId: text('agent_id').notNull(),
  status: agentRunStatusEnum('status').notNull().default('pending'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  result: jsonb('result'),
  error: text('error'),
});

export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  agentId: text('agent_id').notNull(),
  type: opportunityTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  confidence: real('confidence').notNull(),
  status: opportunityStatusEnum('status').notNull().default('new'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
