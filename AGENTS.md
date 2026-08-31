<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Workflow de desarrollo

- **SIEMPRE crear un PR para nuevos desarrollos** (nunca commitear directo a `main`). Usar `gh pr create` con título y descripción descriptivos, y reportar la URL del PR.
- El CI (GitHub Actions) corre las pruebas en cada PR: `pnpm test:unit` y `pnpm test:e2e`. Verificar que pasen antes de pedir merge.
- DB de pruebas: proyecto Neon `meti-test` (config en `.env.test`, gitignored). Los tests E2E usan el puerto 3100 y limpian solo usuarios `e2e.*`.
- Al cambiar `prisma/schema.prisma`: crear migración con `pnpm db:migrate` y regenerar cliente.
