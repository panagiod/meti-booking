"use client";

import {
  formatMessage,
  useTranslations,
} from "@/components/providers/locale-provider";

const stepKeys = ["service", "date", "time", "summary"] as const;
type StepKey = (typeof stepKeys)[number];

export function BookingSteps({ current }: { current: StepKey }) {
  const t = useTranslations();
  const currentIndex = stepKeys.indexOf(current);
  const progress = ((currentIndex + 1) / stepKeys.length) * 100;
  const stepLabel = t.booking.steps[current];

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs uppercase tracking-[0.16em] text-[var(--studio-muted)]">
        <span>
          {formatMessage(t.booking.stepOf, {
            current: currentIndex + 1,
            total: stepKeys.length,
          })}
        </span>
        <span>{stepLabel}</span>
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
