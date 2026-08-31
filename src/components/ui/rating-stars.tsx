"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeMap = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeMap[size],
              i < Math.floor(rating)
                ? "fill-[var(--star)] text-[var(--star)]"
                : i < rating
                  ? "fill-[var(--star)]/50 text-[var(--star)]"
                  : "fill-[var(--star-empty)] text-[var(--star-empty)]"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-[var(--text-primary)] ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-[var(--text-muted)]">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
