# Chief MOG Officer — Implementation Plan

## Overview

Scaffold a full TypeScript monorepo for the "Chief MOG Officer" MVP — a competitive intelligence platform powered by AI agents. This plan covers foundational structure only: monorepo tooling, domain types, API/worker/frontend shells, database schema, agent contracts, docs, and developer experience.

## Tech Stack Decisions

### Monorepo: pnpm + Turborepo

- **pnpm** (v9+): Content-addressable storage, strict node_modules (prevents phantom deps), native workspace protocol (`workspace:*`), ~2M weekly downloads.
- **Turborepo** (v2.1): Rust-powered task runner with content-hashing cache, parallel execution, composable config. Minimal config overhead vs Nx.
- Source: [Turborepo docs](https://turborepo.dev/repo/docs), [pnpm workspaces](https://pnpm.io/workspaces)

### Backend API: Hono

- **Hono** (v4): Ultrafast (400k ops/s), <14KB minified, multi-runtime (Node, Bun, CF Workers, Deno), built-in middleware (CORS, JWT, logging), first-class TypeScript typing for routes.
- Runs on Node.js with `@hono/node-server` adapter.
- Source: [Hono docs](https://hono.dev/docs/)

### Worker / Job Queue: BullMQ

- **BullMQ** (v5.71): Redis-backed, exactly-once semantics, scheduled/repeatable jobs, flows, global concurrency, retries with backoff. The standard for Node.js job queues.
- Source: [BullMQ docs](https://docs.bullmq.io/)

### ORM: Drizzle

- **Drizzle ORM** (v0.45): Zero-dependency (~7.4KB), TypeScript-first schema definitions, SQL-like query builder, auto-migration generation via `drizzle-kit`. PostgreSQL with `postgres` (postgres.js) driver.
- Identity columns over serial (modern PG best practice).
- Source: [Drizzle docs](https://orm.drizzle.team/docs/overview)

### Database: PostgreSQL

- PostgreSQL 16 via Docker for local dev. Drizzle migrations for schema management.

### Frontend: React + Vite + TanStack Router + Tailwind + shadcn/ui

- **Vite** (v8): Rolldown-integrated build, 40x faster than CRA, native TypeScript/HMR.
- **React** (v19): Current stable.
- **TanStack Router** (v1): File-based routing with compile-time type safety for params/search, integrated devtools. Superior DX over React Router for SPAs.
- **Tailwind CSS** (v4): Utility-first, JIT compiler.
- **shadcn/ui**: Copy-paste component primitives built on Radix UI. Customizable source code, not a dependency.
- Source: [Vite 8 announcement](https://vite.dev/blog/announcing-vite8), [TanStack Router](https://tanstack.com/router/latest), [shadcn/ui](https://ui.shadcn.com/docs)

### Design Direction: "Dark Command Center"

A dense, information-rich dashboard aesthetic — think Bloomberg terminal meets modern SaaS.

- **Typography**: Space Grotesk (headings/display) + General Sans (body) — both free, distinctive without being eccentric.
- **Color palette**: Near-black backgrounds (`#0A0A0F`, `#12121A`), cool slate grays for surfaces, electric cyan (`#00E5FF`) as primary accent, amber (`#F59E0B`) as warning/secondary accent, red (`#EF4444`) for destructive actions.
- **Layout**: Full-bleed sidebar nav, content area with asymmetric card grids, data-dense tables, status indicators.
- **Micro-details**: Subtle borders (1px, `rgba(255,255,255,0.06)`), backdrop blur on overlays, monospace numbers in data displays (JetBrains Mono for metrics).

### Runtime & Tooling

- **Node.js** 20.19+ (required by Vite 8)
- **TypeScript** 5.5+
- **Biome** for linting + formatting (fast Rust-based, single tool replaces ESLint + Prettier)
- **Vitest** for unit tests (Vite-native, same config)
- **Docker Compose** for local PostgreSQL + Redis
- **tsx** for running TypeScript directly (scripts, seeds)

## Architecture

```
chief-mog-officer/
├── apps/
│   ├── web/           # React SPA (Vite + TanStack Router + Tailwind + shadcn)
│   ├── api/           # Hono HTTP API (Node.js)
│   └── worker/        # BullMQ worker process
├── packages/
│   ├── types/         # Shared domain types (zero-dep, pure TS)
│   ├── db/            # Drizzle schema, migrations, connection, seed
│   ├── agents/        # Agent interface + stub implementations
│   ├── ui/            # Shared React components (shadcn-based)
│   ├── config/        # Shared env validation (zod), constants
│   └── lib/           # Shared utilities (logging, errors, date formatting)
├── docs/
│   ├── architecture.md
│   ├── domain-model.md
│   ├── agent-interface.md
│   └── dev-setup.md
├── docker-compose.yml
├── Dockerfile
├── turbo.json
├── pnpm-workspace.yaml
├── biome.json
├── tsconfig.base.json
└── package.json
```

### Domain Models (packages/types)

All types are TypeScript interfaces/types exported from `@cmo/types`:

- **Project**: Core entity — a company being tracked. Has name, domain, description, status.
- **CompanyProfile**: Enriched company data (industry, size, positioning, narrative).
- **NarrativeModel**: The company's core messaging framework (value props, differentiators, tone).
- **CompetitorProfile**: A tracked competitor (name, domain, strengths, weaknesses).
- **Opportunity**: An actionable insight surfaced by agents (type, source, priority, status).
- **Asset**: A generated content asset (blog draft, social post, etc.).
- **Campaign**: A collection of assets targeting an opportunity.
- **AgentRun**: Execution record for an agent run (agent name, status, started/finished timestamps, results).
- **DailyDigest**: Aggregated daily summary of opportunities and agent runs.
- **User**: Auth identity (id, email, name, role).

### Agent Interface (packages/agents)

```typescript
interface Agent {
  name: string;
  description: string;
  ingest(projectId: string): Promise<IngestResult>;
  analyze(projectId: string): Promise<AnalysisResult>;
  generateOpportunities(projectId: string): Promise<Opportunity[]>;
  summarize(projectId: string): Promise<string>;
}
```

Five stub agents:
1. **SearchMogAgent** — Search trend analysis
2. **GeoAgent** — Geographic/local market intelligence
3. **RedditMogAgent** — Reddit sentiment and discussion analysis
4. **CompetitorIntelAgent** — Competitor activity monitoring
5. **ContentFoundryAgent** — Content gap and creation opportunities

Each returns mock data conforming to the interface.

### API Routes (apps/api)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| POST | `/api/projects/:id/analyze` | Trigger analysis (enqueues worker job) |
| GET | `/api/projects/:id/opportunities` | List opportunities |

Auth middleware placeholder (returns mock user).

### Worker (apps/worker)

- Connects to Redis via BullMQ
- Registers queue: `analysis`
- Job types: `run-analysis` (manual trigger), `daily-analysis` (scheduled)
- Job processor: iterates registered agents, calls each, records AgentRun in DB
- Scheduler: cron-based daily run (mock — just enqueues the job)
- Error handling: BullMQ retry with exponential backoff

### Frontend Pages (apps/web)

- `/` — Command Center (dashboard shell with project selector, opportunity summary, agent status)
- `/projects/new` — Project Creation (form with name, domain, description)
- `/projects/:id/opportunities` — Opportunity List (table/cards showing surfaced opportunities)
- Layout: sidebar nav + top bar + content area

### Database Schema (packages/db)

PostgreSQL tables via Drizzle:

- `users` (id, email, name, role, created_at, updated_at)
- `projects` (id, user_id FK, name, domain, description, status, created_at, updated_at)
- `company_profiles` (id, project_id FK, industry, size, positioning, narrative, created_at, updated_at)
- `competitor_profiles` (id, project_id FK, name, domain, strengths, weaknesses, created_at, updated_at)
- `opportunities` (id, project_id FK, agent_name, type, title, description, source, priority, status, created_at, updated_at)
- `assets` (id, opportunity_id FK, type, title, content, status, created_at, updated_at)
- `campaigns` (id, project_id FK, title, description, status, created_at, updated_at)
- `campaign_assets` (campaign_id FK, asset_id FK) — join table
- `agent_runs` (id, project_id FK, agent_name, status, started_at, finished_at, result_summary, error, created_at)
- `daily_digests` (id, project_id FK, date, summary, opportunity_count, created_at)

Indexes on foreign keys and common query patterns (project_id, status, date).

### Dockerfile

Multi-stage build:
1. Base: Node 20 + pnpm
2. Build: install deps, build all apps
3. Runtime: minimal image with built artifacts

The Dockerfile must exist at root (CI expects `docker build .`).

### CI Integration

The existing CI workflow expects `docker build .` to succeed. The Dockerfile will:
- Install pnpm + turbo
- Install dependencies
- Run `turbo run lint typecheck test build`
- Copy built artifacts for runtime

## Module Boundaries for Parallel Implementation

This task naturally splits into 4 parallel subtasks:

### Subtask 1: Monorepo Foundation + Shared Packages
- Root config (package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json, biome.json)
- `packages/types` — all domain type definitions
- `packages/config` — env validation with zod
- `packages/lib` — logger, error classes, date utils
- `packages/db` — Drizzle schema, migrations, connection, seed script
- `docker-compose.yml` (PostgreSQL + Redis)
- Root Dockerfile (multi-stage)

### Subtask 2: Backend (API + Worker)
- `apps/api` — Hono server with all routes, middleware, typed request/response
- `apps/worker` — BullMQ worker with job processors, scheduler
- Both consume `@cmo/types`, `@cmo/db`, `@cmo/config`, `@cmo/lib`

### Subtask 3: Frontend + UI Package
- `apps/web` — Vite + React + TanStack Router + Tailwind + shadcn
- `packages/ui` — shared component primitives
- All page shells, layout, design tokens, routing

### Subtask 4: Agent Package + Documentation
- `packages/agents` — interface definition, 5 stub agents, registry
- `docs/` — architecture.md, domain-model.md, agent-interface.md, dev-setup.md

## Key Risks & Mitigations

1. **Dockerfile must pass CI**: Build early, test `docker build .` before finalizing.
2. **Cross-package imports**: Use `workspace:*` protocol and TypeScript path aliases consistently.
3. **BullMQ needs Redis**: Docker Compose provides it; worker gracefully handles connection failure.
4. **Vite monorepo config**: Use `--configLoader runner` if needed for TS config resolution.

## Sources

- [Turborepo docs](https://turborepo.dev/repo/docs)
- [pnpm workspaces](https://pnpm.io/workspaces)
- [Hono framework](https://hono.dev/docs/)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [BullMQ](https://docs.bullmq.io/)
- [Vite 8](https://vite.dev/blog/announcing-vite8)
- [TanStack Router](https://tanstack.com/router/latest)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Biome](https://biomejs.dev/)
