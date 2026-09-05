"use client";

import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n";

const options: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "el", label: "ΕΛ" },
];

export function LanguageSwitcher({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();
  const onDark = tone === "onDark";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 text-xs font-medium",
        onDark ? "border-white/20" : "border-[var(--border)]",
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
            "min-w-10 rounded-full px-3 py-1.5 transition",
            locale === opt.code
              ? onDark
                ? "bg-white text-[var(--secondary)]"
                : "bg-[var(--text-primary)] text-[var(--surface)]"
              : onDark
                ? "text-white/70 hover:text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
          aria-pressed={locale === opt.code}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
