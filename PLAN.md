# Chief MOG Officer — Architecture & Implementation Plan

## Overview

Scaffold a full-stack TypeScript monorepo for the "Chief MOG Officer" — an AI-powered competitive intelligence platform. This plan covers foundational scaffolding only: project structure, typed domain models, API stubs, worker skeleton, agent contracts, frontend shell, database schema, DX tooling, and architecture docs.

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Monorepo** | pnpm workspaces + Turborepo | pnpm 10 is pre-installed; Turborepo provides task caching, dependency-aware builds, and parallel execution. Industry standard for TS monorepos in 2025/2026. |
| **Language** | TypeScript 5.x (strict) | Type safety across the entire stack; shared types between apps. |
| **API** | Hono on Node.js | Lightweight (<14KB), first-class TypeScript, Web Standards-based, excellent DX. Runs on Node.js with `@hono/node-server`. |
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 + shadcn/ui | Fast dev server, HMR, modern build tooling. shadcn/ui for composable, accessible components. |
| **Routing (FE)** | React Router v7 | Stable, well-known, sufficient for page shells at scaffolding stage. |
| **Database** | PostgreSQL 16 (via Docker) | Battle-tested relational DB, excellent for structured domain models. |
| **ORM** | Drizzle ORM v1 | TypeScript-first, SQL-like API, excellent migration tooling (`drizzle-kit`), lightweight. |
| **Worker/Queue** | BullMQ + Redis (via Docker) | Production-grade job queue with cron scheduling, retry, rate limiting. Redis via Docker for local dev. |
| **Validation** | Zod | Runtime validation with TypeScript type inference. Used for env validation and API input. |
| **Logging** | pino | Fast, structured JSON logging for Node.js services. |
| **Linting** | ESLint 9 (flat config) + Prettier | Standard linting with TypeScript support. |
| **Testing** | Vitest | Vite-native test runner, fast, TypeScript-first. |
| **CI** | GitHub Actions (existing workflow) | Extend existing ci.yml with lint, typecheck, test steps. Keep Dockerfile for deploy. |
| **Containerization** | Docker Compose (local dev) | PostgreSQL + Redis for local development. Multi-stage Dockerfile for deploy. |

### Design Direction: "Command Terminal Dark"

A dark-themed, data-dense UI inspired by military command centers and terminal aesthetics. Think Bloomberg Terminal meets modern SaaS.

