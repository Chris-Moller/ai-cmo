# Architecture Overview

Chief MOG Officer is an AI-powered competitive intelligence platform built as a
TypeScript monorepo. It ingests market signals from multiple sources, runs them
through a pipeline of specialised AI agents, and surfaces actionable
opportunities to marketing and strategy teams.

---

## System Overview

```
                          +---------------------+
                          |    Web App (React)   |
                          |   Vite  :5173        |
                          +----------+----------+
                                     |
                                REST / JSON
                                     |
                          +----------v----------+
                          |   API Server (Hono)  |
                          |       :3001          |
                          +----+-----+-----+----+
                               |     |     |
                    +----------+     |     +----------+
                    |                |                |
              +-----v-----+   +-----v-----+   +-----v-----+
              | PostgreSQL |   |   Redis   |   |  Worker   |
              |   :5432    |   |   :6379   |   | (BullMQ)  |
              +-----+------+   +-----+-----+   +-----+-----+
                    |                |                |
                    |                +--------+-------+
                    |                         |
                    |               +---------v---------+
                    |               |    Agent Runner    |
                    |               +---------+---------+
                    |                         |
                    |          +--------------+--------------+
                    |          |        |        |           |
                    |     +----v--+ +---v---+ +-v------+ +--v-------+
                    |     |Search | | Geo   | |Reddit  | |Competitor|
                    |     | Mog   | | Agent | |  Mog   | |  Intel   |
                    |     +-------+ +-------+ +--------+ +----------+
                    |                                        |
                    |     +----------+                       |
                    +-----| Content  |<----------------------+
                          | Foundry  |
                          +----------+

  Data flows:
    Web  --(HTTP)--> API --(BullMQ)--> Worker --> Agents
    Agents --(Drizzle ORM)--> PostgreSQL
    API    --(Drizzle ORM)--> PostgreSQL
    Worker <--(job queue)---> Redis
```

**Key points:**

- The **Web App** communicates exclusively with the **API Server** over
  HTTP/JSON on port 3001.
- The **API Server** handles authentication, CRUD operations, and enqueues
  long-running analysis jobs into **Redis** via BullMQ.
- The **Worker** process dequeues jobs and orchestrates the five AI agents.
  Each agent follows a four-phase lifecycle (ingest, analyze, generate
  opportunities, summarize).
- **PostgreSQL** is the single source of truth for all domain data.
- **Redis** serves double duty as the BullMQ backing store and an optional
  cache layer for the API.

---

## Monorepo Structure

```
chief-mog-officer/
├── apps/
│   ├── api/           # Hono REST API server
│   ├── web/           # React + Vite frontend
│   └── worker/        # BullMQ job processor
├── packages/
│   ├── types/         # Shared TypeScript interfaces (zero runtime deps)
│   ├── config/        # Zod-validated environment config
│   ├── lib/           # Logger (pino) and shared error classes
│   ├── db/            # Drizzle ORM schema, migrations, seed, client
│   ├── agents/        # Agent interface, 5 stub agents, registry
│   └── ui/            # Shared React component library
├── docs/              # Architecture, domain model, agent interface, dev setup
├── docker-compose.yml # Local Postgres + Redis
├── turbo.json         # Turborepo pipeline configuration
├── pnpm-workspace.yaml
├── tsconfig.base.json # Shared TypeScript compiler options
├── eslint.config.mjs  # Flat ESLint config
├── .prettierrc        # Prettier formatting rules
└── vitest.workspace.ts
```

### Build Order

Packages are built in dependency order enforced by Turborepo:

```
types  (no internal deps)
  |
  +---> config  (depends on types)
  +---> lib     (depends on types)
  |       |
  +-------+---> db      (depends on types, config, lib)
  |                |
  +----------------+---> agents (depends on types)
```

---

## Tech Stack Rationale

