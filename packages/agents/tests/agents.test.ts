import { describe, expect, it } from "vitest";
import { getAllAgents, getAgent } from "../src/index.js";

describe("agent registry", () => {
	it("has all 5 agents registered", () => {
		const agents = getAllAgents();
		expect(agents).toHaveLength(5);
	});

	it("can retrieve each agent by name", () => {
		const names = ["search-mog", "geo", "reddit-mog", "competitor-intel", "content-foundry"];
		for (const name of names) {
			const agent = getAgent(name);
			expect(agent).toBeDefined();
			expect(agent!.name).toBe(name);
			expect(agent!.description).toBeTruthy();
		}
	});

	it("agents have all required methods", () => {
		const agents = getAllAgents();
		for (const agent of agents) {
			expect(typeof agent.ingest).toBe("function");
			expect(typeof agent.analyze).toBe("function");
			expect(typeof agent.generateOpportunities).toBe("function");
			expect(typeof agent.summarize).toBe("function");
		}
	});

	it("returns undefined for unknown agent", () => {
		expect(getAgent("nonexistent")).toBeUndefined();
	});
});
