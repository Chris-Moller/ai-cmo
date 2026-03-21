# Chief MOG Officer — Implementation Plan

## Overview

Scaffold a TypeScript monorepo for the Chief MOG Officer MVP: an AI-powered competitive intelligence platform with agent-based analysis, background job processing, and a command-center UI.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Monorepo | pnpm workspaces + Turborepo | Industry standard, fast builds, workspace protocol for internal deps |
| Language | TypeScript 5.x everywhere | Full-stack type safety, shared types across packages |
| Backend API | Hono (on Node.js) | Ultrafast (<14KB), first-class TypeScript, built-in middleware, RPC mode for typed client |
| Frontend | React 18 + Vite + Tailwind CSS v4 + shadcn/ui | Modern build, utility-first CSS, accessible component library |
| Routing (FE) | React Router v7 | Stable, widely adopted, type-safe route params |
| ORM | Drizzle ORM (PostgreSQL) | Zero deps, TypeScript-native schema, automatic migration generation |
| Job Queue | BullMQ + Redis | Battle-tested, cron scheduling, priorities, retries, parent-child jobs |
| Validation | Zod | Pairs with Drizzle (drizzle-zod) and Hono (@hono/zod-validator) |
| Env validation | @t3-oss/env-core | Type-safe env vars with Zod schemas |
| Logging | pino | Fast, structured JSON logging, standard in Node.js ecosystem |
| Testing | Vitest | Native ESM, TypeScript, workspace-aware, fast |
| Linting | ESLint 9 (flat config) + Prettier | Modern config format, consistent formatting |
| Container | Docker + docker-compose | Local dev with PostgreSQL + Redis, matches existing CI/deploy pipeline |

## Design Direction: "Command Ops Dark"

A dark, information-dense command center aesthetic — inspired by military ops dashboards and Bloomberg terminals, not consumer SaaS.

