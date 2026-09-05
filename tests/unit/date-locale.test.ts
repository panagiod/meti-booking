import { describe, it, expect } from "vitest";
import { format } from "date-fns";
import {
  formatGreekDate,
  getDateFnsLocale,
  GREEK_MONTHS_GENITIVE,
  GREEK_MONTHS_WIDE,
} from "@/lib/date-locale";

describe("date-locale", () => {
  const september = new Date(2026, 8, 3); // 3 Sep 2026 (Thursday)

  it("uses genitive month names when a day number is present", () => {
    const el = getDateFnsLocale("el");
    expect(format(september, "d MMMM yyyy", { locale: el })).toBe("3 Σεπτεμβρίου 2026");
    expect(format(september, "EEEE, d MMMM", { locale: el })).toBe("Πέμπτη, 3 Σεπτεμβρίου");
  });

  it("formatGreekDate uses genitive with a day and nominative for month-year", () => {
    expect(formatGreekDate(september, "long")).toBe("Πέμπτη, 3 Σεπτεμβρίου 2026");
    expect(formatGreekDate(september, "monthYear")).toBe("Σεπτέμβριος 2026");
  });

  it("keeps standalone month names in the nominative", () => {
    expect(GREEK_MONTHS_WIDE[8]).toBe("Σεπτέμβριος");
    expect(GREEK_MONTHS_GENITIVE[8]).toBe("Σεπτεμβρίου");
    expect(GREEK_MONTHS_WIDE).toHaveLength(12);
    expect(GREEK_MONTHS_GENITIVE).toHaveLength(12);
  });
});
