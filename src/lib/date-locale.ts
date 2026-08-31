import type { Locale } from "@/i18n";
import { enUS, el } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";

/** Nominative Greek month names (not genitive e.g. Σεπτεμβρίου). */
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

export const GREEK_MONTHS_NARROW = [
  "Ι",
  "Φ",
  "Μ",
  "Α",
  "Μ",
  "Ι",
  "Ι",
  "Α",
  "Σ",
  "Ο",
  "Ν",
  "Δ",
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

function greekMonthName(
  monthIndex: number,
  width: string = "wide"
): string {
  if (width === "abbreviated" || width === "short") {
    return GREEK_MONTHS_ABBR[monthIndex];
  }
  if (width === "narrow") {
    return GREEK_MONTHS_NARROW[monthIndex];
  }
  return GREEK_MONTHS_WIDE[monthIndex];
}

/** date-fns `el` uses genitive months in formatted dates — override to nominative. */
const elNominative: DateFnsLocale = {
  ...el,
  localize: {
    ...el.localize,
    month: (value, options) =>
      greekMonthName(value, options?.width ? String(options.width) : "wide"),
  },
};

export function getDateFnsLocale(locale: Locale): DateFnsLocale {
  return locale === "el" ? elNominative : enUS;
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
      return `${GREEK_WEEKDAYS_WIDE[date.getDay()]}, ${day} ${GREEK_MONTHS_WIDE[month]} ${year}`;
  }
}
