import { describe, expect, it } from "vitest";
import {
  formatHeroTitle,
  mergeLocaleContent,
  normalizeStudioContent,
  studioBranding,
} from "@/lib/studio-content";
import { siteConfig } from "@/lib/site-config";

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
    expect(merged.hero.bookSession).toBe("Κλείστε θέση");
    expect(merged.about.title).toBe("Σχετικά | Μερόπη Τίρρη");
    expect(merged.about.philosophyTitle).toBe("Η φιλοσοφία μας");
  });

  it("refreshes older translated Greek biography and CTAs", () => {
    const merged = mergeLocaleContent("el", {
      hero: {
        bookSession: "Κράτηση reformer",
        description:
          "Reformer pilates με βάση τη φυσιοθεραπεία σε μικρά τμήματα — εξατομικευμένη φροντίδα, ασφαλής κίνηση και διαρκή αποτελέσματα.",
      },
      about: {
        intro:
          "Η Μερόπη Τίρρη είναι εξειδικευμένη Φυσιοθεραπεύτρια, απόφοιτος του Τμήματος Φυσιοθεραπείας του Διεθνούς Πανεπιστημίου της Ελλάδος (πρώην ΤΕΙ Θεσσαλονίκης). Από το 2015 ασκεί το επάγγελμα της φυσιοθεραπείας με απόλυτη αφοσίωση, επενδύοντας διαρκώς στη διεύρυνση των γνώσεών της μέσα από εξειδικευμένα σεμινάρια και μεταπτυχιακά προγράμματα υψηλού επιπέδου.",
      },
    });

    expect(merged.hero.bookSession).toBe("Κλείστε θέση");
    expect(merged.hero.description).toContain("ολιγομελή τμήματα");
    expect(merged.about.intro).toContain("απόφοιτη");
    expect(merged.about.intro).not.toContain("απόφοιτος");
  });

  it("keeps custom Greek copy", () => {
    const merged = mergeLocaleContent("el", {
      hero: { title: "Κλινικό pilates στη Λεμεσό" },
    });
    expect(merged.hero.title).toBe("Κλινικό pilates στη Λεμεσό");
  });
});

describe("studio location", () => {
  it("fills the Greek address when stored content only has English", () => {
    const content = normalizeStudioContent({
      location: siteConfig.location,
    });
    expect(content.locationEl).toBe(
      "Χριστόφορου Γιατρού 60Α, Άγιος Ιωάννης Πιτσιλιάς, 4071, Λεμεσός"
    );
    expect(studioBranding(content, "el").location).toBe(content.locationEl);
    expect(studioBranding(content, "en").location).toBe(siteConfig.location);
  });
});
