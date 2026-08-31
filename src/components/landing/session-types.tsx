"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { useTranslations } from "@/components/providers/locale-provider";

export function SessionTypes() {
  const t = useTranslations();
  const featured = siteConfig.sessionTypes.find((s) => s.featured);
  const others = siteConfig.sessionTypes.filter((s) => !s.featured);

  return (
    <section id="sessions" className="mx-auto max-w-[76rem] px-6 py-20 lg:px-10 lg:py-28">
      <div className="mb-14 flex flex-col gap-4 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--studio-muted)]">
            {t.sessions.label}
          </p>
          <h2 className="font-display mt-3 text-4xl text-[var(--studio-ink)] lg:text-5xl">
            {t.sessions.title}
          </h2>
        </div>
        <p className="max-w-sm text-[var(--studio-muted)]">{t.sessions.subtitle}</p>
      </div>

      {featured && (
        <Link
          href="/book"
          className="group mb-6 grid overflow-hidden rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] lg:grid-cols-2"
        >
          <div className="relative min-h-[18rem] lg:min-h-[22rem]">
            <Image
              src={siteConfig.images[featured.imageKey]}
              alt={t.sessions.types[featured.slug]?.name ?? featured.slug}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--studio-muted)]">
              {t.sessions.mostPopular}
            </p>
            <h3 className="font-display mt-3 text-3xl text-[var(--studio-ink)] lg:text-4xl">
              {t.sessions.types[featured.slug]?.name}
            </h3>
            <p className="mt-4 max-w-md text-[var(--studio-muted)]">
              {t.sessions.types[featured.slug]?.description}
            </p>
            <div className="mt-8 flex items-center justify-between border-t border-[var(--studio-line)] pt-6">
              <span className="text-sm text-[var(--studio-ink)]">
                {t.sessions.types[featured.slug]?.duration} · {t.sessions.fromPrice} €
                {featured.priceFrom}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--studio-ink)]">
                {t.sessions.book}
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="divide-y divide-[var(--studio-line)] border-y border-[var(--studio-line)]">
        {others.map((session) => (
          <Link
            key={session.slug}
            href="/book"
            className="group grid gap-6 py-6 transition hover:bg-[var(--studio-warm)]/40 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-8 sm:px-4"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-xl sm:h-16 sm:w-16">
              <Image
                src={siteConfig.images[session.imageKey]}
                alt={t.sessions.types[session.slug]?.name ?? session.slug}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div>
              <h3 className="font-display text-2xl text-[var(--studio-ink)]">
                {t.sessions.types[session.slug]?.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--studio-muted)]">
                {t.sessions.types[session.slug]?.description}
              </p>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
              <span className="text-sm text-[var(--studio-muted)]">
                {t.sessions.types[session.slug]?.duration} · €{session.priceFrom}
              </span>
              <ArrowUpRight className="h-4 w-4 text-[var(--studio-muted)] transition group-hover:text-[var(--studio-ink)]" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-[var(--studio-ink)] px-8 py-12 text-center lg:px-16 lg:py-14">
        <h3 className="font-display text-3xl text-white lg:text-4xl">{t.sessions.readyTitle}</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70">{t.sessions.readySubtitle}</p>
        <Link
          href="/book"
          className="studio-btn mt-8 bg-white text-[var(--studio-ink)] hover:bg-white/90"
        >
          {t.nav.bookNow}
        </Link>
      </div>
    </section>
  );
}
