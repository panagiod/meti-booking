"use client";

import { useTranslations } from "@/components/providers/locale-provider";

export function HowItWorks() {
  const t = useTranslations();

  return (
    <section id="how" className="border-t border-[var(--studio-line)]">
      <div className="studio-container py-16 sm:py-20">
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-[var(--studio-ink)]">
          {t.how.title}
        </h2>
        <p className="mt-3 max-w-xl text-base text-[var(--studio-muted)]">{t.how.subtitle}</p>

        <ol className="mt-10 grid min-w-0 gap-6 sm:grid-cols-3">
          {t.how.steps.map((step, index) => (
            <li
              key={step.title}
              className="min-w-0 rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--studio-muted)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display mt-3 text-xl text-[var(--studio-ink)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--studio-muted)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