| Layer        | Technology        | Why                                                                                                         |
| ------------ | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **API**      | Hono              | Lightweight, edge-ready, excellent TypeScript support. Middleware ecosystem covers auth, CORS, and logging.  |
| **Frontend** | React + Vite      | Industry-standard component model. Vite provides sub-second HMR and fast production builds.                 |
| **ORM**      | Drizzle ORM       | Type-safe SQL with zero codegen. Schema-as-code aligns with the monorepo's "everything in TypeScript" goal. |
| **Queue**    | BullMQ            | Battle-tested Redis-backed job queue. Supports retries, rate limiting, and delayed jobs out of the box.     |
| **Logging**  | pino              | Fastest structured JSON logger for Node.js. Low overhead in production, pretty-printing in development.     |
| **Validation** | Zod             | Runtime schema validation that infers TypeScript types. Used in config, API request parsing, and agents.    |
| **Database** | PostgreSQL 16     | Robust relational store with native JSON, full-text search, and excellent extension ecosystem.               |
| **Cache / Queue Store** | Redis 7 | In-memory data structure store shared between BullMQ and optional API-level caching.                      |
| **Build**    | Turborepo         | Incremental builds with intelligent caching. Understands the package dependency graph automatically.        |
| **Package Manager** | pnpm       | Strict dependency resolution, workspace protocol, and disk-efficient storage.                               |
| **Testing**  | Vitest            | Vite-native test runner. Shared workspace config runs tests across all packages in parallel.                |
| **Linting**  | ESLint 9 (flat config) | New flat config format with `typescript-eslint` v8 and `eslint-config-prettier` integration.          |
| **Formatting** | Prettier        | Opinionated formatter that removes style debates. Enforced in CI via `format:check`.                       |

---

## Data Flow

A typical analysis run follows this path:

### 1. User triggers analysis

The user opens the web dashboard, selects a project, and clicks "Run Analysis".
The React frontend sends a `POST /api/projects/:id/runs` request to the API
server.

### 2. API enqueues a job

The Hono API server validates the request (Zod), creates an `AgentRun` record
in PostgreSQL with status `pending`, and pushes a job onto the `agent-runs`
BullMQ queue in Redis. It returns the `AgentRun` ID to the frontend immediately
so the UI can poll or subscribe for updates.

### 3. Worker picks up the job

The Worker process (a long-running Node.js service) listens on the `agent-runs`
queue. When it dequeues a job it:

1. Updates the `AgentRun` status to `running`.
2. Looks up the requested agent in the **Agent Registry**.
3. Executes the agent's four-phase lifecycle in order.

### 4. Agent lifecycle

Each agent implements the `Agent` interface:

```
ingest()  -->  analyze()  -->  generateOpportunities()  -->  summarize()
```

- **ingest**: Fetches raw data from external sources (APIs, scrapers, feeds).
  Returns a count of data points and their source URLs.
- **analyze**: Processes ingested data, identifies patterns, scores relevance.
  Returns structured insights and a confidence score.
- **generateOpportunities**: Translates insights into actionable `Opportunity`
  records ready for human review.
- **summarize**: Produces a natural-language summary of the run for the daily
  digest.

### 5. Results stored in DB

Agent outputs are written to PostgreSQL via Drizzle ORM:

- New `Opportunity` rows linked to the project.
- The `AgentRun` row is updated with the result payload, completion timestamp,
  and status `completed` (or `failed` with an error message).
- If all agents for the day have finished, a `DailyDigest` row is created
  aggregating the summaries.

### 6. API serves results to frontend

The frontend polls `GET /api/projects/:id/runs/:runId` (or receives a
WebSocket/SSE push) to get the current status. Once complete it fetches:

- The list of new opportunities (`GET /api/projects/:id/opportunities`)
- The daily digest (`GET /api/projects/:id/digests/latest`)
- Updated competitor profiles and campaign suggestions

---

## Deployment Model

### Local Development

Local development uses Docker Compose to run infrastructure services while
application code runs natively via `pnpm dev`:

```
docker compose up -d     # Starts Postgres (5432) + Redis (6379)
pnpm dev                 # Starts API (:3001), Web (:5173), Worker concurrently
```

Both Postgres and Redis have health checks configured so dependent services
can wait for readiness.

### Production

Production deployments use a multi-stage Dockerfile pattern:

```dockerfile
# Stage 1 — Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/*/package.json ...
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2 — Build
FROM deps AS build
COPY . .
RUN pnpm build

# Stage 3 — Runtime (per app)
FROM node:22-alpine AS runtime
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

Each app (`api`, `web`, `worker`) gets its own container image. Infrastructure
(Postgres, Redis) is expected to be managed externally (e.g., AWS RDS, ElastiCache,
or a managed Kubernetes cluster).

### Environment-based configuration

All runtime configuration flows through environment variables validated by
`@chief-mog-officer/config` (Zod). There are no hardcoded connection strings or
magic numbers in application code.

| Variable       | Description                          | Default       |
| -------------- | ------------------------------------ | ------------- |
| `NODE_ENV`     | Runtime environment                  | `development` |
| `DATABASE_URL` | PostgreSQL connection string         | (required)    |
| `REDIS_URL`    | Redis connection string              | (required)    |
| `API_PORT`     | Port for the Hono API server         | `3001`        |
| `WEB_PORT`     | Port for the Vite dev server         | `5173`        |
