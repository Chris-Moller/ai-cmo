# Domain Model

## Entity Overview

```
┌──────────┐       ┌────────────────┐       ┌───────────────────┐
│   User   │──1:N──│    Project     │──1:N──│   Opportunity     │
└──────────┘       └───────┬────────┘       └────────┬──────────┘
                           │                         │
                    ┌──────┴───────┐          ┌──────▼──────┐
                    │              │          │    Asset    │
             ┌──────▼──────┐ ┌────▼─────┐   └──────┬──────┘
             │  Company    │ │Competitor│          │
             │  Profile    │ │ Profile  │   ┌──────▼──────┐
             └─────────────┘ └──────────┘   │  Campaign   │
                                            │  (via join) │
                    ┌──────────────┐        └─────────────┘
                    │  Narrative   │
                    │   Model     │
                    └─────────────┘

         ┌──────────────┐    ┌──────────────┐
         │  Agent Run   │    │ Daily Digest │
         └──────────────┘    └──────────────┘
```

## Entities

### User

Authentication identity for the platform.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `email` | `string` | User email address (unique) |
| `name` | `string` | Display name |
| `role` | `UserRole` | Permission level |
| `createdAt` | `Date` | Account creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

**UserRole enum**: `'admin'` | `'member'` | `'viewer'`

- `admin` — Full access: manage users, projects, and system settings
- `member` — Can create/edit projects and trigger analysis
- `viewer` — Read-only access to projects and results

---

### Project

Core entity representing a company being tracked for competitive intelligence.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `userId` | `string` | FK → User who owns this project |
| `name` | `string` | Project/company name |
| `domain` | `string` | Company website domain |
| `description` | `string` | Brief description of the project |
| `status` | `ProjectStatus` | Current lifecycle state |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

**ProjectStatus enum**: `'active'` | `'paused'` | `'archived'`

- `active` — Agents run on schedule, opportunities are surfaced
- `paused` — Agents do not run; existing data preserved
- `archived` — Project is retired; read-only

**Relationships**:
- Belongs to one `User`
- Has zero or one `CompanyProfile`
- Has zero or one `NarrativeModel`
- Has zero or more `CompetitorProfile` records
- Has zero or more `Opportunity` records
- Has zero or more `Campaign` records
- Has zero or more `AgentRun` records
- Has zero or more `DailyDigest` records

---

### CompanyProfile

Enriched company data associated with a project.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `projectId` | `string` | FK → Project |
| `industry` | `string` | Industry classification |
| `size` | `string` | Company size (e.g., "startup", "enterprise") |
| `positioning` | `string` | Market positioning statement |
| `narrative` | `string` | Core company narrative |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

---

### NarrativeModel

The company's core messaging framework, used to guide content generation.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `projectId` | `string` | FK → Project |
| `valueProps` | `string[]` | Key value propositions |
| `differentiators` | `string[]` | Competitive differentiators |
| `tone` | `string` | Desired communication tone |
| `targetAudience` | `string` | Primary target audience description |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

---

### CompetitorProfile

A tracked competitor associated with a project.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `projectId` | `string` | FK → Project |
| `name` | `string` | Competitor name |
| `domain` | `string` | Competitor website domain |
| `strengths` | `string[]` | Known strengths |
| `weaknesses` | `string[]` | Known weaknesses |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

---

### Opportunity

An actionable insight surfaced by an agent. The primary output of the intelligence pipeline.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `projectId` | `string` | FK → Project |
| `agentName` | `string` | Name of the agent that generated this |
| `type` | `OpportunityType` | Category of opportunity |
| `title` | `string` | Short title |
| `description` | `string` | Detailed description |
| `source` | `string` | Data source identifier |
| `priority` | `OpportunityPriority` | Urgency/importance level |
| `status` | `OpportunityStatus` | Current processing state |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

**OpportunityType enum**: `'content'` | `'seo'` | `'social'` | `'competitive'` | `'local'`

- `content` — Content creation or optimization opportunity
- `seo` — Search engine optimization opportunity
- `social` — Social media engagement opportunity
- `competitive` — Competitive positioning opportunity
- `local` — Geographic/local market opportunity

**OpportunityPriority enum**: `'high'` | `'medium'` | `'low'`

