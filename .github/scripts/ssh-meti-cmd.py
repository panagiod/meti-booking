#!/usr/bin/env python3
"""Run a forced-command SSH action using the GitHub deploy key.

OpenSSH on GitHub runners often rejects PRODUCTION_SSH_KEY (line wrapping).
Paramiko accepts the same key appleboy/ssh-action already uses for deploys.
"""
from __future__ import annotations

import io
import os
import sys

import paramiko


def load_key(raw: str) -> paramiko.PKey:
    text = raw.strip()
    if (text.startswith('"') and text.endswith('"')) or (text.startswith("'") and text.endswith("'")):
        text = text[1:-1].strip()
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if text.count("\n") < 2:
        text = text.replace("\\n", "\n")
    if not text.endswith("\n"):
        text += "\n"
    last_error: Exception | None = None
    for loader in (paramiko.Ed25519Key, paramiko.RSAKey, paramiko.ECDSAKey, paramiko.DSSKey):
        try:
            return loader.from_private_key(io.StringIO(text))
        except Exception as error:  # noqa: BLE001 — try each key type
            last_error = error
    raise SystemExit(f"Could not parse PRODUCTION_SSH_KEY: {last_error}")


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: ssh-meti-cmd.py METI_BACKUP|METI_RESTORE", file=sys.stderr)
        return 2
    command = sys.argv[1]
    host = os.environ["PRODUCTION_HOST"]
    user = os.environ["PRODUCTION_USER"]
    key = load_key(os.environ["PRODUCTION_SSH_KEY"])

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=host, username=user, pkey=key, timeout=30, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = client.exec_command(command, timeout=180)
    if not sys.stdin.isatty():
        stdin.write(sys.stdin.read())
        stdin.channel.shutdown_write()
    out = stdout.read()
    err = stderr.read()
    code = stdout.channel.recv_exit_status()
    sys.stdout.buffer.write(out)
    if err:
        sys.stderr.buffer.write(err)
    client.close()
    return code


if __name__ == "__main__":
    raise SystemExit(main())
