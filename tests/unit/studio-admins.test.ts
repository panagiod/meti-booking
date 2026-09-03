import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_STUDIO_ADMIN_EMAILS, isStudioAdminEmail, studioAdminEmails } from "@/lib/studio-admins";

describe("studioAdminEmails", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to the studio owner and instructor emails", () => {
    vi.stubEnv("STUDIO_ADMIN_EMAILS", "");
    vi.stubEnv("STUDIO_ADMIN_EMAIL", "");
    expect(studioAdminEmails()).toEqual(DEFAULT_STUDIO_ADMIN_EMAILS);
    expect(isStudioAdminEmail("barridasg@gmail.com")).toBe(true);
    expect(isStudioAdminEmail("BARRIDASG@gmail.com")).toBe(true);
    expect(isStudioAdminEmail("tyrri_meropi@hotmail.com")).toBe(true);
    expect(isStudioAdminEmail("meropityrri@gmail.com")).toBe(true);
    expect(isStudioAdminEmail("client@example.com")).toBe(false);
  });

  it("adds STUDIO_ADMIN_EMAILS on top of the defaults", () => {
    vi.stubEnv("STUDIO_ADMIN_EMAILS", "owner@meti-pilates.com, extra@meti-pilates.com");
    vi.stubEnv("STUDIO_ADMIN_EMAIL", "");
    expect(studioAdminEmails()).toEqual([
      "barridasg@gmail.com",
      "tyrri_meropi@hotmail.com",
      "meropityrri@gmail.com",
      "owner@meti-pilates.com",
      "extra@meti-pilates.com",
    ]);
    expect(isStudioAdminEmail("barridasg@gmail.com")).toBe(true);
    expect(isStudioAdminEmail("owner@meti-pilates.com")).toBe(true);
  });
});
