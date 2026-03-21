# Agent Interface

## Overview

Agents are the intelligence layer of the Chief MOG Officer platform. Each agent collects data from a specific domain, analyzes it, and surfaces actionable opportunities. All agents implement the same `AgentInterface` contract, allowing the system to orchestrate them uniformly.

## The AgentInterface Contract

Defined in `packages/agents/src/interface.ts`:

```typescript
import type { IngestResult, AnalysisResult, Opportunity } from '@cmo/types';

export interface AgentInterface {
  /** Unique identifier for this agent */
  name: string;
  /** Human-readable description */
  description: string;
  /** Collect raw data from external sources */
  ingest(projectId: string): Promise<IngestResult>;
  /** Analyze ingested data and produce insights */
  analyze(projectId: string): Promise<AnalysisResult>;
  /** Generate actionable opportunities from analysis */
  generateOpportunities(projectId: string): Promise<Opportunity[]>;
  /** Produce a text summary of findings */
  summarize(projectId: string): Promise<string>;
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Unique identifier used to register and retrieve the agent (e.g., `'search-mog'`) |
| `description` | `string` | Human-readable description shown in the UI and logs |

### Methods

All methods receive a `projectId` parameter identifying the project being analyzed.

| Method | Returns | Purpose |
|--------|---------|---------|
| `ingest` | `Promise<IngestResult>` | Collect raw data from external sources (APIs, scrapers, databases) |
| `analyze` | `Promise<AnalysisResult>` | Process ingested data to extract insights |
| `generateOpportunities` | `Promise<Opportunity[]>` | Convert insights into concrete, actionable opportunities |
| `summarize` | `Promise<string>` | Produce a human-readable text summary of findings |

## Agent Lifecycle

Agents are executed in a strict sequence by the worker:

```
┌─────────┐    ┌─────────┐    ┌────────────────────┐    ┌───────────┐
│ ingest  │───►│ analyze │───►│ generateOpportuni- │───►│ summarize │
│         │    │         │    │ ties               │    │           │
└─────────┘    └─────────┘    └────────────────────┘    └───────────┘
     │              │                   │                      │
     ▼              ▼                   ▼                      ▼
 IngestResult  AnalysisResult    Opportunity[]             string
```

1. **Ingest** — The agent connects to its data sources and collects raw data. Returns metadata about what was collected (source count, data size).

2. **Analyze** — The agent processes the ingested data to extract patterns and insights. Returns a list of insight strings and a confidence score.

3. **Generate Opportunities** — The agent converts its analysis into concrete `Opportunity` objects that users can act on. Each opportunity has a type, priority, title, and description.

4. **Summarize** — The agent produces a human-readable text summary of its findings for display in digests and notifications.

## Agent Registry

The registry (`packages/agents/src/registry.ts`) provides a central place to register and retrieve agents:

```typescript
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
```

### How Registration Works

All 5 built-in agents are auto-registered when the `@cmo/agents` package is imported. This happens in `packages/agents/src/index.ts`:

```typescript
import { registerAgent } from './registry.js';
import { SearchMogAgent } from './stubs/search-mog.js';
import { GeoAgent } from './stubs/geo.js';
import { RedditMogAgent } from './stubs/reddit-mog.js';
import { CompetitorIntelAgent } from './stubs/competitor-intel.js';
import { ContentFoundryAgent } from './stubs/content-foundry.js';

registerAgent(SearchMogAgent);
registerAgent(GeoAgent);
registerAgent(RedditMogAgent);
registerAgent(CompetitorIntelAgent);
registerAgent(ContentFoundryAgent);
```

### Using the Registry

```typescript
import { getAgent, getAllAgents } from '@cmo/agents';

// Get a specific agent
const searchAgent = getAgent('search-mog');
if (searchAgent) {
  const result = await searchAgent.ingest('project-123');
}

// Iterate all registered agents
const agents = getAllAgents();
for (const agent of agents) {
  console.log(`Running ${agent.name}: ${agent.description}`);
  const opportunities = await agent.generateOpportunities('project-123');
}
```

## How the Worker Executes Agents

The worker (`apps/worker`) processes analysis jobs by iterating over all registered agents:

```typescript
import { getAllAgents } from '@cmo/agents';

async function processAnalysisJob(projectId: string) {
  const agents = getAllAgents();

  for (const agent of agents) {
    // Record agent run start
    const run = await createAgentRun(projectId, agent.name, 'running');

    try {
      // Execute the agent lifecycle
      await agent.ingest(projectId);
      const analysis = await agent.analyze(projectId);
      const opportunities = await agent.generateOpportunities(projectId);
      const summary = await agent.summarize(projectId);

      // Persist results
      await saveOpportunities(opportunities);
      await updateAgentRun(run.id, 'completed', summary);
    } catch (error) {
      await updateAgentRun(run.id, 'failed', null, error.message);
    }
  }
}
```

## Built-in Stub Agents

The platform ships with 5 stub agents that return mock data. These are placeholders for real implementations.

| Agent | Name | Type | Description |
|-------|------|------|-------------|
| `SearchMogAgent` | `search-mog` | `seo` | Analyzes search trends and SEO opportunities |
| `GeoAgent` | `geo` | `local` | Geographic and local market intelligence |
| `RedditMogAgent` | `reddit-mog` | `social`, `content` | Reddit sentiment and discussion analysis |
| `CompetitorIntelAgent` | `competitor-intel` | `competitive` | Monitors competitor activities and positioning |
| `ContentFoundryAgent` | `content-foundry` | `content` | Identifies content gaps and creation opportunities |

## Creating a New Agent

### Step 1: Create the Agent File

Create a new file in `packages/agents/src/stubs/` (or a dedicated directory for production agents):

```typescript
// packages/agents/src/stubs/my-agent.ts
import type { IngestResult, AnalysisResult, Opportunity } from '@cmo/types';
import type { AgentInterface } from '../interface.js';

export const MyAgent: AgentInterface = {
  name: 'my-agent',
  description: 'Description of what this agent does',

  async ingest(projectId: string): Promise<IngestResult> {
    // Connect to your data source and collect data
    return {
      sourceCount: 10,
      rawDataSize: 512,
      metadata: { source: 'my-data-source' },
    };
  },

  async analyze(projectId: string): Promise<AnalysisResult> {
    // Process collected data into insights
    return {
      insights: ['Key finding from analysis'],
      confidence: 0.80,
      metadata: {},
    };
  },

  async generateOpportunities(projectId: string): Promise<Opportunity[]> {
    const now = new Date();
    return [
      {
        id: 'opp-my-agent-001',
        projectId,
        agentName: 'my-agent',
        type: 'content',
        title: 'Opportunity title',
        description: 'Detailed description of the opportunity',
        source: 'my-data-source',
        priority: 'medium',
        status: 'new',
        createdAt: now,
        updatedAt: now,
      },
    ];
  },

  async summarize(projectId: string): Promise<string> {
    return 'Summary of findings from the analysis.';
  },
};
```

### Step 2: Export from Index

Add the export and registration to `packages/agents/src/index.ts`:

```typescript
import { MyAgent } from './stubs/my-agent.js';

export { MyAgent };

registerAgent(MyAgent);
```

### Step 3: Verify

```bash
# Typecheck the package
pnpm exec tsc -p packages/agents/tsconfig.json --noEmit

# Verify registration
node -e "import('@cmo/agents').then(m => console.log(m.getAllAgents().map(a => a.name)))"
```

The new agent will now be automatically picked up by the worker during analysis jobs.
