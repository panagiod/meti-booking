import en from "@/i18n/locales/en";
import el from "@/i18n/locales/el";
import { siteConfig } from "@/lib/site-config";
import type { Locale, Messages } from "@/i18n";
import type { StudioContentData, StudioLocaleContent } from "@/lib/studio-content-types";

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
    common: { hours: messages.common.hours },
  };
}

export function buildDefaultStudioContent(): StudioContentData {
  return {
    name: siteConfig.name,
    location: siteConfig.location,
    phone: siteConfig.phone,
    email: siteConfig.email,
    heroImage: siteConfig.images.hero,
    reformerImage: siteConfig.images.reformer,
    sessionPriceFrom: siteConfig.sessionTypes[0]?.priceFrom ?? 45,
    contentEn: buildDefaultLocaleContent("en"),
    contentEl: buildDefaultLocaleContent("el"),
  };
}

export function mergeMessages(base: Messages, overrides: StudioLocaleContent): Messages {
  return {
    ...base,
    meta: { ...base.meta, ...overrides.meta },
    hero: { ...base.hero, ...overrides.hero },
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
