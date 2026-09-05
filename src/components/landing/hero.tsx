"use client";

import Image from "next/image";
import Link from "next/link";
import {
  formatStudioPhone,
  isPublicPhone,
  siteConfig,
  studioTelHref,
} from "@/lib/site-config";
import {
  formatMessage,
  useTranslations,
  useStudioBranding,
} from "@/components/providers/locale-provider";
import { StudioMapLink } from "@/components/landing/studio-map-link";

export function Hero() {
  const t = useTranslations();
  const studio = useStudioBranding();
  const session = siteConfig.sessionTypes[0];

  return (
    <section className="border-b border-[var(--studio-line)]">
      <div className="studio-container">
        <div className="grid items-center gap-0 lg:grid-cols-2 lg:min-h-[calc(100vh-4.25rem)]">
          <div className="relative order-1 aspect-[3/2] min-w-0 w-full overflow-hidden sm:aspect-[16/10] lg:order-2 lg:aspect-auto lg:min-h-full">
            <Image
              src={studio.images.hero}
              alt={t.hero.imageAlt}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="order-2 flex min-w-0 flex-col justify-center py-10 sm:py-14 lg:order-1 lg:py-24 lg:pr-10">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-[var(--studio-muted)]">
              {t.hero.eyebrow}
            </p>
            <h1 className="font-display max-w-lg text-[clamp(2rem,6.4vw,4.25rem)] leading-[1.15] text-[var(--studio-ink)]">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--studio-muted)]">
              {t.hero.description}
            </p>
            {session && (
              <p className="mt-4 flex max-w-md flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--studio-ink)]">
                <span>{formatMessage(t.hero.priceLine, { price: studio.sessionPriceFrom })}</span>
                <span aria-hidden className="text-[var(--studio-line)]">
                  ·
                </span>
                <span>{formatMessage(t.hero.classSize, { count: siteConfig.slotCapacity })}</span>
                <span aria-hidden className="text-[var(--studio-line)]">
                  ·
                </span>
                <span>{t.hero.payAtStudio}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <Link href="/book" className="studio-btn studio-btn-primary w-full sm:w-auto">
                {t.hero.bookSession}
              </Link>
              {isPublicPhone(studio.phone) ? (
                <a
                  href={studioTelHref(studio.phone)}
                  className="studio-btn studio-btn-ghost w-full text-center sm:w-auto"
                >
                  {formatStudioPhone(studio.phone)}
                </a>
              ) : null}
            </div>
            <p className="mt-8 text-sm leading-relaxed break-words text-[var(--studio-muted)] sm:mt-12">
              <StudioMapLink className="text-[var(--studio-muted)]">{studio.location}</StudioMapLink>
              <span className="mx-2 hidden text-[var(--studio-line)] sm:inline">·</span>
              <span className="mt-1 block sm:mt-0 sm:inline">{t.common.hours}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