- **Typography**: "Space Grotesk" (display/headings) + "IBM Plex Mono" (data/body) — technical, sharp, purposeful
- **Palette**: Charcoal base (#0A0A0F), zinc surfaces (#18181B), electric cyan accent (#06B6D4), amber warning (#F59E0B), red alert (#EF4444)
- **Layout**: Full-width panels, sidebar navigation, data-grid layouts, asymmetric dashboard cards
- **Personality**: Dense, no-nonsense, data-forward — this is a "Chief Officer" tool, not a marketing site

## Directory Structure

```
/
├── apps/
│   ├── web/            # React + Vite frontend
│   ├── api/            # Hono backend API
│   └── worker/         # BullMQ job processor
├── packages/
│   ├── types/          # Shared domain types + Zod schemas
│   ├── db/             # Drizzle schema, migrations, client, seed
│   ├── config/         # Env validation, shared constants
│   ├── agents/         # Agent interface + stub implementations
│   ├── ui/             # Shared UI components (shadcn/ui based)
│   └── lib/            # Shared utilities (logging, errors, etc.)
├── docs/
│   ├── architecture.md
│   ├── domain-model.md
│   ├── agent-interface.md
│   └── dev-setup.md
├── docker-compose.yml
├── Dockerfile
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

## Domain Model

Core entities (all get Drizzle schema + Zod validators + TypeScript types):

| Entity | Description |
|--------|-------------|
| **User** | Auth identity, org membership |
| **Project** | Top-level container — a company/brand being monitored |
| **CompanyProfile** | Detailed company info attached to a project |
| **NarrativeModel** | Company's positioning, messaging, key narratives |
| **CompetitorProfile** | Competitor info tracked per project |
| **Opportunity** | AI-discovered actionable insight |
| **Asset** | Generated content piece (blog post, social copy, etc.) |
| **Campaign** | Collection of assets targeting an opportunity |
| **AgentRun** | Execution record for an agent job |
| **DailyDigest** | Aggregated daily summary per project |

## Agent Interface

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  ingest(projectId: string): Promise<IngestResult>;
  analyze(projectId: string): Promise<AnalysisResult>;
  generateOpportunities(projectId: string): Promise<Opportunity[]>;
  summarize(projectId: string): Promise<Summary>;
}
```

Five stub agents:
1. **SearchMogAgent** — Search trend monitoring
2. **GeoAgent** — Geographic opportunity detection
3. **RedditMogAgent** — Reddit discussion monitoring
4. **CompetitorIntelAgent** — Competitor activity tracking
5. **ContentFoundryAgent** — Content generation suggestions

All return mock data during scaffolding phase.

## API Routes

| Method | Path | Handler |
|--------|------|---------|
| GET | `/health` | Health check (DB + Redis ping) |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project detail |
| POST | `/api/projects/:id/analyze` | Trigger analysis (queues worker job) |
| GET | `/api/projects/:id/opportunities` | List opportunities |

## Worker Jobs

| Queue | Job | Trigger |
|-------|-----|---------|
| `analysis` | `run-analysis` | API trigger or cron |
| `analysis` | `run-agent` | Parent job spawns per-agent child jobs |
| `scheduled` | `daily-digest` | Cron (daily) |

## Module Boundaries & Parallel Strategy

This task splits into **4 parallel subtasks**:

### Subtask 1: Foundation (monorepo + shared packages + DB + docs)
- Monorepo config (pnpm, turbo, tsconfig, eslint, prettier)
- `packages/types` — all domain types + Zod schemas
- `packages/db` — Drizzle schema, migrations, seed script, client
- `packages/config` — env validation
- `packages/lib` — logging (pino), error types
- `packages/agents` — agent interface + 5 stub agents
- `docs/` — all 4 architecture docs
- `docker-compose.yml` — PostgreSQL + Redis
- `Dockerfile` — multi-stage build
- Root `package.json` with workspace scripts

### Subtask 2: Backend API
- `apps/api` — Hono server with all routes
- Auth placeholder middleware
- Imports from packages/types, packages/db, packages/config
- Health check that pings DB + Redis
- Project CRUD stubs (DB-backed)
- Analysis trigger (queues BullMQ job)
- Opportunity list stub

### Subtask 3: Worker
- `apps/worker` — BullMQ processor
- Analysis job handler (spawns per-agent child jobs)
- Agent execution wrapper (calls agent interface methods)
- Run status tracking (writes AgentRun records)
- Retry/error handling config
- Cron schedule setup (daily digest)
- Mock implementations that write to DB

### Subtask 4: Frontend
- `apps/web` — React + Vite + Tailwind + shadcn/ui
- App shell with sidebar layout
- React Router v7 with routes: `/`, `/projects/new`, `/projects/:id`, `/projects/:id/opportunities`
- Command center dashboard page (data grid layout)
- Project creation form page
- Opportunity list page
- Design tokens matching "Command Ops Dark" theme
- API client using Hono RPC or fetch wrapper
- `packages/ui` — shared component library setup

### Integration
After all 4 subtasks complete:
- Ensure cross-package imports compile
- Run full `turbo build` + `turbo lint` + `turbo typecheck`
- Run `turbo test`
- Boot docker-compose and verify all services start
- Run seed script, verify demo project appears
- Verify CI workflow matches

## Key Decisions

1. **Hono over Express/Fastify**: Smaller bundle, better TypeScript DX, RPC mode eliminates manual client typing. Source: https://hono.dev/docs/
2. **Drizzle over Prisma**: Zero runtime deps, SQL-first, faster cold starts, better for serverless future. Source: https://orm.drizzle.team/docs/overview
3. **BullMQ over custom**: Production-grade retry, cron, priorities, parent-child jobs — exactly what the worker needs. Source: https://docs.bullmq.io/
4. **pnpm over npm/yarn**: Strict dependency resolution, efficient disk usage, workspace protocol prevents phantom deps. Source: https://pnpm.io/workspaces
5. **Vitest over Jest**: Native ESM support, TypeScript without transform config, workspace mode, shares Vite config. No separate test infra needed.
6. **React Router v7 over TanStack Router**: More stable ecosystem, simpler mental model for a scaffolding project, still gets type safety. Source: https://reactrouter.com/

## Sources

- Turborepo: https://turborepo.dev/repo/docs
- Hono: https://hono.dev/docs/
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- BullMQ: https://docs.bullmq.io/
- shadcn/ui: https://ui.shadcn.com/docs/installation/vite
- pnpm workspaces: https://pnpm.io/workspaces
- React Router: https://reactrouter.com/
