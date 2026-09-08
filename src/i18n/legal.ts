import type { Locale } from "@/i18n/types";
import type { LegalBundle } from "@/i18n/legal-types";
import legalEn from "@/i18n/locales/legal-en";
import legalEl from "@/i18n/locales/legal-el";
import { DEFAULT_CANCEL_HOURS, resolveCancelHours } from "@/lib/booking-config";

const bundles: Record<Locale, LegalBundle> = {
  en: legalEn,
  el: legalEl,
};

function interpolateHours<T>(value: T, hours: number): T {
  if (typeof value === "string") {
    return value.replaceAll("{hours}", String(hours)) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => interpolateHours(item, hours)) as T;
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      next[key] = interpolateHours(nested, hours);
    }
    return next as T;
  }
  return value;
}

export function getLegal(
  locale: Locale,
  hours: number = DEFAULT_CANCEL_HOURS
): LegalBundle {
  const bundle = bundles[locale] ?? bundles.el;
  return interpolateHours(bundle, resolveCancelHours(hours));
}

export type { LegalBundle, LegalPage, CookiesPage, FaqItem } from "@/i18n/legal-types";
