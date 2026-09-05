#!/usr/bin/env bash
# Write PRODUCTION_SSH_KEY to $1 in a form OpenSSH will load.
# GitHub secrets often store the key as one line with literal \n.
set -euo pipefail

DEST="${1:?usage: write-ssh-key.sh /path/to/key}"
if [[ -z "${PRODUCTION_SSH_KEY:-}" ]]; then
  echo "ERROR: PRODUCTION_SSH_KEY is empty" >&2
  exit 1
fi

python3 - "$DEST" <<'PY'
import os
import sys
from pathlib import Path

dest = Path(sys.argv[1])
key = os.environ["PRODUCTION_SSH_KEY"].strip()
if (key.startswith('"') and key.endswith('"')) or (key.startswith("'") and key.endswith("'")):
    key = key[1:-1].strip()
key = key.replace("\r\n", "\n").replace("\r", "\n")
if key.count("\n") < 2:
    key = key.replace("\\n", "\n")
if "BEGIN" not in key or "PRIVATE KEY" not in key:
    raise SystemExit("PRODUCTION_SSH_KEY does not look like a private key (need BEGIN / PRIVATE KEY lines)")
if key.count("\n") < 2:
    raise SystemExit("PRODUCTION_SSH_KEY is still one line after cleanup — re-paste the key from the server")
if not key.endswith("\n"):
    key += "\n"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(key)
dest.chmod(0o600)
header = key.splitlines()[0]
print(f"Wrote SSH key ({len(key.splitlines())} lines, {header})")
PY
