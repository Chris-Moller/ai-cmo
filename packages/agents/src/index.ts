import { registerAgent, getAgent, getAllAgents } from './registry.js';
import { SearchMogAgent } from './stubs/search-mog.js';
import { GeoAgent } from './stubs/geo.js';
import { RedditMogAgent } from './stubs/reddit-mog.js';
import { CompetitorIntelAgent } from './stubs/competitor-intel.js';
import { ContentFoundryAgent } from './stubs/content-foundry.js';

export type { AgentInterface } from './interface.js';
export { registerAgent, getAgent, getAllAgents };
export { SearchMogAgent, GeoAgent, RedditMogAgent, CompetitorIntelAgent, ContentFoundryAgent };

// Register all stub agents at module load time
registerAgent(SearchMogAgent);
registerAgent(GeoAgent);
registerAgent(RedditMogAgent);
registerAgent(CompetitorIntelAgent);
registerAgent(ContentFoundryAgent);
