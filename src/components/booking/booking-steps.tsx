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
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs uppercase tracking-[0.16em] text-[var(--studio-muted)]">
        <span>
          Step {currentIndex + 1} of {steps.length}
        </span>
        <span>{steps[currentIndex].label}</span>
      </div>
      <div className="h-px w-full bg-[var(--studio-line)]">
        <div
          className="h-px bg-[var(--studio-ink)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
