#!/usr/bin/env bash
# SSH forced-command entrypoint for GitHub Actions deploy key.
# Only this script may run when CI connects — see deploy/setup-cicd.sh
set -euo pipefail

REPO="${METI_REPO_DIR:-$HOME/meti-booking}"

if [[ ! -d "$REPO/.git" ]]; then
  echo "ERROR: Repository not found at $REPO"
  exit 1
fi

cd "$REPO"
git fetch origin main
git reset --hard origin/main
exec "$REPO/deploy/remote-deploy.sh"
