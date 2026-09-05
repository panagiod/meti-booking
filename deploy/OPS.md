# Private production ops repo

The public GitHub repo (`meti-booking`) must not hold customer bookings or the live `.env`. Those go in a **private** repo:

**`panagiod/meti-studio-ops`**

Encrypted backups are written there every night and after each deploy. You can restore the live VPS, or rebuild a replacement if this one is destroyed.

## One-time setup (you have to do this)

GitHub will not let automation create a private repo until you add a token.

### 1. Create the empty private repo

1. Open [github.com/new](https://github.com/new)
2. Owner: `panagiod`
3. Name: `meti-studio-ops`
4. **Private**
5. Create the repository (empty is fine)

### 2. Create a token that can write only to that repo

1. GitHub → Settings → Developer settings → Fine-grained personal access tokens
2. Repository access: **Only select repositories** → `meti-studio-ops`
3. Permissions: **Contents: Read and write**
4. Generate and copy the token

### 3. Add secrets on the public repo

Open [meti-booking Actions secrets](https://github.com/panagiod/meti-booking/settings/secrets/actions):

| Secret | Value |
|--------|--------|
| `OPS_REPO` | `panagiod/meti-studio-ops` |
| `OPS_REPO_TOKEN` | the fine-grained token |
| `BACKUP_ENCRYPTION_KEY` | from the server `.env` (needed to rebuild a new VPS) |

On the server:

```bash
cd ~/meti-booking
grep ^BACKUP_ENCRYPTION_KEY= .env
```

Keep that key in a password manager as well. Encrypted files are useless without it.

### 3b. Put the same token on the server

GitHub can reach the VPS, but the saved `PRODUCTION_SSH_KEY` secret is not a full private key (only 513 characters). Backups therefore run **on the server** and push out. The server needs the same token:

```bash
ssh root@2.29.22.46
cd ~/meti-booking
printf '\nOPS_REPO=panagiod/meti-studio-ops\nOPS_REPO_TOKEN=' >> .env
# paste the github_pat_ token, then Enter
nano .env   # or use the editor you prefer, and save
chmod 600 .env
```

The `OPS_REPO_TOKEN=` line must contain the same value as the GitHub secret.

### 4. Initialize and take the first backup

1. **Actions → Setup Ops Repo → Run workflow**
2. **Actions → Backup Production → Run workflow**

After that, `meti-studio-ops` contains:

- `backups/latest.db.enc` — encrypted bookings database
- `secrets/env.enc` — encrypted production `.env`
- `inventory.md` — host and paths, no passwords

## Restore on the same machine

**Actions → Restore Production → Run workflow**

- Backup: `latest` or `YYYY-MM-DD`
- Confirm: `RESTORE`

The Action downloads the encrypted file from the private repo and restores it on the current VPS. The decrypt key already lives in the server `.env`.

## Rebuild if the primary VPS is destroyed

1. Create a new Ubuntu VPS.
2. Add an **unrestricted** SSH public key on that machine (the current deploy key is locked to the old wrapper and cannot install a fresh server).
3. Add these secrets on `meti-booking`:

| Secret | Value |
|--------|--------|
| `RECOVERY_HOST` | new IPv4 |
| `RECOVERY_USER` | `root` |
| `RECOVERY_SSH_KEY` | matching private key |

4. **Actions → Rebuild Production → Run workflow**
   - Backup: `latest`
   - Confirm: `REBUILD`
5. Point the `meti-pilates.com` DNS A record at the new IP.
6. SSH to the new server, run `./deploy/setup-cicd.sh`, and update `PRODUCTION_HOST` / `PRODUCTION_SSH_KEY`.

Manual rebuild from the new VPS:

```bash
git clone https://github.com/panagiod/meti-booking.git ~/meti-booking
cd ~/meti-booking
export OPS_REPO=panagiod/meti-studio-ops
export OPS_REPO_TOKEN=...
export BACKUP_ENCRYPTION_KEY=...
CONFIRM=REBUILD ./deploy/bootstrap-from-ops.sh latest
```

The rebuild installs the app first, then restores customers last, so a schema push cannot wipe the recovered database.

## What never goes in git as plaintext

- `.env`
- `data.db`
- `BACKUP_ENCRYPTION_KEY`
- SSH private keys
- Customer names, emails, or bookings

## Until the private repo token is added

Nightly backups still fall back to the public `backups` branch as encrypted files. After `OPS_REPO_TOKEN` works, new backups stay private.
