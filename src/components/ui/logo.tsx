import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStudioBranding } from "@/components/providers/locale-provider";

export function Logo({ className }: { className?: string }) {
  const studio = useStudioBranding();

  return (
    <Link
      href="/"
      className={cn(
        "font-display text-[1.35rem] leading-none tracking-tight text-[var(--studio-ink)]",
        className
      )}
    >
      {studio.name}
    </Link>
  );
}
