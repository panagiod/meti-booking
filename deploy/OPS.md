# Production backups

Customer bookings and the live `.env` are not stored in this public repository.

Encrypted backups and the operational runbook live in a **private** GitHub
repository. The name is the `OPS_REPO` Actions secret (and the matching server
`.env` value). Do not publish that name, the production host, or SSH commands
with a live IP in this repo.

## What you can do from here

| Action | Purpose |
|--------|---------|
| **Backup Production** | Write an encrypted copy now |
| **Verify Restore** | Decrypt and check a backup (site stays up) |
| **Restore Production** | Replace live `data.db` (type `RESTORE`) |
| **Rebuild Production** | New VPS from the latest backup (type `REBUILD`) |
| **Uptime** | External check every 15 minutes |
| **Publish Ops Docs** | Copy runbooks into the private repo |

## Full runbook

Clone the private ops repo (`OPS_REPO`) and read `docs/OPS.md`,
`docs/BACKUP.md`, `docs/GITHUB-SECRETS.md`, and `docs/RECOVERY.md`.

Edit those files in the private repo. Do not copy them back here.

## Public-repo hygiene

Never add to this public tree:

- Production host IP or `ssh user@host` with a live address
- The private ops repository name
- Secret values, or a playbook that names the live host next to how to
  generate them
- Notes about incomplete deploy keys or other live security debt
