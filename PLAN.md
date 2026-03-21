# Chief MOG Officer — Implementation Plan

## Overview

Scaffold a production-grade monorepo for the "Chief MOG Officer" MVP — a competitive intelligence and marketing operations platform. This is foundational scaffolding: type definitions, stub endpoints, mock agents, page shells, database schema, and developer tooling. No business logic beyond stubs.

## Technology Stack

### Monorepo & Build
- **pnpm workspaces** (v10) — workspace linking via `workspace:*` protocol
- **Turborepo** (latest) — task orchestration, caching, parallelized builds
- **TypeScript 5.x** — strict mode, project references across packages
- Namespace: `@cmo/*` for all internal packages

*Rationale: pnpm + Turborepo is the lowest-friction, best-cached monorepo setup in 2026. No need for Nx complexity at this scale.*
*Source: [2026 TypeScript Monorepo guide](https://hsb.horse/en/blog/typescript-monorepo-best-practice-2026/), [pnpm workspaces](https://pnpm.io/workspaces)*

### Backend API (`apps/api`)
- **Hono v4.12** — ultrafast, TypeScript-native, Web Standards-based
- **@hono/node-server** — Node.js adapter
- **Zod v4** — request/response validation, shared with frontend
- Port: 4000

*Rationale: Hono is lightweight (~12kb), has excellent TS support, built-in middleware, and runs everywhere. Better DX than Express, lighter than Fastify for a scaffolding project.*
*Source: [Hono npm](https://www.npmjs.com/package/hono)*

### Worker (`apps/worker`)
- **BullMQ v5.71** — Redis-backed job queue with retries, scheduling, flows
- **ioredis** — Redis client (BullMQ dependency)
- Standalone Node.js process consuming from queues

*Rationale: BullMQ is the standard for Node.js background jobs. Redis-backed, battle-tested, supports cron schedules and retry with backoff.*
*Source: [BullMQ docs](https://docs.bullmq.io/)*

### Database
- **PostgreSQL 16** — via Docker Compose for local dev
- **Drizzle ORM v0.45** — schema-as-code, type-safe queries, lightweight
- **drizzle-kit** — migration generation and push

*Rationale: Drizzle is the go-to TypeScript ORM in 2026 — 7.4kb, zero deps, schema collocated with types. Generates clean SQL migrations.*
*Source: [Drizzle ORM](https://orm.drizzle.team/), [npm](https://www.npmjs.com/package/drizzle-orm)*

### Frontend (`apps/web`)
- **React 19 + TypeScript**
- **Vite 6** — dev server and build
- **React Router v7** — declarative mode (library, not framework)
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — component primitives (Button, Card, Table, etc.)
- Port: 5173 (dev)

*Rationale: React + Vite + Tailwind + shadcn is the dominant frontend stack. React Router v7 in library mode keeps it simple — no SSR needed for this MVP.*
*Source: [React Router docs](https://reactrouter.com/), [shadcn/ui Vite install](https://ui.shadcn.com/docs/installation/vite)*

### Design Direction: "Command Dark"

A dark-first, data-dense dashboard aesthetic inspired by Bloomberg Terminal meets modern SaaS. Not the default AI-slop centered-column-on-white.

- **Typography**: Space Grotesk (headings/display) + Inter (body/UI) + JetBrains Mono (data/metrics)
- **Color palette**: Slate-950 base, zinc-900 cards, emerald-400 primary accent, amber-400 warning, rose-400 alerts. No purple gradients.
- **Layout**: Full-width dashboard with sidebar navigation, dense data grids, asymmetric card layouts
- **Components**: shadcn/ui dark mode defaults, custom theme tokens

*Source: [Font pairing guide 2026](https://www.precode.co/insights/best-font-pairings-2026-beyond-google-fonts)*

### Shared Packages
- `packages/types` — Zod schemas + inferred TS types for all domain models
- `packages/db` — Drizzle schema, migrations, client factory, seed script
- `packages/config` — shared env validation (Zod), constants
- `packages/agents` — agent interface + 5 stub implementations
- `packages/lib` — shared utilities (logger, error types, ID generation)
- `packages/ui` — re-exported shadcn components + design tokens (future)

### DevEx
- **Biome** — linting + formatting (replaces ESLint + Prettier, faster)
- **Vitest** — test runner (native Vite integration)
- **Docker Compose** — PostgreSQL + Redis for local dev
- **Dockerfile** — multi-stage build for production (CI expects this)
- **GitHub Actions CI** — lint, typecheck, test, Docker build

## Directory Structure

```
├── apps/
│   ├── api/                  # Hono API server
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point
│   │   │   ├── routes/       # Route modules
│   │   │   ├── middleware/    # Auth placeholder, error handler
│   │   │   └── lib/          # API-specific helpers
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/                  # React SPA
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── routes/       # Page components
│   │   │   ├── components/   # Shared UI components
│   │   │   ├── lib/          # Frontend utils
│   │   │   └── styles/       # Tailwind config, tokens
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── worker/               # BullMQ worker process
│       ├── src/
│       │   ├── index.ts
│       │   ├── queues/       # Queue definitions
│       │   ├── processors/   # Job processors
│       │   └── lib/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── types/                # Zod schemas + TS types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── project.ts
│   │   │   ├── user.ts
│   │   │   ├── opportunity.ts
│   │   │   ├── agent.ts
│   │   │   └── ...
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── db/                   # Drizzle schema + migrations
│   │   ├── src/
│   │   │   ├── index.ts      # DB client factory
│   │   │   ├── schema/       # Table definitions
│   │   │   ├── migrate.ts    # Migration runner
│   │   │   └── seed.ts       # Seed script
│   │   ├── drizzle/          # Generated migrations
│   │   ├── drizzle.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/               # Env validation, constants
│   ├── agents/               # Agent interface + stubs
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── interface.ts  # Common agent contract
│   │   │   ├── registry.ts   # Agent registry
│   │   │   ├── search-mog.ts
│   │   │   ├── geo.ts
│   │   │   ├── reddit-mog.ts
│   │   │   ├── competitor-intel.ts
│   │   │   └── content-foundry.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── lib/                  # Shared utilities
│       ├── src/
│       │   ├── index.ts
│       │   ├── logger.ts
│       │   ├── errors.ts
│       │   └── id.ts
│       ├── package.json
│       └── tsconfig.json
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
├── tsconfig.base.json
├── biome.json
└── .github/workflows/ci.yml
```

## Domain Models

All defined as Zod schemas in `packages/types`, with inferred TypeScript types exported alongside.

| Model | Key Fields |
|---|---|
| User | id, email, name, role, createdAt |
| Project | id, name, description, companyProfileId, status, createdAt, updatedAt |
| CompanyProfile | id, projectId, name, industry, description, website, metadata |
| NarrativeModel | id, projectId, corePitch, audiences, keyMessages, tone |
| CompetitorProfile | id, projectId, name, website, description, strengths, weaknesses |
| Opportunity | id, projectId, agentId, type, title, description, score, status, metadata, createdAt |
| Asset | id, projectId, opportunityId, type, content, status, createdAt |
| Campaign | id, projectId, name, description, status, assets, startDate, endDate |
| AgentRun | id, projectId, agentId, status, startedAt, completedAt, result, error |
| DailyDigest | id, projectId, date, summary, opportunities, metrics |

## Agent Interface

```typescript
interface Agent {
  id: string;
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
2. **GeoAgent** — geographic market signals
3. **RedditMogAgent** — Reddit sentiment/discussion mining
4. **CompetitorIntelAgent** — competitor monitoring
5. **ContentFoundryAgent** — content opportunity generation

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| POST | /api/projects/:id/analyze | Trigger analysis (enqueues job) |
| GET | /api/projects/:id/opportunities | List opportunities |

## Worker Queues

- `analysis` — triggered manually or on schedule; runs all registered agents for a project
- `agent-run` — individual agent execution; created as child jobs by analysis processor

## Execution Strategy

**Mode: parallel** — This is a large scaffolding task with clearly separable modules:

1. **Shared packages + DB** — types, db schema, config, lib, agents packages — the foundation everything depends on
2. **Backend (API + Worker)** — Hono API routes, BullMQ worker, connected to shared packages
3. **Frontend** — React app shell, pages, routing, design tokens — depends on types package only
4. **DevEx + Docs** — Docker Compose, Dockerfile, CI, Biome config, architecture docs

Subtasks 2 and 3 can run in parallel after subtask 1. Subtask 4 can also run in parallel. An integration pass merges everything and ensures it all boots.

## Key Decisions

1. **Hono over Express/Fastify** — lighter, better TS inference on routes, Web Standards
2. **Drizzle over Prisma** — schema-as-code (not separate SDL), lighter, generates cleaner migrations
3. **BullMQ over custom** — production-grade job queue, no reason to build from scratch
4. **Biome over ESLint+Prettier** — single tool, much faster, good enough rule coverage
5. **React Router library mode** — no SSR needed, simpler than framework mode
6. **pnpm + Turborepo** — standard monorepo tooling, good caching for CI
7. **"Command Dark" design** — intentional aesthetic for a data intelligence product, avoids AI-slop defaults

## References

- [Hono v4.12 (npm)](https://www.npmjs.com/package/hono)
- [Drizzle ORM](https://orm.drizzle.team/)
- [BullMQ v5.71](https://docs.bullmq.io/)
- [pnpm workspaces](https://pnpm.io/workspaces)
- [Turborepo docs](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository)
- [shadcn/ui Vite installation](https://ui.shadcn.com/docs/installation/vite)
- [React Router v7 declarative mode](https://reactrouter.com/start/declarative/installation)
- [Zod v4](https://github.com/colinhacks/zod)
- [2026 TypeScript Monorepo guide](https://hsb.horse/en/blog/typescript-monorepo-best-practice-2026/)
- [Font pairing: Space Grotesk + Inter + JetBrains Mono](https://www.precode.co/insights/best-font-pairings-2026-beyond-google-fonts)
