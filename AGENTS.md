<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Development workflow

- **ALWAYS create a PR for new development** (never commit directly to `main`). Use `gh pr create` with a descriptive title and description, and report the PR URL.
- CI (GitHub Actions) runs tests on every PR: `pnpm test:unit` and `pnpm test:e2e`. Verify they pass before requesting a merge.
- Test database: Neon project `meti-test` (config in `.env.test`, gitignored). E2E tests use port 3100 and only clean up `e2e.*` users.
- When changing `prisma/schema.prisma`: create a migration with `pnpm db:migrate` and regenerate the client.
