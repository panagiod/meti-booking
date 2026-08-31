"use client";

import { cn } from "@/lib/utils";

const steps = [
  { key: "service", label: "Session" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "summary", label: "Confirm" },
] as const;

type StepKey = (typeof steps)[number]["key"];

export function BookingSteps({ current }: { current: StepKey }) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isActive && "bg-[var(--primary)] text-white",
                  isDone && "bg-[var(--primary-light)] text-[var(--primary)]",
                  !isActive && !isDone && "bg-[var(--border-light)] text-[var(--text-muted)]"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  isActive ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  index < currentIndex ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
