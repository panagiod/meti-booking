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

git fetch origin main
git reset --hard origin/main
exec "$REPO/deploy/remote-deploy.sh"
