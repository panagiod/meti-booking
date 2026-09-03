import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_STUDIO_ADMIN_EMAILS, isStudioAdminEmail, studioAdminEmails } from "@/lib/studio-admins";

describe("studioAdminEmails", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to the studio owner Google account", () => {
    vi.stubEnv("STUDIO_ADMIN_EMAILS", "");
    vi.stubEnv("STUDIO_ADMIN_EMAIL", "");
    expect(studioAdminEmails()).toEqual(DEFAULT_STUDIO_ADMIN_EMAILS);
    expect(isStudioAdminEmail("barridasg@gmail.com")).toBe(true);
    expect(isStudioAdminEmail("BARRIDASG@gmail.com")).toBe(true);
    expect(isStudioAdminEmail("client@example.com")).toBe(false);
  });

  it("uses STUDIO_ADMIN_EMAILS when set", () => {
    vi.stubEnv("STUDIO_ADMIN_EMAILS", "owner@meti-pilates.com, extra@meti-pilates.com");
    vi.stubEnv("STUDIO_ADMIN_EMAIL", "");
    expect(studioAdminEmails()).toEqual(["owner@meti-pilates.com", "extra@meti-pilates.com"]);
    expect(isStudioAdminEmail("barridasg@gmail.com")).toBe(false);
  });
});
