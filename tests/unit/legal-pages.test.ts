import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getLegal } from "@/i18n/legal";
import { COOKIE_NOTICE_KEY, LOCALE_COOKIE } from "@/i18n";

describe("legal pages", () => {
  it("uses the real cookie names in both languages", () => {
    for (const locale of ["el", "en"] as const) {
      const keys = getLegal(locale).cookies.rows.map((row) => row.key);
      expect(keys).toContain("better-auth.session_token");
      expect(keys).toContain("__Secure-better-auth.session_token");
      expect(keys).toContain(LOCALE_COOKIE);
      expect(keys).not.toContain("lang");
      expect(getLegal(locale).cookies.storageRows.map((row) => row.key)).toContain(
        COOKIE_NOTICE_KEY
      );
    }
  });

  it("states GDPR bases, processors, and the Cyprus DPA in Greek", () => {
    const privacy = JSON.stringify(getLegal("el").privacy);
    expect(privacy).toContain("άρθρο 6");
    expect(privacy).toContain("Resend");
    expect(privacy).toContain("Hetzner");
    expect(privacy).toContain("dataprotection.gov.cy");
    expect(privacy).toContain("Επίτροπο Προστασίας Δεδομένων");
    expect(privacy).toContain("τηλέφωνο");
  });

  it("explains the leisure-service withdrawal exemption", () => {
    expect(getLegal("el").terms.sections.some((section) =>
      section.paragraphs?.some((paragraph) => paragraph.includes("υπαναχώρησης"))
    )).toBe(true);
    expect(getLegal("en").terms.sections.some((section) =>
      section.paragraphs?.some((paragraph) => paragraph.includes("14-day"))
    )).toBe(true);
  });

  it("does not load Vercel Analytics", () => {
    const layout = readFileSync(join(__dirname, "../../src/app/layout.tsx"), "utf8");
    expect(layout).not.toContain("@vercel/analytics");
    expect(layout).not.toContain("<Analytics");
  });
});
