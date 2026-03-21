import type { Agent } from "./interface.js";

const agents = new Map<string, Agent>();

export function registerAgent(agent: Agent): void {
	agents.set(agent.name, agent);
}

export function getAgent(name: string): Agent | undefined {
	return agents.get(name);
}

export function getAllAgents(): Agent[] {
	return Array.from(agents.values());
}
