# Developer Setup Guide

This guide walks you through setting up a local development environment for
Chief MOG Officer from a clean machine.

---

## Prerequisites

You need the following installed before you begin:

| Tool               | Minimum Version | Installation                                              |
| ------------------ | --------------- | --------------------------------------------------------- |
| **Node.js**        | 22.x            | [nodejs.org](https://nodejs.org/) or use `nvm install 22` |
| **pnpm**           | 9.x             | `corepack enable` (ships with Node 22)                    |
| **Docker**         | 24.x            | [docker.com](https://docs.docker.com/get-docker/)         |
| **Docker Compose** | 2.x             | Included with Docker Desktop; or install the plugin       |

Verify your installation:

```bash
node --version     # Should print v22.x.x or higher
pnpm --version     # Should print 9.x.x or higher
docker --version   # Should print Docker version 24.x or higher
docker compose version   # Should print v2.x.x or higher
```

---

## Step-by-Step Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/chief-mog-officer.git
cd chief-mog-officer
```

### 2. Install dependencies

```bash
pnpm install
```

This installs all workspace dependencies. pnpm uses a content-addressable store
so subsequent installs are fast. The workspace protocol (`workspace:*`) links
internal packages automatically.

### 3. Configure environment variables

```bash
cp .env.example .env
```

The `.env.example` file contains sensible defaults for local development. Review
it and adjust values if needed (see [Environment Variables](#environment-variables)
below).

### 4. Start infrastructure services

```bash
docker compose up -d
```

This starts PostgreSQL and Redis in the background. Both services have health
checks configured, so they will report as "healthy" once fully ready.

Verify they are running:

```bash
docker compose ps
```

You should see both `postgres` and `redis` with status `Up (healthy)`.

### 5. Generate database schema

```bash
pnpm db:generate
```

This runs `drizzle-kit generate` to produce SQL migration files from the Drizzle
schema definitions in `packages/db/src/schema/`.

### 6. Run database migrations

```bash
pnpm db:migrate
```

This applies all pending migrations to the local PostgreSQL database, creating
tables, indexes, and enum types.

### 7. Seed the database

```bash
pnpm db:seed
```

This populates the database with demo data:

- One demo user
- One demo project
- A company profile
- Two competitor profiles
- Two sample opportunities
- One agent run record

### 8. Start development servers

```bash
pnpm dev
```

This uses Turborepo to start all applications concurrently:

- **API server** on [http://localhost:3001](http://localhost:3001)
- **Web app** on [http://localhost:5173](http://localhost:5173)
- **Worker** process (listens for BullMQ jobs)

All three processes support hot-reload. Code changes in `packages/` will
trigger rebuilds of dependent apps automatically.

---

## Available Scripts

Run these from the repository root using `pnpm <script>`:

| Script           | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `dev`            | Start all apps and packages in development mode with hot-reload.     |
| `build`          | Build all packages and apps in dependency order.                     |
| `lint`           | Run ESLint across the entire monorepo.                               |
| `typecheck`      | Run the TypeScript compiler in check mode (no emit) for all packages.|
| `test`           | Run Vitest across the entire workspace.                              |
| `db:generate`    | Generate Drizzle migration files from schema changes.                |
| `db:migrate`     | Apply pending migrations to the database.                            |
| `db:seed`        | Populate the database with demo/development data.                    |
| `format`         | Format all files with Prettier (writes changes).                     |
| `format:check`   | Check that all files conform to Prettier formatting (CI mode).       |

You can also run scripts for a specific package:

```bash
pnpm --filter @chief-mog-officer/db build
pnpm --filter @chief-mog-officer/agents test
```

---

## Docker Compose Services

The `docker-compose.yml` at the repository root defines two infrastructure
services:

### PostgreSQL

| Property        | Value                                               |
| --------------- | --------------------------------------------------- |
| **Image**       | `postgres:16-alpine`                                |
| **Port**        | `5432` (mapped to host)                             |
| **User**        | `mog`                                               |
| **Password**    | `mog_dev_password`                                  |
| **Database**    | `chief_mog_officer`                                 |
| **Volume**      | `postgres_data` (persistent across restarts)        |
| **Health check**| `pg_isready -U mog` every 5s                        |

### Redis

| Property        | Value                                               |
| --------------- | --------------------------------------------------- |
| **Image**       | `redis:7-alpine`                                    |
| **Port**        | `6379` (mapped to host)                             |
| **Health check**| `redis-cli ping` every 5s                           |

### Managing services

```bash
docker compose up -d       # Start services in the background
docker compose ps          # Check service status
docker compose logs -f     # Follow logs from all services
docker compose down        # Stop and remove containers (data persists)
docker compose down -v     # Stop, remove containers, AND delete volumes
```

---

## Environment Variables

All environment variables are validated at startup by `@chief-mog-officer/config`
using Zod. Missing required variables will cause an immediate, descriptive error.

| Variable       | Required | Default       | Description                                          |
| -------------- | -------- | ------------- | ---------------------------------------------------- |
| `NODE_ENV`     | No       | `development` | Runtime environment. `development`, `production`, or `test`. |
| `DATABASE_URL` | Yes      | --            | PostgreSQL connection string. Format: `postgresql://user:password@host:port/database` |
| `REDIS_URL`    | Yes      | --            | Redis connection string. Format: `redis://host:port`  |
| `API_PORT`     | No       | `3001`        | Port for the Hono API server.                         |
| `WEB_PORT`     | No       | `5173`        | Port for the Vite dev server.                         |

The `.env.example` file provides these defaults for local development:

```
NODE_ENV=development
DATABASE_URL=postgresql://mog:mog_dev_password@localhost:5432/chief_mog_officer
REDIS_URL=redis://localhost:6379
API_PORT=3001
WEB_PORT=5173
```

---

## Troubleshooting

### Port conflicts

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3001`

**Cause:** Another process is already using the port.

**Fix:**

```bash
# Find the process using the port
lsof -i :3001

# Kill it, or change the port in .env
API_PORT=3002
```

The same applies to port 5173 (web), 5432 (Postgres), and 6379 (Redis).

---

### Docker not running

**Symptom:** `Cannot connect to the Docker daemon` or `docker compose` commands
fail.

**Fix:**

- Make sure Docker Desktop is running (macOS/Windows) or the Docker daemon is
  started (`sudo systemctl start docker` on Linux).
- Verify with `docker info`.

---

### Database connection fails

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Possible causes and fixes:**

1. **Docker containers are not running.**
   Run `docker compose up -d` and wait for the health check to pass.

2. **DATABASE_URL is wrong.**
   Verify the connection string in `.env` matches the credentials in
   `docker-compose.yml`. The default is:
   ```
   postgresql://mog:mog_dev_password@localhost:5432/chief_mog_officer
   ```

3. **Postgres is still starting.**
   The health check retries 5 times at 5-second intervals. Wait up to 30
   seconds after `docker compose up -d` before running migrations.

---

### Database migrations fail

**Symptom:** `pnpm db:migrate` exits with an error.

**Possible causes and fixes:**

1. **No migration files exist.**
   Run `pnpm db:generate` first to create migration files from the schema.

2. **Database does not exist.**
   The Postgres container creates the `chief_mog_officer` database
   automatically on first start. If you deleted the volume, restart:
   ```bash
   docker compose down -v
   docker compose up -d
   ```

3. **Schema conflict.**
   If you modified a table that already has data, Drizzle Kit may generate a
   destructive migration. Review the generated SQL in `packages/db/src/migrations/`
   before applying.

---

### pnpm install fails

**Symptom:** `ERR_PNPM_PEER_DEP_ISSUES` or resolution errors.

**Fix:**

1. Delete `node_modules` and the pnpm lock file, then reinstall:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. Make sure you are using the correct Node.js version (>= 22):
   ```bash
   node --version
   ```

3. Enable corepack if pnpm is not found:
   ```bash
   corepack enable
   ```

---

### TypeScript errors after pulling new changes

**Symptom:** Type errors in packages that depend on recently changed packages.

**Fix:**

Rebuild all packages in dependency order:

```bash
pnpm build
```

Turborepo will rebuild only the packages that changed and their dependents.

---

### Tests fail with "module not found"

**Symptom:** Vitest cannot resolve imports from internal packages.

**Fix:**

Internal packages must be built before tests can import them:

```bash
pnpm build
pnpm test
```

The `test` pipeline in `turbo.json` depends on `^build`, so running
`pnpm test` through Turborepo handles this automatically. If you are running
Vitest directly (e.g., `npx vitest`), make sure to build first.

---

### Redis connection fails

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Fix:**

Verify Redis is running:

```bash
docker compose ps redis
```

If it is not running, start it:

```bash
docker compose up -d redis
```

Test connectivity:

```bash
docker compose exec redis redis-cli ping
# Should respond: PONG
```
