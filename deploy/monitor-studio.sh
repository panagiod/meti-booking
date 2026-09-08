#!/usr/bin/env bash
# Check site health and resource usage; email the studio if action is needed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"

# shellcheck disable=SC1091
[[ -f .env ]] && set -a && source .env && set +a

mkdir -p /var/log/meti-booking
exec >>/var/log/meti-booking/monitor.log 2>&1
echo "==== $(date -u +%Y-%m-%dT%H:%M:%SZ) ===="
status=0
pnpm exec tsx scripts/monitor-studio.ts || status=$?

used="$(df -P / | awk 'NR==2 { gsub("%","",$5); print $5 }')"
if [[ "${used:-0}" -ge 80 ]]; then
  echo "Disk ${used}% — reclaiming logs and leftover backups"
  "${ROOT}/deploy/prune-disk.sh" --urgent || true
fi
exit "$status"
