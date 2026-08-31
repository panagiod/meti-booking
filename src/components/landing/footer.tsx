"use client";

import Link from "next/link";
import { useTranslations, useStudioBranding } from "@/components/providers/locale-provider";

export function Footer() {
  const t = useTranslations();
  const studio = useStudioBranding();

  return (
    <footer className="border-t border-[var(--studio-line)]">
      <div className="studio-container flex flex-col items-center gap-4 py-8 text-center text-sm text-[var(--studio-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="max-w-md leading-relaxed">
          <span className="font-display text-[var(--studio-ink)]">{studio.name}</span>
          <span className="mx-2 hidden sm:inline">·</span>
          <span className="mt-1 block sm:mt-0 sm:inline">{studio.location}</span>
        </p>
        <div className="flex gap-5">
          <Link href="/book" className="transition hover:text-[var(--studio-ink)]">
            {t.footer.book}
          </Link>
          <Link href={`mailto:${studio.email}`} className="transition hover:text-[var(--studio-ink)]">
            {t.footer.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
