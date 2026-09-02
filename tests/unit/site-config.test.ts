import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl, getStudioNotificationEmail } from "@/lib/site-config";

describe("getSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to the production studio domain", () => {
    expect(getSiteUrl()).toBe("https://metipilates.com");
  });

  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://custom.example.com");
    expect(getSiteUrl()).toBe("https://custom.example.com");
  });
});

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
