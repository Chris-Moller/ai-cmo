import { describe, expect, it } from "vitest";
import * as schema from "../src/schema/index.js";

describe("db schema exports", () => {
	it("exports all table definitions", () => {
		expect(schema.users).toBeDefined();
		expect(schema.projects).toBeDefined();
		expect(schema.companyProfiles).toBeDefined();
		expect(schema.narrativeModels).toBeDefined();
		expect(schema.competitorProfiles).toBeDefined();
		expect(schema.opportunities).toBeDefined();
		expect(schema.assets).toBeDefined();
		expect(schema.campaigns).toBeDefined();
		expect(schema.agentRuns).toBeDefined();
		expect(schema.dailyDigests).toBeDefined();
	});

	it("exports all enum definitions", () => {
		expect(schema.userRoleEnum).toBeDefined();
		expect(schema.projectStatusEnum).toBeDefined();
		expect(schema.opportunityTypeEnum).toBeDefined();
		expect(schema.opportunityPriorityEnum).toBeDefined();
		expect(schema.opportunityStatusEnum).toBeDefined();
		expect(schema.assetTypeEnum).toBeDefined();
		expect(schema.assetStatusEnum).toBeDefined();
		expect(schema.campaignStatusEnum).toBeDefined();
		expect(schema.agentRunStatusEnum).toBeDefined();
	});

	it("has correct table names", () => {
		// Drizzle tables expose a Symbol-keyed name, we verify via the config
		expect((schema.users as any)[Symbol.for("drizzle:Name")]).toBe("users");
		expect((schema.projects as any)[Symbol.for("drizzle:Name")]).toBe("projects");
		expect((schema.opportunities as any)[Symbol.for("drizzle:Name")]).toBe("opportunities");
	});
});
