#!/usr/bin/env bash
# Compatibility wrapper — use backup-studio-data.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/deploy/backup-studio-data.sh" "$@"
