"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { CookieInventory, LegalDocument } from "@/components/legal/legal-document";
import { getLegal } from "@/i18n/legal";

export function LegalPageView({
  kind,
}: {
  kind: "privacy" | "terms" | "cookies" | "refunds" | "licenses";
}) {
  const { locale } = useLocale();
  const t = useTranslations();
  const legal = getLegal(locale);
  const page = legal[kind];

  return (
    <>
      <LegalDocument
        page={page}
        extra={kind === "cookies" ? <CookieInventory page={legal.cookies} /> : null}
      />
      <div className="container-meti max-w-3xl pb-12">
        <Link href="/" className="text-sm text-[var(--primary)] hover:underline">
          {t.auth.backHome}
        </Link>
      </div>
    </>
  );
}

export function FaqPageView() {
  const { locale } = useLocale();
  const t = useTranslations();
  const faq = getLegal(locale).faq;

  return (
    <div className="container-meti max-w-3xl py-16">
      <h1 className="font-heading mb-8 text-3xl font-bold text-[var(--text-primary)]">
        {faq.title}
      </h1>
      <div className="space-y-4">
        {faq.items.map((item) => (
          <section
            key={item.q}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <h2 className="font-heading mb-2 text-lg font-semibold text-[var(--text-primary)]">
              {item.q}
            </h2>
            <p className="leading-relaxed text-[var(--text-secondary)]">{item.a}</p>
          </section>
        ))}
      </div>
      <Link href="/" className="mt-8 inline-block text-sm text-[var(--primary)] hover:underline">
        {t.auth.backHome}
      </Link>
    </div>
  );
}
