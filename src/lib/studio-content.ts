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

/** Previous Greek defaults that made titles wrap unlike English. */
const SUPERSEDED_EL_COPY: Record<string, string> = {
  "Η υγεία και η κίνησή σας.": el.hero.title,
  "Κράτηση μαθήματος": el.hero.bookSession,
  "Σχετικά με εμάς | Μερόπη Τίρρη": el.about.title,
  "Η Φιλοσοφία του Κέντρου μας": el.about.philosophyTitle,
};

function refreshSupersededCopy(value: string, locale: Locale): string {
  if (locale !== "el") return value;
  return SUPERSEDED_EL_COPY[value] ?? value;
}

export function formatHeroTitle(title: string) {
  if (/,\s/.test(title)) return title.replace(/,\s*/, ",\n");
  return title.replace(/\s+και\s+/, " και\n");
}

export function mergeLocaleContent(
  locale: Locale,
  partial?: Partial<StudioLocaleContent>
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

  return {
    meta: { ...defaults.meta, ...partial.meta },
    hero: {
      ...hero,
      title: refreshSupersededCopy(hero.title, locale),
      bookSession: refreshSupersededCopy(hero.bookSession, locale),
    },
    about: {
      ...about,
      title: refreshSupersededCopy(about.title, locale),
      philosophyTitle: refreshSupersededCopy(about.philosophyTitle, locale),
    },
    common: { ...defaults.common, ...partial.common },
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
    contentEn: mergeLocaleContent("en", raw.contentEn),
    contentEl: mergeLocaleContent("el", raw.contentEl),
  });
}

export function buildDefaultStudioContent(): StudioContentData {
  return {
    name: siteConfig.name,
    location: siteConfig.location,
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

export function studioBranding(content: StudioContentData) {
  return {
    name: content.name,
    location: content.location,
    phone: content.phone,
    email: content.email,
    images: {
      hero: content.heroImage,
      reformer: content.reformerImage,
    },
    sessionPriceFrom: content.sessionPriceFrom,
  };
}
