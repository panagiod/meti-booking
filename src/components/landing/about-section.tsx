"use client";

import Link from "next/link";
import { useTranslations } from "@/components/providers/locale-provider";

export function AboutSection() {
  const t = useTranslations();
  const { about } = t;

  return (
    <section id="about" className="border-t border-[var(--studio-line)] bg-[var(--studio-warm)]">
      <div className="studio-container py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-[var(--studio-ink)]">
            {about.title}
          </h2>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-[var(--studio-muted)]">
            <p>{about.intro}</p>
            <p>{about.certificationsIntro}</p>
          </div>

          <ul className="mt-6 space-y-3 text-base leading-relaxed text-[var(--studio-ink)]">
            {about.certifications.map((item) => (
              <li key={item.name} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--studio-accent)]" />
                <span>
                  <strong className="font-medium text-[var(--studio-ink)]">{item.name}</strong>
                  {item.detail ? <span className="text-[var(--studio-muted)]"> ({item.detail})</span> : null}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-base leading-relaxed text-[var(--studio-muted)]">
            {about.specialization}
          </p>

          <h3 className="font-display mt-12 text-[clamp(1.5rem,3vw,2rem)] leading-tight text-[var(--studio-ink)]">
            {about.philosophyTitle}
          </h3>

          <div className="mt-6 space-y-5 text-base leading-relaxed text-[var(--studio-muted)]">
            <p>{about.philosophyParagraph1}</p>
            <p>{about.philosophyParagraph2}</p>
            <p>{about.programIntro}</p>
          </div>

          <ul className="mt-5 space-y-3 text-base leading-relaxed text-[var(--studio-ink)]">
            {about.programBenefits.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--studio-accent)]" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-6 sm:p-8">
            <p className="font-display text-xl text-[var(--studio-ink)] sm:text-2xl">
              {about.closingTitle}
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--studio-muted)]">
              {about.closingText}
            </p>
            <div className="mt-6">
              <Link href="/book" className="studio-btn studio-btn-primary w-full sm:w-auto">
                {t.hero.bookSession}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
