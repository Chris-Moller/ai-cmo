# Chief MOG Officer — Scaffold Implementation Plan

## Overview

Greenfield monorepo scaffold for the Chief MOG Officer MVP — an AI-powered competitive intelligence and content strategy platform. This plan covers the complete base framework: monorepo structure, domain models, API, worker, agents, frontend, database, developer experience, and documentation.

## Tech Stack Decisions

### Monorepo: Turborepo + pnpm workspaces
- **Turborepo v2.8.20** — high-performance build orchestration with caching, task parallelization, and minimal config. Uses `turbo.json` declarative pipeline.
- **pnpm v10.33** — fast, disk-efficient package manager with native workspace support. Available in sandbox.
- Rationale: Turborepo + pnpm is the de facto standard for TypeScript monorepos. Zero-config task graph, remote caching, and incremental builds.

### Backend API: Hono v4
- **Hono v4.12.9** on **@hono/node-server v1.19.11** — ultrafast (402k ops/sec), <14KB, first-class TypeScript with literal type inference for routes.
- **Zod v4.3.6** + **@hono/zod-validator v0.7.6** — request/response validation with type inference.
- Rationale: Hono is the modern choice for TypeScript APIs — lighter than Fastify, better TS support than Express, runs everywhere (Node, Bun, edge). Perfect for this kind of API-first architecture.

### Database: PostgreSQL + Drizzle ORM
- **Drizzle ORM v0.45.1** + **drizzle-kit v0.31.10** — zero-dependency TypeScript ORM with SQL-first design, automatic migrations, and full type inference.
- **postgres v3.4.8** (pg driver) — modern PostgreSQL client for Node.js.
- **drizzle-zod v0.8.3** — auto-generate Zod schemas from Drizzle table definitions.
- PostgreSQL via Docker Compose for local dev.
- Rationale: Drizzle gives us type-safe queries without the overhead of Prisma's code generation step. Schema-as-code in TypeScript means our domain model types and DB schema stay in sync.

### Worker/Jobs: BullMQ v5
- **BullMQ v5.71.0** — Redis-backed job queue with priorities, scheduling, retries, parent-child jobs, and polling-free design.
- Redis via Docker Compose for local dev (shared with potential future caching).
- Rationale: BullMQ is the standard Node.js job queue. Cron scheduling, retry policies, and distributed workers are built in — exactly what we need for scheduled daily agent runs and manual analysis triggers.

### Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui + React Router v7
- **React v19.2.4** + **Vite v8.0.2** — fast dev server with HMR, native TypeScript, modern bundling.
- **Tailwind CSS v4.2.2** — utility-first CSS (v4 with new @theme directive and automatic content detection).
- **shadcn/ui** — copy-owned component library built on Radix UI primitives. Not a dependency — components are scaffolded into the codebase.
- **React Router v7.13.2** in declarative mode — mature routing with loaders, nested routes, error boundaries.
- **Design direction: "Command Dark"** — dark-dominant UI with sharp geometric accents, monospace display headings (JetBrains Mono), clean sans-serif body (Inter), high-contrast data surfaces, muted backgrounds (#0a0a0f / #12121a), accent colors: electric blue (#3b82f6) + signal green (#22c55e). Think Bloomberg terminal meets modern dashboard.

### Testing: Vitest v4
- **Vitest v4.1.1** — Vite-native test runner, Jest-compatible API, fast TypeScript support.
- Rationale: Native Vite integration means zero config for path aliases, TypeScript, and module resolution across the monorepo.

### Developer Experience
- **TypeScript v5** — strict mode across all packages.
- **Biome** — fast linter + formatter (replaces ESLint + Prettier, single tool).
- **tsx v4.21.0** — TypeScript execution for scripts and dev servers.
- **Docker Compose** — PostgreSQL + Redis for local dev.
- **dotenv + zod** — env validation at startup.
- **.github/workflows/ — NOT MODIFIED** (constraint: agent fork token lacks workflow scope).

## Architecture

```
ai-cmo/
├── apps/
│   ├── web/          # React + Vite frontend
│   ├── api/          # Hono API server
│   └── worker/       # BullMQ worker process
├── packages/
│   ├── types/        # Shared domain types (TypeScript interfaces + Zod schemas)
│   ├── config/       # Shared configuration (env validation, constants)
│   ├── db/           # Drizzle ORM schemas, migrations, client, seed
│   ├── agents/       # Agent interface contract + stub implementations
│   ├── ui/           # Shared UI components (shadcn/ui based)
│   └── lib/          # Shared utilities (logger, error types, helpers)
├── docs/             # Architecture documentation
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json      # Root workspace config
├── tsconfig.base.json
├── biome.json
└── Dockerfile
```

### Domain Model (packages/types)

| Entity | Purpose |
|---|---|
| User | Auth identity, project ownership |
| Project | Top-level container for a company/brand being analyzed |
| CompanyProfile | Company metadata, narrative, positioning |
| NarrativeModel | Brand story structure, key messages, tone |
| CompetitorProfile | Competitor data and tracking config |
| Opportunity | Discovered marketing/content opportunity |
| Asset | Generated content asset (copy, image, etc.) |
| Campaign | Group of assets for a coordinated push |
| AgentRun | Execution record for an agent job |
| DailyDigest | Aggregated daily summary per project |

### Agent Interface (packages/agents)

```typescript
interface Agent {
  id: string;
  name: string;
  ingest(project: Project): Promise<IngestResult>;
  analyze(project: Project, data: IngestResult): Promise<AnalysisResult>;
  generateOpportunities(analysis: AnalysisResult): Promise<Opportunity[]>;
  summarize(analysis: AnalysisResult): Promise<string>;
}
```

Five stub agents:
1. **SearchMogAgent** — search trend analysis
2. **GeoAgent** — geographic/local opportunity detection
3. **RedditMogAgent** — Reddit discussion monitoring
4. **CompetitorIntelAgent** — competitor activity tracking
5. **ContentFoundryAgent** — content generation/repurposing

All return mock data for scaffolding phase.

### API Routes (apps/api)

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| POST | /api/projects/:id/analyze | Trigger analysis |
| GET | /api/projects/:id/opportunities | List opportunities |

### Worker Jobs (apps/worker)

| Job | Schedule | Description |
|---|---|---|
| daily-analysis | Cron (mock) | Run all agents for all active projects |
| manual-analysis | On-demand | Run agents for a specific project |
| agent-execution | Sub-job | Execute a single agent for a project |

### Frontend Routes (apps/web)

| Path | Page | Description |
|---|---|---|
| / | Command Center | Dashboard overview |
| /projects/new | Project Creation | New project form |
| /projects/:id | Project Detail | Single project view |
| /opportunities | Opportunity List | All opportunities |

## Task Decomposition

### Task 1: Platform (monorepo + shared packages + API + worker + DB + docs + devex)

The "everything except the web frontend" task. This establishes the monorepo skeleton, all shared packages (types, config, db, agents, lib), the Hono API server, the BullMQ worker, database schema + migrations + seed, Docker Compose, developer tooling (Biome, Vitest, env validation), and architecture documentation.

This is a single large task because the API, worker, DB, and shared packages are deeply interconnected — they share the same Drizzle schemas, agent interfaces, and type definitions. Splitting them would create constant merge conflicts and interface mismatches.

### Task 2: Frontend (web app + UI package)

The React + Vite + Tailwind frontend with shadcn/ui components, routing, page shells, design tokens, and the shared UI package. Depends on the types package interface (imported as workspace dependency) but is otherwise independent — API calls are stubbed with mock data.

### Integration

After both tasks complete, the integrator merges them, ensures the frontend correctly imports shared types, API client types match actual API routes, and end-to-end flow works (seed → API → frontend displays data).

## Constraints

- **No .github/workflows/ modifications** — agent fork token lacks `workflow` scope. CI requirements (AC #11) will be documented but not implemented as workflow changes.
- **No dependency installation** — init.sh handles this; implementers use it.
- **SQLite for simplicity** — Actually, sticking with PostgreSQL via Docker as specified in the task description for production-readiness. Docker is available in the sandbox.

## Sources

- Hono docs: https://hono.dev/docs/
- Drizzle ORM docs: https://orm.drizzle.team/docs/overview
- BullMQ docs: https://docs.bullmq.io/
- Turborepo docs: https://turborepo.dev/docs
- shadcn/ui docs: https://ui.shadcn.com/docs
- React Router docs: https://reactrouter.com/
- Vitest docs: https://vitest.dev/
- Tailwind CSS v4: https://tailwindcss.com/docs
