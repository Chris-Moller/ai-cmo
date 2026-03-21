import type { AgentInterface } from './interface.js';

const agents = new Map<string, AgentInterface>();

export function registerAgent(agent: AgentInterface): void {
  agents.set(agent.name, agent);
}

export function getAgent(name: string): AgentInterface | undefined {
  return agents.get(name);
}

export function getAllAgents(): AgentInterface[] {
  return Array.from(agents.values());
}
