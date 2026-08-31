#!/usr/bin/env bash
# Arranque del servidor de pruebas E2E (invocado por playwright.config.ts)
set -e

# Pre-calentar la DB Neon (el primer connect despierta el compute suspendido)
node -e "const{Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL});c.connect().then(()=>c.query('SELECT 1')).then(()=>c.end()).catch(e=>{console.error('warmup:',e.message);process.exit(1)})"

# Migraciones con reintento (el advisory lock puede tardar en un compute frío)
migrated=0
for i in 1 2 3; do
  if pnpm exec prisma migrate deploy; then
    migrated=1
    break
  fi
  echo "[start-server] migrate deploy falló (intento $i), reintentando..."
  sleep 5
done
if [ "$migrated" != "1" ]; then
  echo "[start-server] migrate deploy falló tras 3 intentos" >&2
  exit 1
fi

# Seed de categorías (idempotente)
tsx scripts/seed-categories.ts

# Build de producción aislado (NEXT_DIST_DIR) y arranque en el puerto de pruebas
pnpm exec next build
pnpm exec next start -p 3100
