#!/usr/bin/env bash
# Create or initialize the private production-ops repository.
# Needs a GitHub token that can create the repo, or an empty private repo
# that already exists.
#
#   export OPS_REPO_TOKEN=ghp_...
#   ./deploy/setup-ops-repo.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPS_REPO="${OPS_REPO:-panagiod/meti-studio-ops}"
OWNER="${OPS_REPO%%/*}"
NAME="${OPS_REPO##*/}"

if [[ -z "${OPS_REPO_TOKEN:-}" ]]; then
  echo "ERROR: set OPS_REPO_TOKEN to a GitHub token." >&2
  echo "" >&2
  echo "Easiest path:" >&2
  echo "  1. Create an empty private repo named ${NAME} under ${OWNER}" >&2
  echo "  2. Create a fine-grained PAT with Contents: Read and write on that repo only" >&2
  echo "  3. Add GitHub secrets on panagiod/meti-booking:" >&2
  echo "       OPS_REPO=${OPS_REPO}" >&2
  echo "       OPS_REPO_TOKEN=<the PAT>" >&2
  echo "       BACKUP_ENCRYPTION_KEY=<from the server .env>" >&2
  echo "  4. Run Actions → Backup Production" >&2
  exit 1
fi

API="https://api.github.com/repos/${OPS_REPO}"
CODE="$(curl -sS -o /tmp/meti-ops-repo.json -w "%{http_code}" \
  -H "Authorization: Bearer ${OPS_REPO_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "$API")"

if [[ "$CODE" == "404" ]]; then
  echo "==> Creating private repo ${OPS_REPO}"
  CREATE_CODE="$(curl -sS -o /tmp/meti-ops-create.json -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer ${OPS_REPO_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/user/repos" \
    -d "{\"name\":\"${NAME}\",\"private\":true,\"description\":\"Private MeTi Pilates production backups and restore notes\",\"has_issues\":false,\"has_projects\":false,\"has_wiki\":false,\"auto_init\":true}")"
  if [[ "$CREATE_CODE" != "201" ]]; then
    echo "ERROR: could not create ${OPS_REPO} (HTTP ${CREATE_CODE})" >&2
    echo "Create the empty private repo in the GitHub UI, then re-run." >&2
    cat /tmp/meti-ops-create.json >&2 || true
    exit 1
  fi
elif [[ "$CODE" != "200" ]]; then
  echo "ERROR: GitHub returned HTTP ${CODE} for ${OPS_REPO}" >&2
  cat /tmp/meti-ops-repo.json >&2 || true
  exit 1
else
  echo "==> ${OPS_REPO} already exists"
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
git clone "https://x-access-token:${OPS_REPO_TOKEN}@github.com/${OPS_REPO}.git" "$WORK/ops"
cd "$WORK/ops"

mkdir -p backups secrets docs
cp "${ROOT}/deploy/ops-repo/README.md" README.md
cp "${ROOT}/deploy/ops-repo/env.example" env.example
if [[ -d "${ROOT}/deploy/ops-repo/docs" ]]; then
  cp "${ROOT}/deploy/ops-repo/docs/"*.md docs/ 2>/dev/null || true
fi
if [[ ! -f inventory.md ]]; then
  echo "# Studio inventory" > inventory.md
  echo "" >> inventory.md
  echo "The next successful backup will fill this file." >> inventory.md
fi
if [[ ! -f backups/.gitkeep ]]; then
  touch backups/.gitkeep secrets/.gitkeep
fi

git config user.name meti-backup
git config user.email 41898282+github-actions[bot]@users.noreply.github.com
git add README.md env.example inventory.md backups/.gitkeep secrets/.gitkeep docs
if git diff --staged --quiet; then
  echo "Ops repo already initialized"
  exit 0
fi
git commit -m "Initialize private MeTi production ops repo"
git push origin HEAD
echo "Initialized ${OPS_REPO}"
echo "Add OPS_REPO and OPS_REPO_TOKEN on panagiod/meti-booking, then run Backup Production."
