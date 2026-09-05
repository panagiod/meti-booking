# CI/CD — automatic production deploy

Every push to **`main`** deploys to your Hetzner VPS automatically.

**Default on small VPS:** `DEPLOY_MODE=lite` in `.env` → no Docker, SQLite ([LITE.md](./LITE.md)).  
Docker + Postgres only if `DEPLOY_MODE=docker`.

## How it works

```
You (or Cursor) push to main on GitHub
        │
        ▼
GitHub Actions — Deploy Production workflow
        │
        ▼ SSH (restricted deploy key)
Hetzner VPS — ci-deploy-wrapper.sh
        │  git fetch + reset to main
        ▼
        remote-deploy.sh
        │  ./deploy/deploy.sh (migrate + rebuild + restart)
        ▼
        smoke-test https://meti-pilates.com
```

- **`.env` stays on the server** — never committed; `git reset --hard` does not delete it.
- **Deploy logs:** `/var/log/meti-booking/deploy.log` on the VPS.
- **Manual deploy:** GitHub → Actions → **Deploy Production** → **Run workflow**.
- **Daily backup:** encrypted SQLite + `.env` in the private ops repo — see [OPS.md](./OPS.md).

---

## One-time setup (≈5 minutes)

Do this **once** on the production server after the first manual deploy works.

### 1. On the server

```bash
cd ~/meti-booking
git pull
chmod +x deploy/*.sh
./deploy/setup-cicd.sh
```

The script prints three values for GitHub.

### 2. On GitHub

Open: **https://github.com/panagiod/meti-booking/settings/secrets/actions**

Add **Repository secrets**:

| Secret | Value |
|--------|--------|
| `PRODUCTION_HOST` | Server IPv4 (printed by setup script) |
| `PRODUCTION_USER` | `root` (or your SSH user) |
| `PRODUCTION_SSH_KEY` | Full private key from setup script (`-----BEGIN...` through `-----END...`) |

### 3. Create `production` environment (optional but recommended)

**Settings → Environments → New environment → `production`**

Leave defaults, or add yourself as required reviewer if you want to approve each deploy.

### 4. Test

Push any small change to `main`, or:

**Actions → Deploy Production → Run workflow**

Watch the workflow; site should update in ~10–15 minutes (Docker rebuild).

---

## What runs on each deploy

1. `git fetch origin main && git reset --hard origin/main`
2. `./deploy/deploy.sh` — Postgres up, migrations, Docker rebuild, Caddy restart
3. `./deploy/smoke-test.sh` — checks `/`, `/book`, `/login`, `/api/health`, APIs
4. `./deploy/setup-cron.sh` — rewrites daily maintenance, backup, and 15-minute alert jobs

**Uptime:** Actions → **Uptime** curls the live site every 15 minutes. See [OPS.md](./OPS.md).

**Backup test:** Actions → **Backup Production**, then **Verify Restore**. That does not replace the live database. See [OPS.md](./OPS.md).

---

## Security

- Deploy SSH key is **restricted**: can only run `ci-deploy-wrapper.sh` (no shell).
- Private key lives only in **GitHub Secrets** and on the server at `~/.ssh/github_actions_meti_deploy`.
- Never commit `.env` or the private key.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Workflow fails immediately | Check `PRODUCTION_HOST`, `PRODUCTION_USER`, `PRODUCTION_SSH_KEY` secrets |
| SSH permission denied | Re-run `./deploy/setup-cicd.sh` on server; update GitHub secret with new private key |
| Build timeout | VPS may need swap; see `deploy/HETZNER.md` |
| Site old after “success” | Check `/var/log/meti-booking/deploy.log` on server |
| Skip deploy for a commit | Push only `.md` files (workflow ignores markdown-only paths) or use a branch + PR |

### View deploy log on server

```bash
tail -100 /var/log/meti-booking/deploy.log
```

### Manual deploy (fallback)

```bash
cd ~/meti-booking
git pull
./deploy/remote-deploy.sh
```

---

## Related

- [HETZNER.md](./HETZNER.md) — first-time server setup
- [RESEND.md](./RESEND.md) — email after go-live
