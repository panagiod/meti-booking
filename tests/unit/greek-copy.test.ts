import { describe, expect, it } from "vitest";
import el from "@/i18n/locales/el";

describe("Greek studio copy", () => {
  it("addresses the client in the formal plural", () => {
    expect(el.dashboard.hello).toBe("Καλώς ήρθατε, {name}");
    expect(el.dashboard.hello).not.toMatch(/\bσου\b/);
    expect(el.nav.bookNow).toBe("Κλείστε θέση");
    expect(el.hero.bookSession).toBe("Κλείστε θέση");
  });

  it("agrees booking status adjectives with feminine κράτηση", () => {
    expect(el.dashboard.statusConfirmed).toBe("Επιβεβαιωμένη");
    expect(el.dashboard.statusCompleted).toBe("Ολοκληρωμένη");
    expect(el.dashboard.statusCancelled).toBe("Ακυρωμένη");
  });

  it("translates the admin dashboard into formal Greek", () => {
    expect(el.admin.overviewTitle).toBe("Επισκόπηση στούντιο");
    expect(el.admin.navBookings).toBe("Κρατήσεις");
    expect(el.admin.navClients).toBe("Πελάτες");
    expect(el.admin.signOut).toBe("Αποσύνδεση");
    expect(el.admin.statusConfirmed).toBe("Επιβεβαιωμένη");
    expect(el.common.confirm).toBe("Επιβεβαίωση");
    expect(el.admin.weekScheduleSub).not.toMatch(/Nicosia/i);
  });

  it("uses natural studio phrasing instead of English calques", () => {
    const joined = JSON.stringify(el);
    expect(joined).not.toContain("το μάθημα πληρώνεται");
    expect(joined).not.toContain("Μη εμφάνιση");
    expect(joined).not.toContain("καθυστερημένους");
    expect(joined).not.toContain("απόφοιτος");
    expect(joined).not.toContain("εξολοκλήρου");
    expect(el.about.intro).toContain("απόφοιτη");
    expect(el.about.programIntro).toContain("εξ ολοκλήρου");
    expect(el.checkout.cancelNoShow).toContain("Εάν δεν προσέλθετε");
    expect(el.visit.policyNote).toContain("η συνεδρία χρεώνεται κανονικά");
  });
});
