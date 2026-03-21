import type { Agent } from './interface.js';
import { searchMogAgent } from './search-mog.js';
import { geoAgent } from './geo.js';
import { redditMogAgent } from './reddit-mog.js';
import { competitorIntelAgent } from './competitor-intel.js';
import { contentFoundryAgent } from './content-foundry.js';

const agentMap = new Map<string, Agent>([
  [searchMogAgent.id, searchMogAgent],
  [geoAgent.id, geoAgent],
  [redditMogAgent.id, redditMogAgent],
  [competitorIntelAgent.id, competitorIntelAgent],
  [contentFoundryAgent.id, contentFoundryAgent],
]);

export function getAgent(id: string): Agent | undefined {
  return agentMap.get(id);
}

export function getAllAgents(): Agent[] {
  return Array.from(agentMap.values());
}
