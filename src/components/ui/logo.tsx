import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-display text-[1.35rem] leading-none tracking-tight text-[var(--studio-ink)]",
        className
      )}
    >
      {siteConfig.name}
    </Link>
  );
}
