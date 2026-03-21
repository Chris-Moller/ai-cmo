import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const narrativeModels = pgTable("narrative_models", {
	id: uuid("id").primaryKey().defaultRandom(),
	projectId: uuid("project_id").notNull().references(() => projects.id),
	coreNarrative: text("core_narrative").notNull(),
	keyThemes: jsonb("key_themes").notNull().$type<string[]>(),
	voiceAttributes: jsonb("voice_attributes").notNull().$type<string[]>(),
});
