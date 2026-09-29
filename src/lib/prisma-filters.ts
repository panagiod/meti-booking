import { isSqliteDatabase } from "@/lib/database-provider";

/** Case-insensitive contains for SQLite queries. */
export function containsInsensitive(value: string) {
  if (isSqliteDatabase()) {
    return { contains: value };
  }
  return { contains: value, mode: "insensitive" as const };
}
