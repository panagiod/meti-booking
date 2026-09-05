import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { studioMapsUrl } from "@/lib/site-config";

export function StudioMapLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={studioMapsUrl()}
      target="_blank"
      rel="noopener"
      className={cn("text-[var(--studio-ink)] underline-offset-4 hover:underline", className)}
    >
      {children}
    </a>
  );
}
