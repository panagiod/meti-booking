#!/usr/bin/env bash
# Seed demo/studio data on production (first deploy only).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env"
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

if [[ "${ALLOW_DEMO_SEED:-}" != "1" ]]; then
  echo "Set ALLOW_DEMO_SEED=1 in .env to seed production."
  exit 1
fi

if [[ -z "${DEMO_PASSWORD:-}" ]]; then
  echo "Set DEMO_PASSWORD in .env"
  exit 1
fi

echo "Seeding studio data..."
docker compose -f deploy/docker-compose.prod.yml --profile tools run --rm \
  -e ALLOW_DEMO_SEED=1 \
  -e DEMO_PASSWORD \
  -e BETTER_AUTH_URL \
  seed

echo "Done. Change demo passwords before going live."
