# One-time: enable automatic deploy from GitHub

CI/CD **cannot connect** until these 3 secrets exist in GitHub.  
The cloud agent cannot add them for you (GitHub security).

## Step 1 — On the server (SSH once)

```bash
cd ~/meti-booking
git pull
./deploy/setup-cicd.sh
```

Copy the output (host, user, private key).

## Step 2 — GitHub (one-time)

Open: **https://github.com/panagiod/meti-booking/settings/secrets/actions**

| Secret | Value |
|--------|--------|
| `PRODUCTION_HOST` | Server IPv4 |
| `PRODUCTION_USER` | `root` |
| `PRODUCTION_SSH_KEY` | Full private key from setup script |

## Step 3 — Trigger deploy

Push to `main` or: **Actions → Deploy Production → Run workflow**

---

After this, **every push deploys automatically** — no more manual `git pull` or `./deploy/deploy-lite.sh`.

Deploy logs on server: `/var/log/meti-booking/deploy.log`
