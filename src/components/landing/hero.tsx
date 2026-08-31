"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { useTranslations } from "@/components/providers/locale-provider";

export function Hero() {
  const t = useTranslations();

  return (
    <section className="border-b border-[var(--studio-line)]">
      <div className="mx-auto grid max-w-[76rem] lg:grid-cols-2 lg:min-h-[calc(100vh-4.25rem)]">
        <div className="flex flex-col justify-center px-6 py-16 lg:px-10 lg:py-24">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.22em] text-[var(--studio-muted)]">
            {t.hero.eyebrow}
          </p>
          <h1 className="font-display max-w-md text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.02] text-[var(--studio-ink)]">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-[var(--studio-muted)]">
            {t.hero.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/book" className="studio-btn studio-btn-primary">
              {t.hero.bookSession}
            </Link>
            <Link href="#sessions" className="studio-btn studio-btn-ghost">
              {t.hero.viewSessions}
            </Link>
          </div>
          <p className="mt-12 text-sm text-[var(--studio-muted)]">
            {siteConfig.location}
            <span className="mx-2 text-[var(--studio-line)]">·</span>
            {t.common.hours}
          </p>
        </div>

        <div className="relative min-h-[28rem] lg:min-h-full">
          <Image
            src={siteConfig.images.hero}
            alt={t.hero.imageAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
