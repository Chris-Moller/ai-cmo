# Agent Interface

This document describes the contract that every AI agent in Chief MOG Officer
must implement, the lifecycle each agent follows during a run, the five built-in
stub agents, the registry pattern used to discover agents at runtime, and a
step-by-step guide for adding new agents.

---

## Agent Contract

Every agent implements the `Agent` interface defined in
`packages/agents/src/interface.ts`:

```typescript
export interface Agent {
  /** Unique identifier used in the registry and stored in AgentRun rows. */
  id: string;

  /** Human-readable name displayed in the UI. */
  name: string;

  /** Short description of what this agent does. */
  description: string;

  /** Phase 1: Fetch raw data from external sources. */
  ingest(context: AgentContext): Promise<IngestResult>;

  /** Phase 2: Analyze ingested data and produce insights. */
  analyze(context: AgentContext): Promise<AnalysisResult>;

  /** Phase 3: Turn insights into actionable Opportunity records. */
  generateOpportunities(context: AgentContext): Promise<Opportunity[]>;

  /** Phase 4: Create a natural-language summary of the run. */
  summarize(context: AgentContext): Promise<string>;
}
```

### AgentContext

The `AgentContext` object is passed to every lifecycle method. It provides the
minimum information an agent needs to operate:

```typescript
export interface AgentContext {
  /** The project this run belongs to. Use this to query project-specific data. */
  projectId: string;

  /** The unique ID of the current AgentRun record. Use this for logging and
   *  linking output back to the run. */
  runId: string;
}
```

The context is intentionally minimal. Agents that need additional data (company
profile, competitor list, narrative model) should query the database using the
`projectId`.

### IngestResult

Returned by the `ingest()` phase:

```typescript
export interface IngestResult {
  /** Number of raw data points collected during ingestion. */
  dataPoints: number;

  /** List of source URLs or identifiers where data was fetched from. */
  sources: string[];
}
```

### AnalysisResult

Returned by the `analyze()` phase:

```typescript
export interface AnalysisResult {
  /** Human-readable insight strings derived from the ingested data. */
  insights: string[];

  /** Overall confidence score for the analysis, from 0.0 (no confidence) to
   *  1.0 (high confidence). */
  confidence: number;
}
```

---

## Agent Lifecycle

When the Worker dequeues an agent run job, it executes the agent's four phases
in strict sequential order:

```
  +----------+     +----------+     +------------------------+     +-----------+
  | ingest() | --> | analyze()| --> | generateOpportunities()| --> | summarize()|
  +----------+     +----------+     +------------------------+     +-----------+
```

### Phase 1: ingest()

**Purpose:** Collect raw data from external sources.

The agent reaches out to APIs, scrapes web pages, reads RSS feeds, or queries
third-party data providers. It does not interpret or score the data -- it simply
gathers it. The returned `IngestResult` reports how many data points were
collected and from which sources, providing an audit trail.

**Example:** The SearchMogAgent might query a search trends API and return
`{ dataPoints: 142, sources: ['https://trends.example.com/api/v1'] }`.

**Error handling:** If ingestion fails (network error, rate limit), the agent
should throw. The Worker will catch the error, mark the `AgentRun` as `failed`,
and record the error message.

### Phase 2: analyze()

**Purpose:** Process ingested data and extract meaningful patterns.

This phase runs scoring algorithms, sentiment analysis, trend detection, or LLM
inference over the raw data collected in phase 1. The output is an
`AnalysisResult` containing human-readable insight strings and an overall
confidence score.

**Example:** `{ insights: ['Competitor X launched a new pricing page', 'Search volume for "AI analytics" up 40% MoM'], confidence: 0.82 }`.

**Statelessness:** Agents should not rely on in-memory state from `ingest()`.
If the analyze phase needs the raw data, it should read it from the database or
a temporary store populated during ingestion.

### Phase 3: generateOpportunities()

**Purpose:** Translate analytical insights into actionable `Opportunity` records.

Each opportunity has a type (search, geo, social, competitive, content), a
confidence score, a title, and a description. These records are written to the
database and appear in the user's opportunity feed for review.

**Example:** An insight about rising search volume might produce an opportunity
of type `search` titled "Target 'AI analytics' keyword cluster" with a
confidence of 0.78.

### Phase 4: summarize()

**Purpose:** Generate a natural-language summary of the entire run.

This summary is included in the `DailyDigest` and may be sent to users via
email or in-app notification. It should be concise (2--4 sentences) and
highlight the most significant findings.

**Example:** `"SearchMogAgent analyzed 142 data points from search trend APIs. Key finding: 'AI analytics' search volume increased 40% month-over-month, suggesting a content opportunity. Generated 3 new opportunities with an average confidence of 0.75."`.

---

## Built-in Agents

The platform ships with five stub agents. Each returns hardcoded mock data
during development. In production, their implementations will be replaced with
real API integrations and LLM calls.

### 1. SearchMogAgent

| Property    | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| ID          | `search-mog`                                                        |
| Name        | Search MOG Agent                                                     |
| Description | Analyzes search trends and keyword opportunities to identify gaps    |
|             | in organic search coverage.                                          |

**What it does in production:** Connects to search data APIs (e.g., Google
Trends, SEMrush, Ahrefs) to monitor keyword rankings, search volume changes,
and SERP feature opportunities. Identifies keywords where the company can gain
competitive advantage.

**Opportunity type:** `search`

### 2. GeoAgent

| Property    | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| ID          | `geo`                                                                |
| Name        | Geo Agent                                                            |
| Description | Detects geographic market opportunities by analyzing regional search |
|             | patterns and local competitive landscapes.                           |

