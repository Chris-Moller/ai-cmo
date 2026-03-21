import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { assetStatusEnum, assetTypeEnum } from "./enums.js";
import { opportunities } from "./opportunities.js";

export const assets = pgTable("assets", {
	id: uuid("id").primaryKey().defaultRandom(),
	opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id),
	type: assetTypeEnum("type").notNull(),
	content: text("content").notNull(),
	status: assetStatusEnum("status").notNull().default("draft"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
