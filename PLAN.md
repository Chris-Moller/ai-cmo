# Chief MOG Officer — Implementation Plan

## Overview

Scaffold a TypeScript monorepo for the Chief MOG Officer MVP: an AI-powered competitive intelligence platform. This plan covers foundational scaffolding only — type stubs, mock implementations, and architectural wiring. No production business logic.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Monorepo | **Turborepo + pnpm workspaces** | Industry-standard TS monorepo tooling, incremental builds, task caching |
| API | **Hono** | TypeScript-first, lightweight, multi-runtime, excellent DX with typed routes |
| Frontend | **React 19 + Vite + React Router v7** | Modern SPA stack, file-based routing, fast HMR |
| Styling | **Tailwind CSS v4 + shadcn/ui** | Utility-first CSS + high-quality component primitives |
| Worker | **BullMQ** | Redis-backed job queue, cron scheduling, retries, concurrency control |
| ORM | **Drizzle ORM + drizzle-kit** | TypeScript-first, SQL-like queries, auto migration generation |
| Database | **PostgreSQL 16** | Production-grade relational DB, JSONB for flexible data |
| Validation | **Zod v4** | TypeScript-first schema validation, used across API + shared types |
| Env | **@t3-oss/env-core** | Type-safe env validation with Zod |
| Linting | **Biome** | Single tool for formatting + linting, 35x faster than ESLint+Prettier |
| Testing | **Vitest** | Vite-native test runner, fast, good monorepo support |
| Runtime | **Node.js 22 LTS** | Latest LTS, native TS support improving |

### Sources
- Hono docs: https://hono.dev/docs/getting-started/basic
- Drizzle ORM: https://orm.drizzle.team/docs/overview (v1.0 RC)
- BullMQ: https://docs.bullmq.io/
- shadcn/ui + Vite: https://ui.shadcn.com/docs/installation/vite
- Biome: https://biomejs.dev/ (v2.4)
- React Router v7: https://reactrouter.com/ (v7.13)
- Zod v4: https://zod.dev/
- t3-env: https://github.com/t3-oss/t3-env

## Design Direction: "Tactical Dark"

