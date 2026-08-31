"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/components/providers/locale-provider";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const t = useTranslations();
  const [user, setUser] = useState<{ role?: string } | null>(null);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) setUser(data.user as { role?: string });
    });
  }, []);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "ADVISOR" ? "/advisor" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--studio-line)] bg-[var(--studio-bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-[76rem] items-center justify-between px-6 lg:px-10">
        <Logo />

        <nav className="flex items-center gap-3 sm:gap-6">
          <LanguageSwitcher />
          <Link
            href="#sessions"
            className="hidden text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)] sm:inline"
          >
            {t.nav.sessions}
          </Link>
          {user ? (
            <Link
              href={dashboardHref}
              className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
            >
              {t.nav.account}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
            >
              {t.nav.signIn}
            </Link>
          )}
          <Link href="/book" className="studio-btn studio-btn-primary !py-2.5 !px-5 text-sm">
            {t.nav.bookNow}
          </Link>
        </nav>
      </div>
    </header>
  );
}
