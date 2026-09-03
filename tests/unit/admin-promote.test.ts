import { afterEach, describe, expect, it, vi } from "vitest";

// admin-promote.ts imports prisma at module load; the generated client isn't
// built in this test environment, so stub it out (this file only tests the
// token-check helper, which doesn't touch prisma).
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { isAdminPromoteTokenValid } from "@/lib/admin-promote";

describe("isAdminPromoteTokenValid", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects when ADMIN_PROMOTE_TOKEN is unset", () => {
    vi.stubEnv("ADMIN_PROMOTE_TOKEN", "");
    expect(isAdminPromoteTokenValid("anything")).toBe(false);
  });

  it("rejects a missing or empty provided token", () => {
    vi.stubEnv("ADMIN_PROMOTE_TOKEN", "secret-token");
    expect(isAdminPromoteTokenValid(null)).toBe(false);
    expect(isAdminPromoteTokenValid(undefined)).toBe(false);
    expect(isAdminPromoteTokenValid("")).toBe(false);
  });

  it("rejects a wrong token", () => {
    vi.stubEnv("ADMIN_PROMOTE_TOKEN", "secret-token");
    expect(isAdminPromoteTokenValid("wrong-token")).toBe(false);
  });

  it("accepts the exact configured token", () => {
    vi.stubEnv("ADMIN_PROMOTE_TOKEN", "secret-token");
    expect(isAdminPromoteTokenValid("secret-token")).toBe(true);
  });
});
