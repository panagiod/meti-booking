import type { Locale } from "@/i18n";
import { enUS, el } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";

/** Nominative month names — for standalone use (calendar header, month + year). */
export const GREEK_MONTHS_WIDE = [
  "Ιανουάριος",
  "Φεβρουάριος",
  "Μάρτιος",
  "Απρίλιος",
  "Μάιος",
  "Ιούνιος",
  "Ιούλιος",
  "Αύγουστος",
  "Σεπτέμβριος",
  "Οκτώβριος",
  "Νοέμβριος",
  "Δεκέμβριος",
] as const;

/** Genitive month names — required after a day number (3 Σεπτεμβρίου). */
export const GREEK_MONTHS_GENITIVE = [
  "Ιανουαρίου",
  "Φεβρουαρίου",
  "Μαρτίου",
  "Απριλίου",
  "Μαΐου",
  "Ιουνίου",
  "Ιουλίου",
  "Αυγούστου",
  "Σεπτεμβρίου",
  "Οκτωβρίου",
  "Νοεμβρίου",
  "Δεκεμβρίου",
] as const;

export const GREEK_MONTHS_ABBR = [
  "Ιαν",
  "Φεβ",
  "Μάρ",
  "Απρ",
  "Μάι",
  "Ιούν",
  "Ιούλ",
  "Αύγ",
  "Σεπ",
  "Οκτ",
  "Νοέ",
  "Δεκ",
] as const;

export const GREEK_WEEKDAYS_WIDE = [
  "Κυριακή",
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο",
] as const;

/** Native date-fns `el` uses genitive months with a day, which is correct Greek. */
export function getDateFnsLocale(locale: Locale): DateFnsLocale {
  return locale === "el" ? el : enUS;
}

export function formatGreekDate(
  date: Date,
  style: "long" | "short" | "monthYear"
): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  switch (style) {
    case "monthYear":
      return `${GREEK_MONTHS_WIDE[month]} ${year}`;
    case "short":
      return `${GREEK_WEEKDAYS_WIDE[date.getDay()]}, ${day} ${GREEK_MONTHS_ABBR[month]}`;
    case "long":
    default:
      return `${GREEK_WEEKDAYS_WIDE[date.getDay()]}, ${day} ${GREEK_MONTHS_GENITIVE[month]} ${year}`;
  }
}