**What it does in production:** Analyzes geographic signals -- local search
trends, regional competitor presence, market penetration data -- to find
under-served markets or regions where the company can expand.

**Opportunity type:** `geo`

### 3. RedditMogAgent

| Property    | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| ID          | `reddit-mog`                                                        |
| Name        | Reddit MOG Agent                                                     |
| Description | Mines Reddit for brand mentions, competitor discussions, and         |
|             | sentiment signals in relevant subreddits.                            |

**What it does in production:** Monitors specified subreddits for mentions of the
company, its competitors, and industry keywords. Performs sentiment analysis on
discussions and identifies trending topics that represent marketing
opportunities.

**Opportunity type:** `social`

### 4. CompetitorIntelAgent

| Property    | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| ID          | `competitor-intel`                                                   |
| Name        | Competitor Intel Agent                                               |
| Description | Monitors competitor websites, pricing pages, product launches, and   |
|             | press releases to track competitive movements.                       |

**What it does in production:** Scrapes competitor websites on a schedule,
detects changes in pricing, messaging, or product features, and cross-references
with press releases and news articles. Surfaces competitive shifts that require
a response.

**Opportunity type:** `competitive`

### 5. ContentFoundryAgent

| Property    | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| ID          | `content-foundry`                                                    |
| Name        | Content Foundry Agent                                                |
| Description | Identifies content gaps and generates draft assets (blog posts,      |
|             | social posts, ad copy) aligned with the project's narrative model.   |

**What it does in production:** Compares the company's existing content against
competitor content and search demand. Identifies topics with high potential but
no existing coverage. Uses the project's `NarrativeModel` to generate draft
content in the correct voice and tone.

**Opportunity type:** `content`

---

## Registry Pattern

Agents are registered in a centralized registry implemented in
`packages/agents/src/registry.ts`. The registry is a simple `Map` that allows
the Worker and API to look up agents by ID without tight coupling.

```typescript
const agentRegistry = new Map<string, Agent>();

// Register all built-in agents at module load time
agentRegistry.set('search-mog', new SearchMogAgent());
agentRegistry.set('geo', new GeoAgent());
agentRegistry.set('reddit-mog', new RedditMogAgent());
agentRegistry.set('competitor-intel', new CompetitorIntelAgent());
agentRegistry.set('content-foundry', new ContentFoundryAgent());

/**
 * Retrieve a single agent by its ID.
 * Returns undefined if no agent is registered with that ID.
 */
export function getAgent(id: string): Agent | undefined {
  return agentRegistry.get(id);
}

/**
 * Retrieve all registered agents.
 * Returns an array of Agent instances.
 */
export function getAllAgents(): Agent[] {
  return Array.from(agentRegistry.values());
}
```

### Why a registry?

- **Decoupling:** The Worker does not import individual agent classes. It asks
  the registry for an agent by ID (stored in the `AgentRun` record) and
  executes whatever it gets back.
- **Extensibility:** Adding a new agent requires only implementing the
  interface and adding one line to the registry.
- **Testability:** In tests, you can replace registry entries with mock agents.

---

## How to Add a New Agent

Follow these steps to add a new agent to the platform:

### Step 1: Create the agent file

Create a new file in `packages/agents/src/`:

```
packages/agents/src/my-new-agent.ts
```

### Step 2: Implement the Agent interface

```typescript
import type { Opportunity } from '@chief-mog-officer/types';
import type { Agent, AgentContext, IngestResult, AnalysisResult } from './interface.js';

export class MyNewAgent implements Agent {
  id = 'my-new-agent';
  name = 'My New Agent';
  description = 'Describe what this agent does.';

  async ingest(context: AgentContext): Promise<IngestResult> {
    // Fetch data from your source
    return { dataPoints: 0, sources: [] };
  }

  async analyze(context: AgentContext): Promise<AnalysisResult> {
    // Process and score the ingested data
    return { insights: [], confidence: 0 };
  }

  async generateOpportunities(context: AgentContext): Promise<Opportunity[]> {
    // Create Opportunity objects from your analysis
    return [];
  }

  async summarize(context: AgentContext): Promise<string> {
    // Write a human-readable summary
    return 'My New Agent found nothing noteworthy.';
  }
}
```

### Step 3: Register the agent

Open `packages/agents/src/registry.ts` and add:

```typescript
import { MyNewAgent } from './my-new-agent.js';

// In the registration section:
agentRegistry.set('my-new-agent', new MyNewAgent());
```

### Step 4: Export from the package

Open `packages/agents/src/index.ts` and add:

```typescript
export { MyNewAgent } from './my-new-agent.js';
```

### Step 5: Add a corresponding opportunity type (if needed)

If your agent produces a new type of opportunity that does not fit the existing
categories (`search`, `geo`, `social`, `competitive`, `content`), you will need
to:

1. Add the new value to the `OpportunityType` union in `packages/types/`.
2. Add the corresponding enum value in the Drizzle schema in `packages/db/`.
3. Run `pnpm db:generate` to create a migration for the schema change.

### Step 6: Write tests

Create `packages/agents/src/__tests__/my-new-agent.test.ts` and verify:

- All four lifecycle methods return the correct types.
- The agent handles error cases gracefully.
- Mock data is plausible and well-structured.

### Step 7: Rebuild and verify

```bash
pnpm build          # Ensure the new agent compiles
pnpm test           # Ensure all tests pass
pnpm typecheck      # Ensure no type errors
```

The agent will now appear in `getAllAgents()` and can be referenced by its ID
in `AgentRun` records.
