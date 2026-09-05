import { describe, expect, it } from "vitest";
import { defaultLocale, LOCALE_COOKIE } from "@/i18n";

describe("site language", () => {
  it("defaults to Greek and ignores the old English cookie name", () => {
    expect(defaultLocale).toBe("el");
    expect(LOCALE_COOKIE).toBe("meti-lang");
  });
});
