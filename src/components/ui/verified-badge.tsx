import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface VerifiedBadgeProps {
  isVerified: boolean;
  verificationStatus?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedBadge({
  isVerified,
  verificationStatus,
  size = "md",
  className,
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (isVerified) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium",
          "bg-[var(--accent-light)] text-[var(--accent-dark)]",
          sizeClasses[size],
          className
        )}
      >
        <CheckCircle className={iconSizes[size]} />
        Verificado
      </span>
    );
  }

  if (verificationStatus === "PENDING_AI" || verificationStatus === "PENDING_MANUAL") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium",
          "bg-[var(--warning-light)] text-[var(--warning-dark)]",
          sizeClasses[size],
          className
        )}
      >
        <Clock className={iconSizes[size]} />
        En verificación
      </span>
    );
  }

  if (verificationStatus === "REJECTED") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium",
          "bg-[var(--error-light)] text-[var(--error-dark)]",
          sizeClasses[size],
          className
        )}
      >
        <XCircle className={iconSizes[size]} />
        No verificado
      </span>
    );
  }

  return null;
}
