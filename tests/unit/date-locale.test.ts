import { describe, it, expect } from "vitest";
import { format } from "date-fns";
import {
  formatGreekDate,
  getDateFnsLocale,
  GREEK_MONTHS_WIDE,
} from "@/lib/date-locale";

describe("date-locale", () => {
  const september = new Date(2026, 8, 3); // 3 Sep 2026 (Thursday)

  it("uses nominative month names in date-fns format", () => {
    const el = getDateFnsLocale("el");
    expect(format(september, "d MMMM yyyy", { locale: el })).toBe("3 Σεπτέμβριος 2026");
    expect(format(september, "MMMM yyyy", { locale: el })).toBe("Σεπτέμβριος 2026");
    expect(format(september, "EEEE, d MMMM", { locale: el })).toBe(
      "Πέμπτη, 3 Σεπτέμβριος"
    );
  });

  it("does not use genitive month forms", () => {
    const el = getDateFnsLocale("el");
    const formatted = format(september, "d MMMM", { locale: el });
    expect(formatted).not.toContain("Σεπτεμβρίου");
    expect(formatted).toContain("Σεπτέμβριος");
  });

  it("formatGreekDate returns nominative long form", () => {
    expect(formatGreekDate(september, "long")).toBe("Πέμπτη, 3 Σεπτέμβριος 2026");
    expect(formatGreekDate(september, "monthYear")).toBe("Σεπτέμβριος 2026");
  });

  it("lists all twelve months in nominative form", () => {
    expect(GREEK_MONTHS_WIDE[8]).toBe("Σεπτέμβριος");
    expect(GREEK_MONTHS_WIDE).toHaveLength(12);
    GREEK_MONTHS_WIDE.forEach((name) => {
      expect(name).not.toMatch(/ου$/);
    });
  });
});
