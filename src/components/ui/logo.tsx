import { cn } from "@/lib/utils";

// Inline logo wordmark with theme-adaptive color (currentColor)
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 48"
      className={cn("text-[var(--text-primary)]", className)}
      aria-label="Meti"
      role="img"
    >
      <rect x="0" y="4" width="40" height="40" rx="8" fill="#ff6b35" />
      <text
        x="20"
        y="33"
        textAnchor="middle"
        fill="#fff"
        fontFamily="system-ui,sans-serif"
        fontWeight="800"
        fontSize="24"
      >
        M
      </text>
      <text
        x="52"
        y="35"
        fill="currentColor"
        fontFamily="system-ui,sans-serif"
        fontWeight="700"
        fontSize="28"
      >
        Meti
      </text>
    </svg>
  );
}
