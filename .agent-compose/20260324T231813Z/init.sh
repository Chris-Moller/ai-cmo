#!/bin/bash
set -euo pipefail

# Chief MOG Officer — Dev Environment Bootstrap
# Safe to run multiple times (idempotent)

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo "==> Bootstrapping Chief MOG Officer dev environment..."

# 1. Ensure pnpm is available
if ! command -v pnpm &>/dev/null; then
  echo "==> Installing pnpm via corepack..."
  corepack enable
  corepack prepare pnpm@latest --activate
fi

# 2. Install dependencies (skip if node_modules exists and is fresh)
if [ ! -d "node_modules" ] || [ "pnpm-lock.yaml" -nt "node_modules/.pnpm/lock.yaml" ] 2>/dev/null; then
  echo "==> Installing dependencies with pnpm..."
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
else
  echo "==> Dependencies already installed, skipping."
fi

# 3. Copy .env.example to .env if needed
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
  echo "==> Copying .env.example to .env..."
  cp .env.example .env
else
  echo "==> .env already exists or no .env.example found, skipping."
fi

# 4. Start Docker services (PostgreSQL + Redis) if docker-compose.yml exists
if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
  if command -v docker &>/dev/null; then
    # Check if services are already running
    RUNNING=$(docker compose ps --status running -q 2>/dev/null | wc -l || echo "0")
    if [ "$RUNNING" -lt 2 ]; then
      echo "==> Starting Docker services (PostgreSQL + Redis)..."
      docker compose up -d
      # Wait for PostgreSQL to be ready
      echo "==> Waiting for PostgreSQL to accept connections..."
      for i in $(seq 1 30); do
        if docker compose exec -T postgres pg_isready -U postgres &>/dev/null; then
          echo "==> PostgreSQL is ready."
          break
        fi
        if [ "$i" -eq 30 ]; then
          echo "==> WARNING: PostgreSQL did not become ready in 30 seconds."
        fi
        sleep 1
      done
    else
      echo "==> Docker services already running, skipping."
    fi
  else
    echo "==> WARNING: Docker not found. PostgreSQL and Redis must be started manually."
  fi
fi

# 5. Run database migrations if the db package and migration script exist
if [ -f "packages/db/package.json" ]; then
  echo "==> Running database migrations..."
  pnpm --filter @ai-cmo/db db:migrate 2>/dev/null || echo "==> WARNING: Migration failed or not yet configured."
fi

# 6. Build all packages (needed for workspace cross-references)
echo "==> Building all packages..."
pnpm turbo build 2>/dev/null || echo "==> WARNING: Build failed — this may be expected on first setup before all code is written."

echo "==> Bootstrap complete. Run 'pnpm dev' to start all services."
