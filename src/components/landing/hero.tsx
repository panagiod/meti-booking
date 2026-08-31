"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { useTranslations, useStudioBranding } from "@/components/providers/locale-provider";

export function Hero() {
  const t = useTranslations();
  const studio = useStudioBranding();
  const session = siteConfig.sessionTypes[0];

  return (
    <section className="border-b border-[var(--studio-line)]">
      <div className="studio-container">
        <div className="grid items-center gap-0 lg:grid-cols-2 lg:min-h-[calc(100vh-4.25rem)]">
          <div className="relative order-1 aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] lg:order-2 lg:aspect-auto lg:min-h-full">
            <Image
              src={studio.images.hero}
              alt={t.hero.imageAlt}
              fill
              priority
              className="object-cover object-[center_25%]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="order-2 flex flex-col justify-center py-10 sm:py-14 lg:order-1 lg:py-24 lg:pr-10">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-[var(--studio-muted)]">
              {t.hero.eyebrow}
            </p>
            <h1 className="font-display max-w-lg text-[clamp(2.25rem,7vw,4.5rem)] leading-[1.05] text-[var(--studio-ink)]">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--studio-muted)]">
              {t.hero.description}
            </p>
            {session && (
              <p className="mt-4 text-sm text-[var(--studio-ink)]">
                {t.sessions.types.reformer.duration} · {t.sessions.fromPrice} €{studio.sessionPriceFrom}
              </p>
            )}
            <div className="mt-8 sm:mt-10">
              <Link href="/book" className="studio-btn studio-btn-primary w-full sm:w-auto">
                {t.hero.bookSession}
              </Link>
            </div>
            <p className="mt-8 text-sm leading-relaxed text-[var(--studio-muted)] sm:mt-12">
              {studio.location}
              <span className="mx-2 hidden text-[var(--studio-line)] sm:inline">·</span>
              <span className="mt-1 block sm:mt-0 sm:inline">{t.common.hours}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
