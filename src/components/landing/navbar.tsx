"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data) setUser(data.user);
    });
  }, []);

  const isBookActive = pathname === "/book" || pathname.startsWith("/advisor/");

  const handleSignOut = async () => {
    await authClient.signOut();
    setUser(null);
    router.push("/");
  };

  const getDashboardHref = () => {
    const role = user?.role;
    if (role === "ADMIN") return "/admin";
    if (role === "ADVISOR") return "/advisor";
    return "/dashboard";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-meti flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="h-10 w-auto" />
        </Link>


        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Button variant={isBookActive ? "default" : "ghost"} size="sm" asChild>
              <Link href="/book">Book a session</Link>
            </Button>
          </nav>
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="secondary" size="sm" asChild>
                <Link href={getDashboardHref()}>My dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container-meti py-4 space-y-3">
          <Link
            href="/book"
            className={cn(
              "block py-2 text-sm font-medium transition-colors",
              isBookActive
                ? "text-[var(--primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            Book a session
          </Link>
          <div className="pt-3 border-t border-[var(--border)] space-y-2">
            {user ? (
              <>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={getDashboardHref()} onClick={() => setMobileMenuOpen(false)}>My dashboard</Link>
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
