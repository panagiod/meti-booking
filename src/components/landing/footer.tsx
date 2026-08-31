"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { useTranslations } from "@/components/providers/locale-provider";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-[var(--studio-line)]">
      <div className="mx-auto flex max-w-[76rem] flex-col gap-3 px-6 py-8 text-sm text-[var(--studio-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>
          <span className="font-display text-[var(--studio-ink)]">{siteConfig.name}</span>
          <span className="mx-2">·</span>
          {siteConfig.location}
        </p>
        <div className="flex gap-5">
          <Link href="/book" className="hover:text-[var(--studio-ink)] transition">
            {t.footer.book}
          </Link>
          <Link href={`mailto:${siteConfig.email}`} className="hover:text-[var(--studio-ink)] transition">
            {t.footer.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
