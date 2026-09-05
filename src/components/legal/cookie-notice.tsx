"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/components/providers/locale-provider";
import { COOKIE_NOTICE_KEY } from "@/i18n/types";

export function CookieNotice() {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(COOKIE_NOTICE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(COOKIE_NOTICE_KEY, "1");
    } catch {
      // still hide for this visit
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-[0_-8px_24px_rgba(44,56,44,0.08)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          {t.cookieNotice.message}{" "}
          <Link href="/cookies" className="text-[var(--text-primary)] underline underline-offset-2">
            {t.cookieNotice.link}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm text-white"
        >
          {t.cookieNotice.dismiss}
        </button>
      </div>
    </div>
  );
}
