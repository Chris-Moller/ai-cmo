import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { projectStatusEnum } from "./enums.js";
import { users } from "./users.js";

export const projects = pgTable("projects", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
	companyProfileId: uuid("company_profile_id"),
	status: projectStatusEnum("status").notNull().default("active"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
