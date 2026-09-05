"use client";

import Link from "next/link";
import { useTranslations } from "@/components/providers/locale-provider";

export function LegalAcceptance({
  checked,
  onChange,
  error,
  id = "legal-acceptance",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  error?: string | null;
  id?: string;
}) {
  const t = useTranslations();

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 flex-shrink-0 rounded border-[var(--border)]"
        />
        <span>
          {t.checkout.acceptLegalPrefix}{" "}
          <Link href="/privacy" className="text-[var(--primary)] underline underline-offset-2">
            {t.checkout.acceptPrivacy}
          </Link>{" "}
          {t.checkout.acceptLegalMiddle}{" "}
          <Link href="/terms" className="text-[var(--primary)] underline underline-offset-2">
            {t.checkout.acceptTerms}
          </Link>
          {t.checkout.acceptLegalSuffix}
        </span>
      </label>
      {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
    </div>
  );
}
