"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminDisclosure({
  title,
  count,
  defaultOpen = false,
  children,
  className,
}: {
  title: ReactNode;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className={cn("group rounded-lg border border-[var(--border)] bg-[var(--background)]", className)}
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpen((current) => (current === next ? current : next));
      }}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          {title}
          {typeof count === "number" ? ` (${count})` : null}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-[var(--border)] px-3 py-3">{children}</div>
    </details>
  );
}
