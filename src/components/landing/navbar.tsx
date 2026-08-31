"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
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

        <nav className="flex items-center gap-6">
          <Link
            href="#sessions"
            className="hidden text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)] sm:inline"
          >
            Sessions
          </Link>
          {user ? (
            <Link
              href={dashboardHref}
              className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
            >
              Sign in
            </Link>
          )}
          <Link href="/book" className="studio-btn studio-btn-primary !py-2.5 !px-5 text-sm">
            Book now
          </Link>
        </nav>
      </div>
    </header>
  );
}
