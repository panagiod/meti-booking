import type { Locale, Messages } from "./types";
import en from "./locales/en";
import el from "./locales/el";

const messages: Record<Locale, Messages> = { en, el };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.en;
}

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "el";
}

export * from "./types";
