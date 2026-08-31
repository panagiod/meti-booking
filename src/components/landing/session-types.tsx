"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { useTranslations } from "@/components/providers/locale-provider";

export function SessionTypes() {
  const t = useTranslations();
  const session = siteConfig.sessionTypes[0];

  if (!session) return null;

  return (
    <section id="sessions" className="studio-container py-14 sm:py-20 lg:py-28">
      <div className="mb-10 flex flex-col gap-4 sm:mb-14 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--studio-muted)]">
            {t.sessions.label}
          </p>
          <h2 className="font-display mt-3 text-3xl text-[var(--studio-ink)] sm:text-4xl lg:text-5xl">
            {t.sessions.title}
          </h2>
        </div>
        <p className="max-w-sm text-sm text-[var(--studio-muted)] sm:text-base">
          {t.sessions.subtitle}
        </p>
      </div>

      <Link
        href="/book"
        className="group grid overflow-hidden rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] lg:grid-cols-2"
      >
        <div className="relative aspect-[16/11] w-full sm:aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]">
          <Image
            src={siteConfig.images.reformer}
            alt={t.hero.imageAlt}
            fill
            className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
          <h3 className="font-display text-2xl text-[var(--studio-ink)] sm:text-3xl lg:text-4xl">
            {t.sessions.types.reformer.name}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--studio-muted)] sm:mt-4 sm:text-base">
            {t.sessions.types.reformer.description}
          </p>
          <div className="mt-6 flex flex-col gap-3 border-t border-[var(--studio-line)] pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
            <span className="text-sm text-[var(--studio-ink)]">
              {t.sessions.types.reformer.duration} · {t.sessions.fromPrice} €{session.priceFrom}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--studio-ink)]">
              {t.sessions.book}
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-12 rounded-2xl bg-[var(--studio-ink)] px-6 py-10 text-center sm:mt-16 sm:px-8 sm:py-12 lg:px-16 lg:py-14">
        <h3 className="font-display text-2xl text-white sm:text-3xl lg:text-4xl">
          {t.sessions.readyTitle}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70">{t.sessions.readySubtitle}</p>
        <Link
          href="/book"
          className="studio-btn mt-6 bg-white text-[var(--studio-ink)] hover:bg-white/90 sm:mt-8"
        >
          {t.nav.bookNow}
        </Link>
      </div>
    </section>
  );
}
