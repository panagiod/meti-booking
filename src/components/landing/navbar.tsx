"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) setUser(data.user as { role?: string });
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "ADVISOR" ? "/advisor" : "/dashboard";

  const onHero = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        onHero
          ? "bg-transparent"
          : "bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo variant={onHero ? "light" : "default"} />

        <nav className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <Link
              href={dashboardHref}
              className={cn(
                "text-sm font-medium transition-colors",
                onHero ? "text-white/90 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                "text-sm font-medium transition-colors",
                onHero ? "text-white/90 hover:text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Sign in
            </Link>
          )}
          <Link
            href="/book"
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              onHero
                ? "bg-white text-[var(--secondary)] hover:bg-white/90"
                : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            )}
          >
            Book
          </Link>
        </nav>
      </div>
    </header>
  );
}
