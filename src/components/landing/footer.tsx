import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-heading text-sm font-semibold text-[var(--text-primary)]">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {siteConfig.location} · {siteConfig.hours}
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
          <Link href="/book" className="hover:text-[var(--text-primary)] transition-colors">
            Book a session
          </Link>
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