A command-center aesthetic befitting the "Chief MOG Officer" branding:
- **Palette**: Near-black backgrounds (#0a0a0f, #12121a), slate-700 surfaces, electric cyan (#00e5ff) primary accent, amber (#ffab00) warning/alert accent
- **Typography**: JetBrains Mono for headings/data, Inter for body text — technical, precise feel
- **Layout**: Dense dashboard grids, sidebar navigation, asymmetric panels for command center
- **Components**: Sharp corners (radius-sm), thin borders, subtle glow effects on interactive elements
- **Tone**: Military ops meets data analytics — no rounded pastel card soup

## Repository Structure

```
/
├── apps/
│   ├── web/                  # React SPA (Vite + React Router)
│   ├── api/                  # Hono REST API
│   └── worker/               # BullMQ job processor
├── packages/
│   ├── types/                # Shared domain types (Zod schemas + TS types)
│   ├── db/                   # Drizzle ORM schema, migrations, client, seed
│   ├── agents/               # Agent interface + 5 stub implementations
│   ├── config/               # Shared config, env validation
│   ├── ui/                   # Shared React components (shadcn/ui based)
│   └── lib/                  # Shared utilities (logging, error handling)
├── docs/                     # Architecture and setup documentation
├── docker-compose.yml        # Local dev (Postgres + Redis)
├── Dockerfile                # Production multi-stage build
├── turbo.json                # Turborepo pipeline config
├── biome.json                # Linting + formatting config
├── package.json              # Root workspace config
└── tsconfig.json             # Root TS config
```

## Domain Model

All types defined as Zod schemas in `packages/types/` with inferred TypeScript types:

| Entity | Key Fields |
|--------|-----------|
| **User** | id, email, name, role, createdAt |
| **Project** | id, name, description, userId, companyProfileId, status, createdAt |
| **CompanyProfile** | id, projectId, name, description, industry, website, positioning |
| **NarrativeModel** | id, projectId, core_narrative, key_themes, voice_attributes |
| **CompetitorProfile** | id, projectId, name, website, description, strengths, weaknesses |
| **Opportunity** | id, projectId, agentId, type, title, description, priority, status, metadata |
| **Asset** | id, opportunityId, type, content, status |
| **Campaign** | id, projectId, name, description, status, opportunities[] |
| **AgentRun** | id, projectId, agentName, status, startedAt, completedAt, result, error |
| **DailyDigest** | id, projectId, date, summary, highlights, agentRunIds |

## Agent Interface

```typescript
interface Agent {
  name: string;
  description: string;
  ingest(projectId: string, context: AgentContext): Promise<IngestResult>;
  analyze(projectId: string, data: IngestResult): Promise<AnalysisResult>;
  generateOpportunities(projectId: string, analysis: AnalysisResult): Promise<Opportunity[]>;
  summarize(projectId: string, opportunities: Opportunity[]): Promise<string>;
}
```

Five stub agents, each returning mock data:
1. **SearchMogAgent** — search trend analysis
2. **GeoAgent** — geographic market opportunities
3. **RedditMogAgent** — Reddit/community sentiment
4. **CompetitorIntelAgent** — competitor monitoring
5. **ContentFoundryAgent** — content opportunity generation

## API Routes (Hono)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project detail |
| POST | `/api/projects/:id/analyze` | Trigger analysis (enqueues worker job) |
| GET | `/api/projects/:id/opportunities` | List opportunities for project |

Auth: placeholder middleware that passes through (no real auth).

## Worker Jobs

| Job | Description |
|-----|-------------|
| `analysis.run` | Run all agents for a project, record AgentRun entries |
| `analysis.scheduled` | Cron-triggered daily analysis for active projects |

Mock implementation: jobs create AgentRun records with status transitions (pending → running → completed), sleep briefly, return mock data.

## Database

Drizzle ORM with PostgreSQL. Schema in `packages/db/src/schema/`. Migrations via `drizzle-kit generate` + `drizzle-kit migrate`.

Seed script creates one demo project with:
- A CompanyProfile
- A NarrativeModel
- 2 CompetitorProfiles
- 3 sample Opportunities
- 1 completed AgentRun

## CI Pipeline

Update `.github/workflows/ci.yml` to:
1. Install pnpm + Node 22
2. Install dependencies
3. Run `turbo lint` (Biome)
4. Run `turbo typecheck` (tsc --noEmit)
5. Run `turbo test` (Vitest)
6. Build all packages and apps

The existing Dockerfile check can be kept as a separate job or integrated.

## Parallel Execution Strategy

This task splits into **4 parallel subtasks**:

### Subtask 1: Foundation — Monorepo + Shared Packages
- Root config (package.json, turbo.json, tsconfig.json, biome.json)
- `packages/types` — all Zod schemas + inferred types
- `packages/db` — Drizzle schema, migration config, client, seed script
- `packages/agents` — agent interface + 5 stub implementations
- `packages/config` — env validation schemas
- `packages/lib` — logger, error classes

### Subtask 2: Backend — API + Worker
- `apps/api` — Hono server with all routes, middleware
- `apps/worker` — BullMQ processor with job handlers
- Both import from packages/types, packages/db, packages/agents

### Subtask 3: Frontend — Web Application
- `apps/web` — React + Vite + React Router + Tailwind + shadcn/ui
- App shell, layout, sidebar navigation
- Page shells: Command Center, Project Creation, Opportunity List
- Consumes packages/types for domain types
- Design tokens implementing "Tactical Dark" direction

### Subtask 4: DevOps + Docs
- `docker-compose.yml` (Postgres + Redis)
- `Dockerfile` (multi-stage production build)
- `.github/workflows/ci.yml` update
- `docs/` — architecture.md, domain-model.md, agent-interface.md, dev-setup.md
- Root `packages/ui` placeholder package

### Integration
After all subtasks complete, the integrator:
- Merges all branches
- Resolves any cross-package import issues
- Runs full `turbo build`, `turbo lint`, `turbo typecheck`, `turbo test`
- Verifies docker-compose up boots all services
- Runs seed script and verifies data
- Ensures CI workflow passes

## Key Decisions

1. **Hono over Express/Fastify**: Lighter weight, better TS inference for typed routes, multi-runtime capable. Express types are clunky; Fastify is heavier than needed for scaffolding.

2. **Drizzle over Prisma**: SQL-like API gives more control, better for complex queries later. No binary engine dependency. Faster cold starts.

3. **BullMQ over simple cron**: Real job queue with retries, concurrency, status tracking. Redis dependency is acceptable since it's already common infrastructure.

4. **Biome over ESLint+Prettier**: Single tool, dramatically faster, good enough rule coverage for a new project. One config file instead of three.

5. **React Router v7 over Next.js**: This is a dashboard SPA backed by a separate API. No SSR needed. React Router v7 with Vite gives us clean SPA routing without framework overhead.

6. **Monorepo over polyrepo**: Shared types/schemas across frontend, API, and worker is the primary driver. Turborepo makes the build fast.
