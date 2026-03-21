import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { campaignStatusEnum } from "./enums.js";
import { projects } from "./projects.js";

export const campaigns = pgTable("campaigns", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	name: text("name").notNull(),
	description: text("description").notNull(),
	status: campaignStatusEnum("status").notNull().default("draft"),
	opportunityIds: jsonb("opportunity_ids").notNull().$type<string[]>(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
