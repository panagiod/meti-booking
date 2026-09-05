import type { Locale } from "@/i18n/types";
import type { LegalBundle } from "@/i18n/legal-types";
import legalEn from "@/i18n/locales/legal-en";
import legalEl from "@/i18n/locales/legal-el";

const bundles: Record<Locale, LegalBundle> = {
  en: legalEn,
  el: legalEl,
};

export function getLegal(locale: Locale): LegalBundle {
  return bundles[locale] ?? bundles.el;
}

export type { LegalBundle, LegalPage, CookiesPage, FaqItem } from "@/i18n/legal-types";
