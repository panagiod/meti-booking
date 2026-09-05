"use client";

import Link from "next/link";
import { useTranslations, useStudioBranding } from "@/components/providers/locale-provider";
import { formatStudioPhone, isPublicPhone, studioTelHref } from "@/lib/site-config";
import { StudioMapLink } from "@/components/landing/studio-map-link";

export function Footer() {
  const t = useTranslations();
  const studio = useStudioBranding();

  return (
    <footer className="border-t border-[var(--studio-line)]">
      <div className="studio-container flex flex-col items-center gap-4 py-8 text-center text-sm text-[var(--studio-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="max-w-md leading-relaxed">
          <span className="font-display text-[var(--studio-ink)]">{studio.name}</span>
          <span className="mx-2 hidden sm:inline">·</span>
          <StudioMapLink className="mt-1 block text-[var(--studio-muted)] sm:mt-0 sm:inline">
            {studio.location}
          </StudioMapLink>
        </p>
        <div className="flex flex-wrap justify-center gap-5 sm:justify-end">
          <Link href="/book" className="transition hover:text-[var(--studio-ink)]">
            {t.footer.book}
          </Link>
          <Link href="/faq" className="transition hover:text-[var(--studio-ink)]">
            {t.footer.faq}
          </Link>
          <Link href="/privacy" className="transition hover:text-[var(--studio-ink)]">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="transition hover:text-[var(--studio-ink)]">
            {t.footer.terms}
          </Link>
          <Link href="/cookies" className="transition hover:text-[var(--studio-ink)]">
            {t.footer.cookies}
          </Link>
          {isPublicPhone(studio.phone) ? (
            <a
              href={studioTelHref(studio.phone)}
              className="transition hover:text-[var(--studio-ink)]"
            >
              {formatStudioPhone(studio.phone)}
            </a>
          ) : null}
          <Link href={`mailto:${studio.email}`} className="transition hover:text-[var(--studio-ink)]">
            {t.footer.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
