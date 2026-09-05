import { describe, expect, it } from "vitest";
import {
  formatHeroTitle,
  mergeLocaleContent,
} from "@/lib/studio-content";

describe("formatHeroTitle", () => {
  it("wraps English and Greek titles after the comma", () => {
    expect(formatHeroTitle("Your health, your movement.")).toBe(
      "Your health,\nyour movement."
    );
    expect(formatHeroTitle("Η υγεία σας, η κίνησή σας.")).toBe(
      "Η υγεία σας,\nη κίνησή σας."
    );
  });

  it("wraps the previous Greek title after και", () => {
    expect(formatHeroTitle("Η υγεία και η κίνησή σας.")).toBe(
      "Η υγεία και\nη κίνησή σας."
    );
  });
});

describe("mergeLocaleContent", () => {
  it("refreshes superseded Greek defaults so layout matches English", () => {
    const merged = mergeLocaleContent("el", {
      hero: {
        title: "Η υγεία και η κίνησή σας.",
        bookSession: "Κράτηση μαθήματος",
      },
      about: {
        title: "Σχετικά με εμάς | Μερόπη Τίρρη",
        philosophyTitle: "Η Φιλοσοφία του Κέντρου μας",
      },
    });

    expect(merged.hero.title).toBe("Η υγεία σας, η κίνησή σας.");
    expect(merged.hero.bookSession).toBe("Κράτηση reformer");
    expect(merged.about.title).toBe("Σχετικά | Μερόπη Τίρρη");
    expect(merged.about.philosophyTitle).toBe("Η φιλοσοφία μας");
  });

  it("keeps custom Greek copy", () => {
    const merged = mergeLocaleContent("el", {
      hero: { title: "Κλινικό pilates στη Λεμεσό" },
    });
    expect(merged.hero.title).toBe("Κλινικό pilates στη Λεμεσό");
  });
});
