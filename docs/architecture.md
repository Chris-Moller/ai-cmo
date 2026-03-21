# Architecture Overview

## System Diagram

```
                         ┌──────────────┐
                         │   Browser    │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │   apps/web   │
                         │  (Vite SPA)  │
                         └──────┬───────┘
                                │ HTTP
                         ┌──────▼───────┐
                    ┌────│   apps/api   │────┐
                    │    │   (Hono)     │    │
                    │    └──────────────┘    │
                    │                        │
             ┌──────▼───────┐        ┌──────▼───────┐
             │  PostgreSQL  │        │    Redis     │
             │    (DB)      │        │   (Queue)    │
             └──────▲───────┘        └──────┬───────┘
                    │                        │
                    │    ┌──────────────┐    │
                    └────│ apps/worker  │◄───┘
                         │  (BullMQ)   │
                         └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              ┌─────▼──┐ ┌─────▼──┐ ┌─────▼──┐
              │ Agent  │ │ Agent  │ │ Agent  │
              │  (1)   │ │  (2)   │ │ (...)  │
              └────────┘ └────────┘ └────────┘
```

**Data flow**: User action → Web SPA → API → enqueue job in Redis → Worker picks up job → Worker runs Agents → Agents write results to PostgreSQL → API reads from DB → Web SPA displays results.

## Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **API** | [Hono](https://hono.dev) v4 | Ultrafast (~400k ops/s), <14KB, built-in middleware (CORS, JWT, logging), first-class TypeScript types for routes, multi-runtime capable |
| **ORM** | [Drizzle](https://orm.drizzle.team) v0.45 | Zero-dependency, TypeScript-first schema definitions, SQL-like query builder, auto-migration generation via drizzle-kit |
| **Database** | PostgreSQL 16 | Industry-standard relational DB; identity columns over serial (modern PG best practice) |
| **Job Queue** | [BullMQ](https://docs.bullmq.io) v5 | Redis-backed, exactly-once semantics, scheduled/repeatable jobs, flows, retries with exponential backoff |
| **Frontend** | [Vite](https://vite.dev) 8 + React 19 | Rolldown-integrated build, native TypeScript/HMR, current stable React |
| **Routing** | [TanStack Router](https://tanstack.com/router) v1 | File-based routing with compile-time type safety for params/search, integrated devtools |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) v4 | Utility-first, JIT compiler, rapid prototyping |
| **Components** | [shadcn/ui](https://ui.shadcn.com) | Copy-paste component primitives built on Radix UI; customizable source code, not a dependency |
| **Monorepo** | pnpm 9 + [Turborepo](https://turborepo.dev) 2 | Content-addressable storage, strict node_modules, Rust-powered task runner with content-hashing cache |
| **Linting** | [Biome](https://biomejs.dev) | Fast Rust-based single tool replacing ESLint + Prettier |
| **Testing** | [Vitest](https://vitest.dev) | Vite-native test runner, same config as app build |

## Monorepo Structure

```
chief-mog-officer/
├── apps/
│   ├── web/              # React SPA (Vite + TanStack Router + Tailwind + shadcn)
│   ├── api/              # Hono HTTP API server (Node.js runtime)
│   └── worker/           # BullMQ job processor
├── packages/
│   ├── types/            # Shared domain types (@cmo/types) — zero dependencies
│   ├── db/               # Drizzle schema, migrations, connection, seed (@cmo/db)
│   ├── agents/           # Agent interface + 5 stub implementations (@cmo/agents)
│   ├── ui/               # Shared React component primitives (@cmo/ui)
│   ├── config/           # Environment validation with zod (@cmo/config)
│   └── lib/              # Shared utilities: logging, errors, date formatting (@cmo/lib)
├── docs/                 # Architecture and developer documentation
├── docker-compose.yml    # Local PostgreSQL + Redis
├── Dockerfile            # Multi-stage production build
├── turbo.json            # Turborepo task configuration
├── pnpm-workspace.yaml   # Workspace package definitions
├── biome.json            # Linting and formatting rules
└── tsconfig.base.json    # Shared TypeScript compiler options
```

### Package Dependency Graph

```
apps/web ──► @cmo/types, @cmo/ui
apps/api ──► @cmo/types, @cmo/db, @cmo/config, @cmo/lib, @cmo/agents
apps/worker ──► @cmo/types, @cmo/db, @cmo/config, @cmo/lib, @cmo/agents

@cmo/agents ──► @cmo/types
@cmo/db ──► @cmo/types, @cmo/config
@cmo/ui ──► (peer: react)
@cmo/config ──► (zod)
@cmo/lib ──► (pino)
@cmo/types ──► (no dependencies)
```

## Data Flow

### User-Triggered Analysis

1. User clicks "Analyze" on a project in the web app
2. Web app sends `POST /api/projects/:id/analyze` to the API
3. API validates the request and enqueues a `run-analysis` job in the `analysis` BullMQ queue (Redis)
4. API returns `202 Accepted` with `{ message: "Analysis enqueued", jobId: "..." }`
5. Worker picks up the job from Redis
6. Worker iterates over all registered agents, calling for each:
   - `agent.ingest(projectId)` — collect raw data
   - `agent.analyze(projectId)` — produce insights
   - `agent.generateOpportunities(projectId)` — create actionable items
   - `agent.summarize(projectId)` — generate text summary
7. Worker writes `AgentRun` records and `Opportunity` records to PostgreSQL
8. Web app polls or refreshes to display new opportunities

### Scheduled Daily Analysis

1. BullMQ scheduler triggers a `daily-analysis` repeatable job (cron-based)
2. Worker processes the job identically to a user-triggered analysis
3. Worker aggregates results into a `DailyDigest` record in PostgreSQL

## Security Considerations

- **Authentication**: Auth middleware placeholder returns a mock user in development. Production will use JWT-based authentication.
- **Environment validation**: All environment variables validated at startup via zod schemas (`@cmo/config`). Application fails fast on missing or invalid configuration.
- **Input validation**: API routes validate request bodies and parameters before processing.
- **Database**: Parameterized queries via Drizzle ORM prevent SQL injection.
- **CORS**: Hono CORS middleware configured to allow only expected origins.
- **Secrets management**: Sensitive values (database credentials, API keys) stored in environment variables, never committed to source control.

## Deployment Model

### Local Development

- **Docker Compose** provides PostgreSQL 16 and Redis 7 containers
- All apps run directly via `pnpm dev` (Turborepo orchestrates parallel startup)
- Hot-reload for frontend (Vite HMR), backend restarts via `tsx --watch`

### Production

- **Multi-stage Dockerfile** at repository root:
  1. **Base stage**: Node.js 20 + pnpm
  2. **Build stage**: Install dependencies, run `turbo run lint typecheck test build`
  3. **Runtime stage**: Minimal image with only built artifacts
- Target deployment: **Docker** containers, designed for platforms like Fly.io
- Database: Managed PostgreSQL (e.g., Fly Postgres, Neon, Supabase)
- Cache/Queue: Managed Redis (e.g., Fly Redis, Upstash)
