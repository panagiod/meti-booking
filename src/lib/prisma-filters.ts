import { isSqliteDatabase } from "@/lib/database-provider";

/** Case-insensitive contains that works on both Postgres and SQLite. */
export function containsInsensitive(value: string) {
  if (isSqliteDatabase()) {
    return { contains: value };
  }
  return { contains: value, mode: "insensitive" as const };
}
