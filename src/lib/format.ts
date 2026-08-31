import type { Locale } from "@/i18n";
import { formatGreekDate } from "@/lib/date-locale";

export function formatMoney(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "el" ? "el-GR" : "en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatLongDate(
  dateStr: string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const [y, m, d] = dateStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));

  if (locale === "el") {
    return formatGreekDate(date, "long");
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export function formatDateTime(iso: string, locale: Locale): string {
  const date = new Date(iso);

  if (locale === "el") {
    const time = date.toLocaleTimeString("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formatGreekDate(date, "long")}, ${time}`;
  }

  return date.toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
