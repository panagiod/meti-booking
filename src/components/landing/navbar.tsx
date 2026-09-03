"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/components/providers/locale-provider";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    authClient.getSession().then(async ({ data }) => {
      if (!data?.user) return;
      const sessionUser = data.user as { role?: string };
      if (sessionUser.role === "ADMIN") {
        setUser(sessionUser);
        return;
      }
      try {
        const claim = await fetch("/api/admin/claim", {
          method: "POST",
          credentials: "include",
        });
        if (claim.ok) {
          const body = (await claim.json()) as { role?: string };
          setUser({ ...sessionUser, role: body.role || sessionUser.role });
          return;
        }
      } catch {
        // Fall back to the session role
      }
      setUser(sessionUser);
    });
  }, []);

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--studio-line)] bg-[var(--studio-bg)]/95 backdrop-blur-md">
      <div className="studio-container flex h-16 items-center justify-between gap-3 sm:h-[4.25rem]">
        <Logo />

        <nav className="flex shrink-0 items-center gap-2 sm:gap-4">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
              >
                {t.nav.account}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)] disabled:opacity-60"
              >
                {t.nav.signOut}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
            >
              {t.nav.signIn}
            </Link>
          )}
          <Link
            href="/book"
            className="studio-btn studio-btn-primary !px-4 !py-2 text-xs sm:!px-5 sm:!py-2.5 sm:text-sm"
          >
            {t.nav.bookNow}
          </Link>
        </nav>
      </div>
    </header>
  );
}