- **Typography**: JetBrains Mono (code/data) paired with Inter (body text) — monospace for the data-heavy command center feel
- **Color palette**: Near-black backgrounds (#0a0a0f, #12121a), electric cyan (#00e5ff) as primary accent, amber (#ffab00) for warnings/opportunities, sharp white (#f0f0f5) for text
- **Layout**: Full-width dashboard grids, sidebar navigation, dense data tables, minimal padding
- **Components**: Cards with subtle borders (not rounded blobs), status indicators, compact forms

## Directory Structure

```
/
├── apps/
│   ├── web/                    # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/     # Shared UI components
│   │   │   ├── pages/          # Route pages
│   │   │   ├── layouts/        # App layout shell
│   │   │   ├── lib/            # Frontend utilities
│   │   │   └── styles/         # Global styles, design tokens
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── api/                    # Hono API server
│   │   ├── src/
│   │   │   ├── routes/         # Route handlers
│   │   │   ├── middleware/     # Auth, logging, error handling
│   │   │   ├── services/       # Business logic stubs
│   │   │   └── index.ts        # Entry point
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── worker/                 # BullMQ worker
│       ├── src/
│       │   ├── jobs/           # Job handlers
│       │   ├── queues/         # Queue definitions
│       │   └── index.ts        # Entry point
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── types/                  # Shared domain types
│   │   ├── src/
│   │   │   ├── domain/         # Domain model types
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── db/                     # Drizzle schema + migrations
│   │   ├── src/
│   │   │   ├── schema/         # Table definitions
│   │   │   ├── migrations/     # Generated migrations
│   │   │   ├── seed.ts         # Seed script
│   │   │   └── index.ts        # DB client export
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── agents/                 # Agent interface + stubs
│   │   ├── src/
│   │   │   ├── interface.ts    # Common agent contract
│   │   │   ├── registry.ts     # Agent registry
│   │   │   ├── search-mog.ts
│   │   │   ├── geo.ts
│   │   │   ├── reddit-mog.ts
│   │   │   ├── competitor-intel.ts
│   │   │   └── content-foundry.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── config/                 # Shared config + env validation
│   │   ├── src/
│   │   │   ├── env.ts          # Zod env schemas
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── ui/                     # Shared UI components (shadcn/ui based)
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI primitives
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── lib/                    # Shared utilities
│       ├── src/
│       │   ├── logger.ts       # pino logger
│       │   ├── errors.ts       # Error types
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── docs/
│   ├── architecture.md
│   ├── domain-model.md
│   ├── agent-interface.md
│   └── dev-setup.md
├── docker-compose.yml          # PostgreSQL + Redis
├── Dockerfile                  # Multi-stage build for deploy
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                # Root workspace config
├── tsconfig.base.json          # Shared TS config
├── .eslintrc.cjs               # Shared ESLint config
├── .prettierrc                 # Prettier config
├── .env.example                # Environment template
└── vitest.workspace.ts         # Vitest workspace config
```

## Domain Models

All types in `packages/types/src/domain/`:

- **User** — id, email, name, role, createdAt
- **Project** — id, name, description, userId, companyProfileId, status, createdAt, updatedAt
- **CompanyProfile** — id, projectId, name, description, industry, website, positioning, createdAt
- **NarrativeModel** — id, projectId, coreNarrative, themes[], audience, tone, createdAt
- **CompetitorProfile** — id, projectId, name, website, description, strengths, weaknesses, createdAt
- **Opportunity** — id, projectId, agentId, type, title, description, confidence, status, metadata, createdAt
- **Asset** — id, projectId, opportunityId, type, title, content, status, createdAt
- **Campaign** — id, projectId, name, description, status, assets[], startDate, endDate, createdAt
- **AgentRun** — id, projectId, agentId, status, startedAt, completedAt, result, error
- **DailyDigest** — id, projectId, date, summary, opportunities[], createdAt

## Database Schema

Drizzle ORM schema in `packages/db/src/schema/` with tables mapping to domain models above. PostgreSQL with:
- UUID primary keys (via `gen_random_uuid()`)
- Timestamps with timezone
- Indexes on foreign keys and frequently queried columns
- Enum types for status fields

## Agent Interface

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  ingest(context: AgentContext): Promise<IngestResult>;
  analyze(context: AgentContext): Promise<AnalysisResult>;
  generateOpportunities(context: AgentContext): Promise<Opportunity[]>;
  summarize(context: AgentContext): Promise<string>;
}
```

Five stub agents returning mock data:
1. **SearchMogAgent** — Search trend analysis
2. **GeoAgent** — Geographic opportunity detection
3. **RedditMogAgent** — Reddit sentiment/opportunity mining
4. **CompetitorIntelAgent** — Competitor monitoring
5. **ContentFoundryAgent** — Content generation opportunities

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| POST | `/api/projects/:id/analyze` | Trigger analysis (stub) |
| GET | `/api/projects/:id/opportunities` | List opportunities |

## Worker Jobs

- `daily-analysis` — Scheduled cron job for daily runs
- `manual-analysis` — Triggered analysis for a project
- `agent-execution` — Per-agent execution within an analysis run

All mock implementations that create AgentRun records and return synthetic results.

## Execution Strategy: Parallel

This is an XL scaffolding task with clearly separable modules. Splitting into 4 parallel implementation agents:

### Subtask 1: Foundation (packages + config + database + docs)
- Root monorepo config (pnpm-workspace, turbo.json, tsconfig.base, eslint, prettier)
- `packages/types` — all domain type definitions
- `packages/config` — env validation with Zod
- `packages/lib` — logger (pino), error types
- `packages/db` — Drizzle schema, migrations, seed script, DB client
- `packages/agents` — agent interface, registry, 5 stub agents
- `docker-compose.yml` — PostgreSQL + Redis
- `docs/` — architecture.md, domain-model.md, agent-interface.md, dev-setup.md
- `.env.example`

### Subtask 2: API Server
- `apps/api` — Hono server with Node.js adapter
- Routes: health, project CRUD, analysis trigger, opportunity list
- Middleware: error handling, logging, auth placeholder
- Integration with `packages/db`, `packages/types`, `packages/config`, `packages/lib`

### Subtask 3: Worker
- `apps/worker` — BullMQ worker setup
- Queue definitions, job handlers (daily-analysis, manual-analysis, agent-execution)
- Integration with `packages/db`, `packages/agents`, `packages/types`, `packages/config`
- Mock implementations with AgentRun tracking

### Subtask 4: Frontend
- `apps/web` — React + Vite + Tailwind + shadcn/ui
- `packages/ui` — shared UI components
- App shell, layout, routing (React Router)
- Pages: Command Center, Project Creation, Opportunity List
- Design tokens, "Command Terminal Dark" theme
- Error boundary

### Integration
- Wire all apps together, ensure cross-package imports work
- Root scripts: `dev`, `build`, `lint`, `typecheck`, `test`
- CI workflow update
- Dockerfile (multi-stage)
- Final seed + boot verification

## Sources

- [Turborepo docs](https://turborepo.dev/repo/docs)
- [Hono framework](https://hono.dev/docs/)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [BullMQ](https://bullmq.io/)
- [Vite](https://vite.dev/guide/)
- [pnpm + Turborepo monorepo best practices 2025/2026](https://dev.to/hexshift/setting-up-a-scalable-monorepo-with-turborepo-and-pnpm-4doh)
- [TypeScript monorepo best practice 2026](https://hsb.horse/en/blog/typescript-monorepo-best-practice-2026/)
