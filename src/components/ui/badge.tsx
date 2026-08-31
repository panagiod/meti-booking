import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary-light)] text-[var(--primary)]",
        secondary:
          "bg-[var(--secondary)]/10 text-[var(--secondary)] dark:bg-[var(--border)] dark:text-[var(--text-primary)]",
        accent:
          "bg-[var(--accent-light)] text-[var(--accent)]",
        success:
          "bg-[var(--success-light)] text-[var(--success)]",
        warning:
          "bg-[var(--warning-light)] text-[var(--warning)]",
        destructive:
          "bg-[var(--error-light)] text-[var(--error)]",
        outline:
          "border border-[var(--border)] text-[var(--text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
