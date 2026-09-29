/** SQLite is the only supported database (file URL). */

export function isSqliteDatabase(): boolean {
  return true;
}

export function getBetterAuthDatabaseProvider(): "sqlite" {
  return "sqlite";
}

export function assertSqliteDatabaseUrl(): void {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url.startsWith("file:")) {
    throw new Error('DATABASE_URL must be a SQLite file URL (e.g. file:./data.db or file:/var/lib/meti-booking/data.db)');
  }
}
