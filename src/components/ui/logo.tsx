import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <Link
      href="/"
      className={cn(
        "font-heading text-lg font-semibold tracking-tight",
        variant === "light" ? "text-white" : "text-[var(--text-primary)]",
        className
      )}
    >
      {siteConfig.name}
    </Link>
  );
}
