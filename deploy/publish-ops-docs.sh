#!/usr/bin/env bash
# Copy runbooks from deploy/ops-repo/docs into the private ops repo.
# Required env: OPS_REPO, OPS_REPO_TOKEN
set -euo pipefail

if [[ -z "${OPS_REPO:-}" || -z "${OPS_REPO_TOKEN:-}" ]]; then
  echo "ERROR: OPS_REPO and OPS_REPO_TOKEN are required" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/deploy/ops-repo"
if [[ ! -d "${SRC}/docs" ]]; then
  echo "No deploy/ops-repo/docs payload in this commit; skip"
  exit 0
fi

if [[ -z "$(find "${SRC}/docs" -type f -name '*.md' -print -quit)" ]]; then
  echo "No markdown runbooks to publish; skip"
  exit 0
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone --depth 1 "https://x-access-token:${OPS_REPO_TOKEN}@github.com/${OPS_REPO}.git" "$WORK/ops"
cd "$WORK/ops"

git config user.name meti-backup
git config user.email 41898282+github-actions[bot]@users.noreply.github.com

mkdir -p docs backups secrets
cp "${SRC}/README.md" README.md
cp "${SRC}/env.example" env.example
cp "${SRC}/docs/"*.md docs/

git add README.md env.example docs
if git diff --staged --quiet; then
  echo "Private ops docs already up to date"
  exit 0
fi

git commit -m "docs: refresh operational runbooks"
git push origin HEAD
echo "Published operational runbooks to the private ops repo"