**OpportunityStatus enum**: `'new'` | `'reviewed'` | `'actioned'` | `'dismissed'`

- `new` — Freshly surfaced by an agent, not yet seen
- `reviewed` — Seen by a user but no action taken
- `actioned` — User has acted on this opportunity (e.g., created content)
- `dismissed` — User has dismissed as not relevant

---

### Asset

A generated content asset (blog draft, social post, email, etc.) linked to an opportunity.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `opportunityId` | `string` | FK → Opportunity |
| `type` | `AssetType` | Content format |
| `title` | `string` | Asset title |
| `content` | `string` | Full content body |
| `status` | `AssetStatus` | Publication state |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

**AssetType enum**: `'blog'` | `'social'` | `'email'` | `'ad'` | `'other'`

**AssetStatus enum**: `'draft'` | `'review'` | `'published'`

---

### Campaign

A collection of assets targeting a strategic goal, linked to a project.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `projectId` | `string` | FK → Project |
| `title` | `string` | Campaign title |
| `description` | `string` | Campaign description |
| `status` | `CampaignStatus` | Lifecycle state |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

**CampaignStatus enum**: `'planned'` | `'active'` | `'completed'`

**Relationships**: Campaigns link to Assets via a `campaign_assets` join table (many-to-many).

---

### AgentRun

Execution record for a single agent run within an analysis job.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `projectId` | `string` | FK → Project |
| `agentName` | `string` | Name of the agent that ran |
| `status` | `AgentRunStatus` | Execution state |
| `startedAt` | `Date \| null` | When the run began |
| `finishedAt` | `Date \| null` | When the run completed |
| `resultSummary` | `string \| null` | Text summary of results |
| `error` | `string \| null` | Error message if failed |
| `createdAt` | `Date` | Record creation timestamp |

**AgentRunStatus enum**: `'pending'` | `'running'` | `'completed'` | `'failed'`

- `pending` — Queued but not yet started
- `running` — Currently executing
- `completed` — Finished successfully
- `failed` — Terminated with an error

---

### DailyDigest

Aggregated daily summary of agent results for a project.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `projectId` | `string` | FK → Project |
| `date` | `Date` | The date this digest covers |
| `summary` | `string` | Aggregated text summary |
| `opportunityCount` | `number` | Total opportunities surfaced that day |
| `createdAt` | `Date` | Record creation timestamp |

---

## Helper Types

These types are used by the agent interface and are not persisted directly.

### IngestResult

Returned by `agent.ingest()` — describes the raw data collected.

```typescript
interface IngestResult {
  sourceCount: number;             // Number of sources checked
  rawDataSize: number;             // Approximate data size in bytes
  metadata: Record<string, unknown>; // Agent-specific metadata
}
```

### AnalysisResult

Returned by `agent.analyze()` — describes insights derived from ingested data.

```typescript
interface AnalysisResult {
  insights: string[];              // List of insight statements
  confidence: number;              // Confidence score (0.0 - 1.0)
  metadata: Record<string, unknown>; // Agent-specific metadata
}
```

## Database Table Mapping

All entities map to PostgreSQL tables via Drizzle ORM in `packages/db`. Column naming uses `snake_case` (e.g., `project_id`, `created_at`), while TypeScript interfaces use `camelCase`.

| Entity | Table | ID Strategy |
|--------|-------|-------------|
| User | `users` | Identity column (auto-increment) |
| Project | `projects` | Identity column |
| CompanyProfile | `company_profiles` | Identity column |
| NarrativeModel | `narrative_models` | Identity column |
| CompetitorProfile | `competitor_profiles` | Identity column |
| Opportunity | `opportunities` | Identity column |
| Asset | `assets` | Identity column |
| Campaign | `campaigns` | Identity column |
| Campaign ↔ Asset | `campaign_assets` | Composite PK (campaign_id, asset_id) |
| AgentRun | `agent_runs` | Identity column |
| DailyDigest | `daily_digests` | Identity column |

### Indexes

- All foreign key columns are indexed
- `projects.status` — filter active projects
- `opportunities.status` — filter new/unreviewed opportunities
- `opportunities.type` — filter by opportunity category
- `agent_runs.status` — find running/failed jobs
- `daily_digests.date` — lookup by date
