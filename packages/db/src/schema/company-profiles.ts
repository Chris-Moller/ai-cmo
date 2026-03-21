import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const companyProfiles = pgTable("company_profiles", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	name: text("name").notNull(),
	description: text("description").notNull(),
	industry: text("industry").notNull(),
	website: text("website").notNull(),
	positioning: text("positioning").notNull(),
});
