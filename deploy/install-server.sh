#!/usr/bin/env bash
# First-time Ubuntu server setup — redirects to lite install (SQLite, no Docker).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "MeTi Booking uses the lite stack (Node + Caddy + SQLite)."
echo "Running ./deploy/install-lite.sh ..."
exec ./deploy/install-lite.sh
