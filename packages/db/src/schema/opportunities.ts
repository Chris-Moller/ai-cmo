import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { opportunityPriorityEnum, opportunityStatusEnum, opportunityTypeEnum } from "./enums.js";
import { projects } from "./projects.js";

export const opportunities = pgTable("opportunities", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	agentId: text("agent_id").notNull(),
	type: opportunityTypeEnum("type").notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	priority: opportunityPriorityEnum("priority").notNull(),
	status: opportunityStatusEnum("status").notNull().default("new"),
	metadata: jsonb("metadata").notNull().$type<Record<string, unknown>>(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
