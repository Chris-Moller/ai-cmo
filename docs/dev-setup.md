# Developer Setup Guide

Get the Chief MOG Officer platform running locally from a fresh clone.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 20.19+ | [nodejs.org](https://nodejs.org/) or via `nvm install 20` |
| **pnpm** | 9+ | `corepack enable && corepack prepare pnpm@9 --activate` |
| **Docker** | 20+ | [docker.com](https://www.docker.com/get-started/) |
| **Docker Compose** | v2+ | Included with Docker Desktop |

Verify your setup:

```bash
node --version    # v20.19.0 or higher
pnpm --version    # 9.x
docker --version  # 20.x or higher
docker compose version  # v2.x
```

## Clone and Install

```bash
git clone <repository-url> chief-mog-officer
cd chief-mog-officer
pnpm install
```

This installs all workspace dependencies across `apps/` and `packages/`. pnpm's content-addressable storage means shared dependencies are only downloaded once.

## Start Infrastructure

Start PostgreSQL and Redis via Docker Compose:

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5432` (user: `cmo`, password: `cmo_dev`, database: `cmo_dev`)
- **Redis 7** on `localhost:6379`

Verify containers are running:

```bash
docker compose ps
```

## Configure Environment

Copy the example environment file and adjust if needed:

```bash
cp .env.example .env
```

Default values in `.env.example`:

```env
DATABASE_URL=postgres://cmo:cmo_dev@localhost:5432/cmo_dev
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

The defaults work with the Docker Compose configuration — no changes needed for local development.

## Run Database Migrations

Apply the Drizzle schema to PostgreSQL:

```bash
pnpm db:migrate
```

This runs all pending migrations from `packages/db/drizzle/`.

## Seed Data (Optional)

Populate the database with sample data for development:

```bash
pnpm db:seed
```

This creates sample users, projects, and opportunities for testing.

## Start Development

Start all applications simultaneously:

```bash
pnpm dev
```

Turborepo runs all `dev` scripts in parallel:

| App | URL | Description |
|-----|-----|-------------|
| **Web** | `http://localhost:5173` | React SPA with hot-reload |
| **API** | `http://localhost:3001` | Hono API server |
| **Worker** | (background) | BullMQ job processor |

The web app and API server support hot-reload — changes are reflected immediately.

## Individual App Commands

Run commands for a specific app using pnpm's `--filter` flag:

```bash
# Start only the web app
pnpm --filter @cmo/web dev

# Start only the API server
pnpm --filter @cmo/api dev

# Start only the worker
pnpm --filter @cmo/worker dev
```

## Build

Build all packages and apps:

```bash
pnpm build
```

Build a specific package:

```bash
pnpm --filter @cmo/agents build
pnpm --filter @cmo/types build
```

## Running Tests

Run the full test suite:

```bash
pnpm test
```

Run tests for a specific package:

```bash
pnpm --filter @cmo/agents test
pnpm --filter @cmo/api test
```

Run tests in watch mode:

```bash
pnpm --filter @cmo/api test -- --watch
```

## Linting

Lint all packages (powered by Biome):

```bash
pnpm lint
```

Auto-fix linting issues:

```bash
pnpm lint -- --apply
```

## Type Checking

Check TypeScript types across all packages:

```bash
pnpm typecheck
```

Check a specific package:

```bash
pnpm --filter @cmo/agents typecheck
```

## Project Structure

```
chief-mog-officer/
├── apps/
│   ├── web/              # React frontend (Vite + TanStack Router + Tailwind)
│   ├── api/              # HTTP API (Hono on Node.js)
│   └── worker/           # Background job processor (BullMQ)
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── db/               # Database schema and migrations (Drizzle)
│   ├── agents/           # Agent interface and implementations
│   ├── ui/               # Shared React UI components
│   ├── config/           # Environment configuration (zod)
│   └── lib/              # Shared utilities (logging, errors)
├── docs/                 # Architecture documentation
├── docker-compose.yml    # Local infrastructure
└── Dockerfile            # Production build
```

## Common Issues

### Port already in use

If you see `EADDRINUSE`, another process is using the port:

```bash
# Find what's using port 3001
lsof -i :3001
# Kill the process
kill -9 <PID>
```

### Docker containers won't start

Ensure Docker is running, then try recreating:

```bash
docker compose down
docker compose up -d
```

### Database connection errors

Verify PostgreSQL is running and the connection string is correct:

```bash
docker compose ps           # Check container status
docker compose logs postgres  # Check PostgreSQL logs
```

### pnpm install fails

Clear the store and retry:

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### TypeScript errors after pulling

Rebuild all packages to regenerate declaration files:

```bash
pnpm build
```

### Migrations fail

Ensure the database exists and is accessible:

```bash
# Connect to PostgreSQL directly
docker compose exec postgres psql -U cmo -d cmo_dev
```

If the database is corrupted during development, reset it:

```bash
docker compose down -v   # Remove volumes (destroys data)
docker compose up -d     # Recreate with fresh database
pnpm db:migrate          # Re-apply migrations
pnpm db:seed             # Re-seed data
```
