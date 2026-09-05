import en from "@/i18n/locales/en";
import el from "@/i18n/locales/el";
import { sanitizeStudioPhone, siteConfig } from "@/lib/site-config";
import type { Locale, Messages } from "@/i18n";
import type { StudioContentData, StudioLocaleContent } from "@/lib/studio-content-types";
import { studioContentSchema } from "@/lib/studio-content-types";

export const STUDIO_CONTENT_ID = "default";

export function buildDefaultLocaleContent(locale: Locale): StudioLocaleContent {
  const messages = locale === "el" ? el : en;
  return {
    meta: { ...messages.meta },
    hero: {
      eyebrow: messages.hero.eyebrow,
      title: messages.hero.title,
      description: messages.hero.description,
      bookSession: messages.hero.bookSession,
      imageAlt: messages.hero.imageAlt,
    },
    about: { ...messages.about },
    common: { hours: messages.common.hours },
  };
}

/** Older Greek defaults that were translated from English or had grammar issues. */
const SUPERSEDED_EL_COPY: Record<string, string> = {
  "Η υγεία και η κίνησή σας.": el.hero.title,
  "Κράτηση μαθήματος": el.hero.bookSession,
  "Κράτηση reformer": el.hero.bookSession,
  "Σχετικά με εμάς | Μερόπη Τίρρη": el.about.title,
  "Η Φιλοσοφία του Κέντρου μας": el.about.philosophyTitle,
  "Reformer pilates με βάση τη φυσιοθεραπεία σε μικρά τμήματα — εξατομικευμένη φροντίδα, ασφαλής κίνηση και διαρκή αποτελέσματα.":
    el.hero.description,
  "Reformer pilates — κλείστε μάθημα στη Λεμεσό": el.hero.imageAlt,
  "Φυσιοθεραπεύτρια και εκπαιδεύτρια Clinical Pilates. Μαθήματα reformer σε μικρά τμήματα — εξατομικευμένη φροντίδα και ασφαλής κίνηση. Κλείστε online.":
    el.meta.description,
  "Η Μερόπη Τίρρη είναι εξειδικευμένη Φυσιοθεραπεύτρια, απόφοιτος του Τμήματος Φυσιοθεραπείας του Διεθνούς Πανεπιστημίου της Ελλάδος (πρώην ΤΕΙ Θεσσαλονίκης). Από το 2015 ασκεί το επάγγελμα της φυσιοθεραπείας με απόλυτη αφοσίωση, επενδύοντας διαρκώς στη διεύρυνση των γνώσεών της μέσα από εξειδικευμένα σεμινάρια και μεταπτυχιακά προγράμματα υψηλού επιπέδου.":
    el.about.intro,
  "Υιοθετώντας τη φιλοσοφία των ολιγομελών τμημάτων (small groups), διασφαλίζουμε ότι κάθε ασκούμενος απολαμβάνει την προσωπική προσοχή και την αυστηρή επίβλεψη που του αρμόζει. Η ροή του μαθήματος προσαρμόζεται προκειμένου να εγγυάται τη σωστή και ασφαλή εκτέλεση κάθε κίνησης.":
    el.about.philosophyParagraph2,
  "Βασισμένο εξολοκλήρου στις αρχές της φυσιοθεραπείας, το πρόγραμμά μας είναι ιδανικό για:":
    el.about.programIntro,
  "Τρί, Πέμ, Σάβ · δείτε το ημερολόγιο": el.common.hours,
};

function refreshSupersededCopy(value: string, locale: Locale): string {
  if (locale !== "el") return value;
  return SUPERSEDED_EL_COPY[value] ?? value;
}

export function formatHeroTitle(title: string) {
  if (/,\s/.test(title)) return title.replace(/,\s*/, ",\n");
  return title.replace(/\s+και\s+/, " και\n");
}

