import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const dailyDigests = pgTable("daily_digests", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	date: timestamp("date", { withTimezone: true }).notNull(),
	summary: text("summary").notNull(),
	highlights: jsonb("highlights").notNull().$type<string[]>(),
	agentRunIds: jsonb("agent_run_ids").notNull().$type<string[]>(),
});
