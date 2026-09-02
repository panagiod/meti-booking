import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl, getStudioNotificationEmail, getStudioNotificationEmails } from "@/lib/site-config";

describe("getSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to the production studio domain", () => {
    expect(getSiteUrl()).toBe("https://meti-pilates.com");
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

describe("getStudioNotificationEmails", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("supports multiple comma-separated addresses", () => {
    vi.stubEnv(
      "STUDIO_NOTIFICATION_EMAIL",
      "tyrri_meropi@hotmail.com, partner@example.com"
    );
    expect(getStudioNotificationEmails()).toEqual([
      "tyrri_meropi@hotmail.com",
      "partner@example.com",
    ]);
    expect(getStudioNotificationEmail()).toBe("tyrri_meropi@hotmail.com");
  });

  it("deduplicates addresses case-insensitively", () => {
    vi.stubEnv(
      "STUDIO_NOTIFICATION_EMAIL",
      "Studio@Example.com; studio@example.com, Other@Example.com"
    );
    expect(getStudioNotificationEmails()).toEqual([
      "studio@example.com",
      "other@example.com",
    ]);
  });
});
