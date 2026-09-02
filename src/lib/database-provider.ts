/** Shared database provider helpers (PostgreSQL vs SQLite lite deploy). */

export function isSqliteDatabase(): boolean {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  return url.startsWith("file:");
}

export function getBetterAuthDatabaseProvider(): "sqlite" | "postgresql" {
  return isSqliteDatabase() ? "sqlite" : "postgresql";
}
