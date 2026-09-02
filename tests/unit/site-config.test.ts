import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudioNotificationEmail } from "@/lib/site-config";

describe("getStudioNotificationEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses STUDIO_NOTIFICATION_EMAIL when set", () => {
    vi.stubEnv("STUDIO_NOTIFICATION_EMAIL", "studio@example.com");
    expect(getStudioNotificationEmail()).toBe("studio@example.com");
  });

  it("falls back to the studio contact email from site config", () => {
    expect(getStudioNotificationEmail()).toBe("tyrri_meropi@hotmail.com");
  });
});
