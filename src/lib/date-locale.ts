import type { Locale } from "@/i18n";
import { enUS, el } from "date-fns/locale";

export function getDateFnsLocale(locale: Locale) {
  return locale === "el" ? el : enUS;
}
