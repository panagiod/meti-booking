import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

// Inline logo wordmark with theme-adaptive color (currentColor)
export function Logo({ className }: { className?: string }) {
  const initial = siteConfig.name.charAt(0);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 48"
      className={cn("text-[var(--text-primary)]", className)}
      aria-label={siteConfig.name}
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
        {initial}
      </text>
      <text
        x="52"
        y="35"
        fill="currentColor"
        fontFamily="system-ui,sans-serif"
        fontWeight="700"
        fontSize="22"
      >
        {siteConfig.name}
      </text>
    </svg>
  );
}
