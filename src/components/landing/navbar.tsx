"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/components/providers/locale-provider";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const close = () => setMenuOpen(false);
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setMenuOpen(false);
    await authClient.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const accountLinks = user ? (
    <>
      <Link
        href={dashboardHref}
        onClick={() => setMenuOpen(false)}
        className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
      >
        {t.nav.account}
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="text-left text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)] disabled:opacity-60"
      >
        {t.nav.signOut}
      </button>
    </>
  ) : (
    <Link
      href="/login"
      onClick={() => setMenuOpen(false)}
      className="text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
    >
      {t.nav.signIn}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--studio-line)] bg-[var(--studio-bg)]/95 backdrop-blur-md">
      <div className="studio-container flex h-16 items-center justify-between gap-3 sm:h-[4.25rem]">
        <Logo className="min-w-0 max-w-[48%] truncate sm:max-w-none" />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <nav className="hidden items-center gap-4 md:flex">
            {accountLinks}
            <Link href="/book" className="studio-btn studio-btn-primary !px-5 !py-2.5 text-sm">
              {t.nav.bookNow}
            </Link>
          </nav>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--studio-line)] text-[var(--studio-ink)] md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.menu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-[var(--studio-line)] bg-[var(--studio-bg)] md:hidden"
        >
          <nav className="studio-container flex flex-col gap-4 py-4">
            {accountLinks}
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="studio-btn studio-btn-primary w-full"
            >
              {t.nav.bookNow}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
