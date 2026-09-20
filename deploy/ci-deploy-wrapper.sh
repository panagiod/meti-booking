#!/usr/bin/env bash
# SSH forced-command entrypoint for GitHub Actions deploy key.
# Only this script may run when CI connects — see deploy/setup-cicd.sh
set -euo pipefail

REPO="${METI_REPO_DIR:-$HOME/meti-booking}"

if [[ ! -d "$REPO/.git" ]]; then
  echo "ERROR: Repository not found at $REPO" >&2
  exit 1
fi

cd "$REPO"

# Backup / restore jobs must not deploy. `ssh host METI_BACKUP` sets SSH_ORIGINAL_COMMAND.
if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_BACKUP" || "${SSH_ORIGINAL_COMMAND:-}" == *METI_BACKUP* ]]; then
  "$REPO/deploy/backup-studio-data.sh"
  "$REPO/deploy/publish-ops-from-server.sh"
  exit 0
fi

if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_RESTORE_VERIFY" || "${SSH_ORIGINAL_COMMAND:-}" == *METI_RESTORE_VERIFY* ]]; then
  day="latest"
  if [[ "${SSH_ORIGINAL_COMMAND}" =~ METI_RESTORE_VERIFY[[:space:]]+([0-9]{4}-[0-9]{2}-[0-9]{2}|latest) ]]; then
    day="${BASH_REMATCH[1]}"
  fi
  CONFIRM=VERIFY "$REPO/deploy/restore-from-ops.sh" "$day"
  exit 0
fi

if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_RESTORE" || "${SSH_ORIGINAL_COMMAND:-}" == *METI_RESTORE* ]]; then
  day="latest"
  if [[ "${SSH_ORIGINAL_COMMAND}" =~ METI_RESTORE[[:space:]]+([0-9]{4}-[0-9]{2}-[0-9]{2}|latest) ]]; then
    day="${BASH_REMATCH[1]}"
  fi
  CONFIRM=RESTORE "$REPO/deploy/restore-from-ops.sh" "$day"
  exit 0
fi

if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_RESTART" ]]; then
  systemctl restart meti-booking
  sleep 2
  systemctl is-active meti-booking
  curl -fsS --max-time 5 http://127.0.0.1:3000/api/health
  exit 0
fi

if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_MONITOR" ]]; then
  "$REPO/deploy/monitor-studio.sh"
  tail -n 5 /var/log/meti-booking/monitor.log 2>/dev/null || true
  exit 0
fi

if [[ "${SSH_ORIGINAL_COMMAND:-}" == "METI_LOGS" || "${SSH_ORIGINAL_COMMAND:-}" == *METI_LOGS* ]]; then
  echo "=== monitor.log (last 500 lines) ==="
  tail -n 500 /var/log/meti-booking/monitor.log 2>/dev/null || echo "(missing)"
  echo ""
  echo "=== monitor-state.json ==="
  cat /var/lib/meti-booking/monitor-state.json 2>/dev/null || echo "(missing)"
  echo ""
  echo "=== curl probes at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  for url in "http://127.0.0.1:3000/api/health" "http://127.0.0.1:3000/" "https://meti-pilates.com/api/health" "https://meti-pilates.com/"; do
    code="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -A "MeTi-Logs/1.0" "$url" 2>/dev/null || echo "000")"
    echo "${url} -> ${code}"
  done
  echo ""
  echo "=== deploy.log (last 80 lines) ==="
  tail -n 80 /var/log/meti-booking/deploy.log 2>/dev/null || echo "(missing)"
  echo ""
  echo "=== journalctl meti-booking since 2026-09-18 ==="
  journalctl -u meti-booking --since "2026-09-18 00:00:00" --no-pager 2>/dev/null | tail -100 || echo "(missing)"
  exit 0
fi

git fetch origin main
git reset --hard origin/main
exec "$REPO/deploy/remote-deploy.sh"
