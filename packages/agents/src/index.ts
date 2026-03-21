export type {
	Agent,
	AgentContext,
	AnalysisResult,
	IngestResult,
} from "./interface.js";
export { registerAgent, getAgent, getAllAgents } from "./registry.js";

// Import and register all agents
import { registerAgent } from "./registry.js";
import { competitorIntelAgent } from "./agents/competitor-intel.js";
import { contentFoundryAgent } from "./agents/content-foundry.js";
import { geoAgent } from "./agents/geo.js";
import { redditMogAgent } from "./agents/reddit-mog.js";
import { searchMogAgent } from "./agents/search-mog.js";

registerAgent(searchMogAgent);
registerAgent(geoAgent);
registerAgent(redditMogAgent);
registerAgent(competitorIntelAgent);
registerAgent(contentFoundryAgent);
