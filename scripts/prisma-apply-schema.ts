import { execSync } from "node:child_process";

const BUILD_SCHEMA = ".prisma/schema.build.prisma";

/** Apply schema with Prisma db push (SQLite). */
export function applyDatabaseSchema(): void {
  execSync("node scripts/prisma-prepare.mjs", { stdio: "inherit" });
  execSync("node scripts/rename-advisor-to-instructor.mjs", { stdio: "inherit" });
  execSync(
    `pnpm exec prisma db push --schema ${BUILD_SCHEMA} --accept-data-loss`,
    { stdio: "inherit" },
  );
}
