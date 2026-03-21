import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "member"]);
export const projectStatusEnum = pgEnum("project_status", ["active", "paused", "archived"]);
export const opportunityTypeEnum = pgEnum("opportunity_type", ["content", "seo", "social", "competitive", "geographic"]);
export const opportunityPriorityEnum = pgEnum("opportunity_priority", ["high", "medium", "low"]);
export const opportunityStatusEnum = pgEnum("opportunity_status", ["new", "reviewed", "actioned", "dismissed"]);
export const assetTypeEnum = pgEnum("asset_type", ["article", "social_post", "report", "brief"]);
export const assetStatusEnum = pgEnum("asset_status", ["draft", "review", "published"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "completed"]);
export const agentRunStatusEnum = pgEnum("agent_run_status", ["pending", "running", "completed", "failed"]);
