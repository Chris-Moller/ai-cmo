import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { agentRunStatusEnum } from "./enums.js";
import { projects } from "./projects.js";

export const agentRuns = pgTable("agent_runs", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	agentName: text("agent_name").notNull(),
	status: agentRunStatusEnum("status").notNull().default("pending"),
	startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	result: jsonb("result").$type<Record<string, unknown>>(),
	error: text("error"),
});
