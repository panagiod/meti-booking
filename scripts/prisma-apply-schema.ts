import { execSync } from "node:child_process";

const BUILD_SCHEMA = ".prisma/schema.build.prisma";

export function isSqliteDatabase(): boolean {
  return (process.env.DATABASE_URL?.trim() ?? "").startsWith("file:");
}

/** Apply schema: db push (SQLite lite) or migrate deploy (PostgreSQL). */
export function applyDatabaseSchema(): void {
  execSync("node scripts/prisma-prepare.mjs", { stdio: "inherit" });
  if (isSqliteDatabase()) {
    execSync(`pnpm exec prisma db push --schema ${BUILD_SCHEMA}`, { stdio: "inherit" });
  } else {
    execSync(`pnpm exec prisma migrate deploy --schema ${BUILD_SCHEMA}`, { stdio: "inherit" });
  }
}
