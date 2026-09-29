import { afterEach, describe, expect, it, vi } from "vitest";
import { isAuthDatabaseAvailable } from "@/lib/auth-availability";

describe("isAuthDatabaseAvailable", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is false when DATABASE_URL is a local SQLite file", () => {
    vi.stubEnv("DATABASE_URL", "file:./data.db");
    expect(isAuthDatabaseAvailable()).toBe(false);
  });

  it("is true when DATABASE_URL is the production SQLite path", () => {
    vi.stubEnv("DATABASE_URL", "file:/var/lib/meti-booking/data.db");
    expect(isAuthDatabaseAvailable()).toBe(true);
  });
});
