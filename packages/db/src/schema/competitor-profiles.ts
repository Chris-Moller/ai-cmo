import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const competitorProfiles = pgTable("competitor_profiles", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	name: text("name").notNull(),
	website: text("website").notNull(),
	description: text("description").notNull(),
	strengths: jsonb("strengths").notNull().$type<string[]>(),
	weaknesses: jsonb("weaknesses").notNull().$type<string[]>(),
});
