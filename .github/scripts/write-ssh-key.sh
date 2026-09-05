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
import re
import textwrap

match = re.search(
    r"-----BEGIN ([A-Z0-9 ]+PRIVATE KEY)-----\s*([\s\S]+?)\s*-----END \1-----",
    key,
)
if not match:
    raise SystemExit("PRODUCTION_SSH_KEY does not look like a private key (need BEGIN / PRIVATE KEY lines)")
kind, body = match.group(1), re.sub(r"\s+", "", match.group(2))
if len(body) < 32:
    raise SystemExit("PRODUCTION_SSH_KEY body is too short — re-paste the key from the server")
wrapped = "\n".join(textwrap.wrap(body, 70))
key = f"-----BEGIN {kind}-----\n{wrapped}\n-----END {kind}-----\n"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(key)
dest.chmod(0o600)
print(f"Wrote SSH key ({len(key.splitlines())} lines, -----BEGIN {kind}-----)")
PY
