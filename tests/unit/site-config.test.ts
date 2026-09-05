import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatStudioPhone,
  getSiteUrl,
  getStudioNotificationEmail,
  getStudioNotificationEmails,
  isPublicPhone,
  sanitizeStudioPhone,
  siteConfig,
  studioMapsUrl,
  studioTelHref,
} from "@/lib/site-config";

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

describe("studio phone", () => {
  it("hides empty and placeholder numbers", () => {
    expect(isPublicPhone("")).toBe(false);
    expect(isPublicPhone("(555) 012-3456")).toBe(false);
    expect(sanitizeStudioPhone("(555) 012-3456")).toBe("");
  });

  it("keeps a real number", () => {
    expect(isPublicPhone("+357 25 123456")).toBe(true);
    expect(sanitizeStudioPhone(" +357 25 123456 ")).toBe("+357 25 123456");
  });

  it("opens the shared Google Maps pin", () => {
    expect(studioMapsUrl()).toBe("https://maps.app.goo.gl/r2C9X5e88pgco3hT7?g_st=ac");
    expect(siteConfig.mapsLat).toBe(34.893656);
    expect(siteConfig.mapsLng).toBe(33.025257);
  });

  it("publishes the Cyprus studio mobile", () => {
    expect(siteConfig.phone).toBe("+35795519786");
    expect(isPublicPhone(siteConfig.phone)).toBe(true);
    expect(formatStudioPhone(siteConfig.phone)).toBe("+357 95 519786");
    expect(studioTelHref(siteConfig.phone)).toBe("tel:+35795519786");
  });
});
