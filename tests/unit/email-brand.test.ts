import { describe, expect, it } from "vitest";
import { EMAIL_BRAND, renderEmailHtml } from "@/lib/email";

describe("studio email branding", () => {
  it("uses the cream, ink, and forest palette instead of marketplace orange", () => {
    const html = renderEmailHtml(
      "Your session is confirmed!",
      `<a href="https://meti-pilates.com/book" style="background:${EMAIL_BRAND.forest};">View booking</a>`
    );

    expect(html).toContain("MeTi Pilates");
    expect(html).toContain("Reformer pilates");
    expect(html).toContain(EMAIL_BRAND.cream);
    expect(html).toContain(EMAIL_BRAND.ink);
    expect(html).toContain(EMAIL_BRAND.forest);
    expect(html).not.toMatch(/#ff6b35|#ff7a47|#1a1a2e/i);
    expect(html).not.toContain(">M</td>");
  });
});