type LocaleContentPatch = {
  meta?: Partial<StudioLocaleContent["meta"]>;
  hero?: Partial<StudioLocaleContent["hero"]>;
  about?: Partial<StudioLocaleContent["about"]>;
  common?: Partial<StudioLocaleContent["common"]>;
};

export function mergeLocaleContent(
  locale: Locale,
  partial?: LocaleContentPatch
): StudioLocaleContent {
  const defaults = buildDefaultLocaleContent(locale);
  if (!partial) return defaults;

  const hero = { ...defaults.hero, ...partial.hero };
  const about = {
    ...defaults.about,
    ...partial.about,
    certifications: partial.about?.certifications ?? defaults.about.certifications,
    programBenefits: partial.about?.programBenefits ?? defaults.about.programBenefits,
  };

  const meta = { ...defaults.meta, ...partial.meta };
  const common = { ...defaults.common, ...partial.common };

  return {
    meta: {
      ...meta,
      description: refreshSupersededCopy(meta.description, locale),
    },
    hero: {
      ...hero,
      title: refreshSupersededCopy(hero.title, locale),
      description: refreshSupersededCopy(hero.description, locale),
      bookSession: refreshSupersededCopy(hero.bookSession, locale),
      imageAlt: refreshSupersededCopy(hero.imageAlt, locale),
    },
    about: {
      ...about,
      title: refreshSupersededCopy(about.title, locale),
      intro: refreshSupersededCopy(about.intro, locale),
      philosophyTitle: refreshSupersededCopy(about.philosophyTitle, locale),
      philosophyParagraph2: refreshSupersededCopy(about.philosophyParagraph2, locale),
      programIntro: refreshSupersededCopy(about.programIntro, locale),
    },
    common: {
      ...common,
      hours: refreshSupersededCopy(common.hours, locale),
    },
  };
}

export function normalizeStudioContent(data: unknown): StudioContentData {
  const defaults = buildDefaultStudioContent();
  if (!data || typeof data !== "object") return defaults;

  const raw = data as Partial<StudioContentData>;
  return studioContentSchema.parse({
    ...defaults,
    ...raw,
    phone: sanitizeStudioPhone(raw.phone) || defaults.phone,
    location: raw.location?.trim() || defaults.location,
    locationEl: raw.locationEl?.trim() || defaults.locationEl,
    contentEn: mergeLocaleContent("en", raw.contentEn),
    contentEl: mergeLocaleContent("el", raw.contentEl),
  });
}

export function buildDefaultStudioContent(): StudioContentData {
  return {
    name: siteConfig.name,
    location: siteConfig.location,
    locationEl: siteConfig.locationEl,
    phone: siteConfig.phone,
    email: siteConfig.email,
    heroImage: siteConfig.images.hero,
    reformerImage: siteConfig.images.reformer,
    sessionPriceFrom: siteConfig.sessionTypes[0]?.priceFrom ?? 10,
    contentEn: buildDefaultLocaleContent("en"),
    contentEl: buildDefaultLocaleContent("el"),
  };
}

export function mergeMessages(base: Messages, overrides: StudioLocaleContent): Messages {
  return {
    ...base,
    meta: { ...base.meta, ...overrides.meta },
    hero: { ...base.hero, ...overrides.hero },
    about: {
      ...base.about,
      ...overrides.about,
      certifications: overrides.about.certifications,
      programBenefits: overrides.about.programBenefits,
    },
    common: { ...base.common, ...overrides.common },
  };
}

export function localeContentFromStudio(
  content: StudioContentData,
  locale: Locale
): StudioLocaleContent {
  return locale === "el" ? content.contentEl : content.contentEn;
}

export function studioBranding(content: StudioContentData, locale: Locale = "en") {
  return {
    name: content.name,
    location: locale === "el" ? content.locationEl : content.location,
    phone: content.phone,
    email: content.email,
    images: {
      hero: content.heroImage,
      reformer: content.reformerImage,
    },
    sessionPriceFrom: content.sessionPriceFrom,
  };
}
