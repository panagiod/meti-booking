"use client";

import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n";

const options: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "el", label: "ΕΛ" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--studio-line)] p-0.5 text-xs font-medium",
        className
      )}
      role="group"
      aria-label={t.language.ariaLabel}
    >
      {options.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLocale(opt.code)}
          className={cn(
            "rounded-full px-2.5 py-1 transition",
            locale === opt.code
              ? "bg-[var(--studio-ink)] text-white"
              : "text-[var(--studio-muted)] hover:text-[var(--studio-ink)]"
          )}
          aria-pressed={locale === opt.code}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
