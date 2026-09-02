import { afterEach, describe, expect, it, vi } from "vitest";
import { isAuthDatabaseAvailable } from "@/lib/auth-availability";

describe("isAuthDatabaseAvailable", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is false when DATABASE_URL points to localhost", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://meti:meti@localhost:5432/meti_booking");
    expect(isAuthDatabaseAvailable()).toBe(false);
  });

  it("is true when DATABASE_URL is a remote host", () => {
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://user:pass@ep-abc.eu-central-1.aws.neon.tech/neondb?sslmode=require"
    );
    expect(isAuthDatabaseAvailable()).toBe(true);
  });
});
