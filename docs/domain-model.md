# Domain Model

This document describes every entity in the Chief MOG Officer data model, their
fields, relationships, and status enumerations. All entities are stored in
PostgreSQL and accessed through Drizzle ORM.

---

## Conventions

- **Primary keys** are UUIDs generated at insert time (`uuid` with
  `defaultRandom()`).
- **Timestamps** use `timestamp with time zone`. Every table has a `createdAt`
  column defaulting to `now()`. Most tables also have an `updatedAt` column.
- **Foreign keys** are stored as `text` (UUID strings) with indexes for fast
  lookups.
- **JSON columns** use `jsonb` for flexible, schema-less metadata.

---

## Entities

### User

Represents a person who has signed up to the platform.

| Field       | Type                              | Description                                                       |
| ----------- | --------------------------------- | ----------------------------------------------------------------- |
| `id`        | `uuid` PK                        | Unique identifier, generated automatically.                       |
| `email`     | `text`, unique, not null          | Login email address. Must be unique across the system.             |
| `name`      | `text`, not null                  | Display name shown in the UI and team views.                      |
| `role`      | `user_role` enum, not null        | Permission level. See [User Role](#user-role) below.              |
| `createdAt` | `timestamp with time zone`        | When the account was created.                                     |
| `updatedAt` | `timestamp with time zone`        | Last profile modification.                                        |

---

### Project

A project is the top-level container for all competitive intelligence work. Each
project targets a specific product, business unit, or market segment.

| Field              | Type                               | Description                                                     |
| ------------------ | ---------------------------------- | --------------------------------------------------------------- |
| `id`               | `uuid` PK                         | Unique identifier.                                              |
| `name`             | `text`, not null                   | Human-readable project name (e.g., "Q3 Market Entry").          |
| `description`      | `text`, nullable                   | Optional longer description of the project's goals.             |
| `userId`           | `text` (FK -> User.id), not null   | The user who owns this project.                                 |
| `companyProfileId` | `text` (FK -> CompanyProfile.id)   | Optional link to the company being analyzed. Nullable.          |
| `status`           | `project_status` enum, not null    | Current lifecycle state. See [Project Status](#project-status). |
| `createdAt`        | `timestamp with time zone`         | Creation timestamp.                                             |
| `updatedAt`        | `timestamp with time zone`         | Last modification timestamp.                                    |

---

### CompanyProfile

Stores structured information about the user's own company (or the primary
company under analysis). Linked one-to-one with a project.

| Field          | Type                              | Description                                                    |
| -------------- | --------------------------------- | -------------------------------------------------------------- |
| `id`           | `uuid` PK                        | Unique identifier.                                             |
| `projectId`    | `text` (FK -> Project.id)         | The parent project. Indexed.                                   |
| `name`         | `text`, not null                  | Company name.                                                  |
| `description`  | `text`, nullable                  | Brief company description.                                     |
| `industry`     | `text`, nullable                  | Industry vertical (e.g., "SaaS", "FinTech").                   |
| `website`      | `text`, nullable                  | Company website URL.                                           |
| `positioning`  | `text`, nullable                  | Market positioning statement used by agents for context.       |
| `createdAt`    | `timestamp with time zone`        | Creation timestamp.                                            |
| `updatedAt`    | `timestamp with time zone`        | Last modification timestamp.                                   |

---

### NarrativeModel

Captures the core messaging strategy for a project. Agents use this to align
generated content with the desired brand voice.

| Field            | Type                              | Description                                                  |
| ---------------- | --------------------------------- | ------------------------------------------------------------ |
| `id`             | `uuid` PK                        | Unique identifier.                                           |
| `projectId`      | `text` (FK -> Project.id)         | The parent project. Indexed.                                 |
| `coreNarrative`  | `text`, not null                  | The central message or value proposition.                    |
| `themes`         | `text[]` (array)                  | Recurring themes to emphasize (e.g., "innovation", "trust"). |
| `audience`       | `text`, nullable                  | Target audience description.                                 |
| `tone`           | `text`, nullable                  | Desired communication tone (e.g., "professional", "bold").   |
| `createdAt`      | `timestamp with time zone`        | Creation timestamp.                                          |
| `updatedAt`      | `timestamp with time zone`        | Last modification timestamp.                                 |

---

### CompetitorProfile

Stores intelligence about a single competitor. A project can track many
competitors.

| Field         | Type                              | Description                                                    |
| ------------- | --------------------------------- | -------------------------------------------------------------- |
| `id`          | `uuid` PK                        | Unique identifier.                                             |
| `projectId`   | `text` (FK -> Project.id)         | The parent project. Indexed.                                   |
| `name`        | `text`, not null                  | Competitor company name.                                       |
| `website`     | `text`, nullable                  | Competitor website URL.                                        |
| `description` | `text`, nullable                  | Brief description of the competitor.                           |
| `strengths`   | `text[]` (array)                  | Known competitive strengths.                                   |
| `weaknesses`  | `text[]` (array)                  | Known competitive weaknesses.                                  |
| `createdAt`   | `timestamp with time zone`        | Creation timestamp.                                            |
| `updatedAt`   | `timestamp with time zone`        | Last modification timestamp.                                   |

---

### Opportunity

An actionable insight discovered by an agent. Opportunities are the primary
output of the analysis pipeline and flow into campaign planning and content
creation.

| Field         | Type                                  | Description                                                        |
| ------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `id`          | `uuid` PK                            | Unique identifier.                                                 |
| `projectId`   | `text` (FK -> Project.id)             | The parent project. Indexed.                                       |
| `agentId`     | `text`, not null                      | ID of the agent that created this opportunity.                     |
| `type`        | `opportunity_type` enum, not null     | Category. See [Opportunity Type](#opportunity-type).               |
| `title`       | `text`, not null                      | Short human-readable title.                                        |
| `description` | `text`, not null                      | Detailed explanation of the opportunity.                           |
| `confidence`  | `real`, not null                      | Agent's confidence score, 0.0 to 1.0.                              |
| `status`      | `opportunity_status` enum, not null   | Review state. See [Opportunity Status](#opportunity-status).       |
| `metadata`    | `jsonb`, nullable                     | Arbitrary structured data specific to the opportunity type.        |
| `createdAt`   | `timestamp with time zone`            | Creation timestamp.                                                |
| `updatedAt`   | `timestamp with time zone`            | Last modification timestamp.                                       |

---

### Asset

A piece of content produced by the platform, either generated by the Content
Foundry agent or created manually by a user.

| Field            | Type                              | Description                                                    |
| ---------------- | --------------------------------- | -------------------------------------------------------------- |
| `id`             | `uuid` PK                        | Unique identifier.                                             |
| `projectId`      | `text` (FK -> Project.id)         | The parent project. Indexed.                                   |
| `opportunityId`  | `text` (FK -> Opportunity.id)     | Optional link to the opportunity that inspired this asset.     |
| `type`           | `asset_type` enum, not null       | Content format. See [Asset Type](#asset-type).                 |
| `title`          | `text`, not null                  | Asset title / headline.                                        |
| `content`        | `text`, nullable                  | The full content body. Null while in early draft stages.       |
| `status`         | `asset_status` enum, not null     | Publishing workflow state. See [Asset Status](#asset-status).  |
| `createdAt`      | `timestamp with time zone`        | Creation timestamp.                                            |
| `updatedAt`      | `timestamp with time zone`        | Last modification timestamp.                                   |

---

### Campaign

Groups multiple assets into a coordinated marketing push. Campaigns have a
lifecycle from draft through to completion.

| Field         | Type                                | Description                                                     |
| ------------- | ----------------------------------- | --------------------------------------------------------------- |
| `id`          | `uuid` PK                          | Unique identifier.                                              |
| `projectId`   | `text` (FK -> Project.id)           | The parent project. Indexed.                                    |
| `name`        | `text`, not null                    | Campaign name.                                                  |
| `description` | `text`, nullable                    | Campaign goals and strategy notes.                              |
| `status`      | `campaign_status` enum, not null    | Lifecycle state. See [Campaign Status](#campaign-status).       |
| `assetIds`    | `text[]` (array)                    | Ordered list of asset UUIDs included in this campaign.          |
| `startDate`   | `timestamp with time zone`, nullable | Planned or actual start date.                                  |
| `endDate`     | `timestamp with time zone`, nullable | Planned or actual end date.                                    |
| `createdAt`   | `timestamp with time zone`          | Creation timestamp.                                             |
| `updatedAt`   | `timestamp with time zone`          | Last modification timestamp.                                    |

---

### AgentRun

Tracks a single execution of an agent against a project. Provides an audit
trail and debugging information.

| Field         | Type                                  | Description                                                     |
| ------------- | ------------------------------------- | --------------------------------------------------------------- |
| `id`          | `uuid` PK                            | Unique identifier.                                              |
| `projectId`   | `text` (FK -> Project.id)             | The parent project. Indexed.                                    |
| `agentId`     | `text`, not null                      | ID of the agent that was executed.                               |
| `status`      | `agent_run_status` enum, not null     | Execution state. See [Agent Run Status](#agent-run-status).     |
| `startedAt`   | `timestamp with time zone`, nullable  | When execution began (null if still pending).                   |
| `completedAt` | `timestamp with time zone`, nullable  | When execution finished (null if still running or pending).     |
| `result`      | `jsonb`, nullable                     | Structured output from the agent on success.                    |
| `error`       | `text`, nullable                      | Error message if the run failed.                                |
| `createdAt`   | `timestamp with time zone`            | When the run record was created.                                |

Note: `AgentRun` has no `updatedAt` field. Status transitions are tracked via
`startedAt` and `completedAt` timestamps instead.

---

### DailyDigest

An aggregated summary of all agent activity for a given project on a given day.
Delivered to users as a notification or email.

| Field            | Type                              | Description                                                    |
| ---------------- | --------------------------------- | -------------------------------------------------------------- |
| `id`             | `uuid` PK                        | Unique identifier.                                             |
| `projectId`      | `text` (FK -> Project.id)         | The parent project. Indexed.                                   |
| `date`           | `timestamp with time zone`        | The date this digest covers.                                   |
| `summary`        | `text`, not null                  | Natural-language summary of the day's findings.                |
| `opportunityIds` | `text[]` (array)                  | IDs of opportunities surfaced on this date.                    |
| `createdAt`      | `timestamp with time zone`        | When the digest was generated.                                 |

Note: `DailyDigest` has no `updatedAt` field. Digests are immutable once created.

---

## Status Enumerations

### User Role

| Value    | Description                                                                        |
| -------- | ---------------------------------------------------------------------------------- |
| `admin`  | Full access. Can manage users, billing, and all projects.                          |
| `member` | Can create and edit projects, run agents, and manage content.                      |
| `viewer` | Read-only access. Can view dashboards and reports but cannot trigger actions.       |

### Project Status

| Value      | Description                                                                      |
| ---------- | -------------------------------------------------------------------------------- |
| `active`   | Agents can run, opportunities are being tracked, content can be generated.       |
| `paused`   | Project is temporarily on hold. No scheduled agent runs. Data is preserved.      |
| `archived` | Project is complete or abandoned. Read-only. Can be reactivated by changing status. |

### Opportunity Type

| Value          | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `search`       | Derived from search trend analysis (SearchMogAgent).                        |
| `geo`          | Geographic market opportunity (GeoAgent).                                   |
| `social`       | Social media sentiment or conversation signal (RedditMogAgent).             |
| `competitive`  | Insight from competitor monitoring (CompetitorIntelAgent).                   |
| `content`      | Content gap or creation opportunity (ContentFoundryAgent).                   |

### Opportunity Status

| Value       | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| `new`       | Freshly created by an agent. Awaiting human review.                           |
| `reviewed`  | A team member has looked at it but not yet decided.                            |
| `accepted`  | Approved for action. Will typically flow into campaign or asset creation.      |
| `dismissed` | Rejected as not relevant or not actionable.                                   |

### Asset Type

| Value          | Description                                                                |
| -------------- | -------------------------------------------------------------------------- |
| `blog_post`    | Long-form article for the company blog.                                    |
| `social_post`  | Short-form content for social media platforms.                             |
| `email`        | Email copy for newsletters or outreach campaigns.                          |
| `ad_copy`      | Advertising copy for paid channels.                                        |
| `landing_page` | Content for a dedicated landing page.                                      |

### Asset Status

| Value       | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| `draft`     | Initial version. Content may be incomplete or AI-generated.                   |
| `review`    | Submitted for editorial review by a team member.                              |
| `approved`  | Reviewed and approved. Ready for publishing.                                  |
| `published` | Live and visible to the target audience.                                      |

### Campaign Status

| Value       | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| `draft`     | Campaign is being planned. Assets are being assembled.                        |
| `active`    | Campaign is live. Assets are being published on schedule.                     |
| `paused`    | Campaign is temporarily halted. Can be resumed.                               |
| `completed` | Campaign has finished. All assets published, results available for review.    |

### Agent Run Status

| Value       | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| `pending`   | Run has been created and queued but not yet started.                           |
| `running`   | Agent is currently executing its lifecycle phases.                             |
| `completed` | Agent finished successfully. Results are in the `result` field.               |
| `failed`    | Agent encountered an error. Details are in the `error` field.                 |

---

## Entity Relationships

```
User
 |
 | 1:N
 v
Project ─────────────────────────────────────────────────+
 |                                                        |
 |── 1:1 ── CompanyProfile                                |
 |                                                        |
 |── 1:1 ── NarrativeModel                                |
 |                                                        |
 |── 1:N ── CompetitorProfile                              |
 |                                                        |
 |── 1:N ── Opportunity ──── 0:N ── Asset                  |
 |               |                     |                   |
 |               |                     +──── N:M (via      |
 |               |                          Campaign.      |
 |               |                          assetIds)      |
 |               |                            |            |
 |── 1:N ── Campaign ────────────────────────+            |
 |                                                        |
 |── 1:N ── AgentRun                                      |
 |                                                        |
 |── 1:N ── DailyDigest ── references ── Opportunity[]    |
 +────────────────────────────────────────────────────────+
```

### Relationship Summary

| Parent           | Child              | Cardinality | FK Column                   |
| ---------------- | ------------------ | ----------- | --------------------------- |
| User             | Project            | 1:N         | `Project.userId`            |
| Project          | CompanyProfile     | 1:1         | `CompanyProfile.projectId`  |
| Project          | NarrativeModel     | 1:1         | `NarrativeModel.projectId`  |
| Project          | CompetitorProfile  | 1:N         | `CompetitorProfile.projectId` |
| Project          | Opportunity        | 1:N         | `Opportunity.projectId`     |
| Project          | Asset              | 1:N         | `Asset.projectId`           |
| Opportunity      | Asset              | 0:N         | `Asset.opportunityId`       |
| Project          | Campaign           | 1:N         | `Campaign.projectId`        |
| Campaign         | Asset              | N:M         | `Campaign.assetIds` (array) |
| Project          | AgentRun           | 1:N         | `AgentRun.projectId`        |
| Project          | DailyDigest        | 1:N         | `DailyDigest.projectId`     |

### ER Diagram

```
+----------+       +------------+       +-------------------+
|   User   |1─────N|  Project   |1─────1| CompanyProfile    |
+----------+       +-----+------+       +-------------------+
                         |
          +--------------+---------------+-----------+----------+
          |              |               |           |          |
         1:1            1:N             1:N         1:N        1:N
          |              |               |           |          |
  +-------+------+ +----+--------+ +----+------+ +--+------+ +-+----------+
  |NarrativeModel| |Competitor   | |Opportunity| |AgentRun | |DailyDigest |
  +--------------+ |Profile      | +----+------+ +---------+ +------------+
                   +-------------+      |
                                       0:N
                                        |
                                  +-----+----+
                                  |  Asset   |
                                  +-----+----+
                                        |
                                       N:M (assetIds)
                                        |
                                  +-----+----+
                                  | Campaign |
                                  +----------+
```

---

## Indexing Strategy

All foreign key columns are indexed to ensure fast joins and lookups:

- `Project.userId`
- `CompanyProfile.projectId`
- `NarrativeModel.projectId`
- `CompetitorProfile.projectId`
- `Opportunity.projectId`
- `Asset.projectId`
- `Asset.opportunityId`
- `Campaign.projectId`
- `AgentRun.projectId`
- `DailyDigest.projectId`

Additional indexes may be added for query patterns like filtering opportunities
by status or type, or looking up agent runs by `agentId`.
