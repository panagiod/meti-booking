"use client";

import {
  formatMessage,
  useTranslations,
} from "@/components/providers/locale-provider";

const reformerSteps = ["date", "time", "summary"] as const;
const fullSteps = ["service", ...reformerSteps] as const;

type StepKey = (typeof fullSteps)[number];
type ReformerStepKey = (typeof reformerSteps)[number];

export function BookingSteps({
  current,
  singleService = false,
}: {
  current: StepKey | ReformerStepKey;
  singleService?: boolean;
}) {
  const t = useTranslations();
  const steps = singleService ? reformerSteps : fullSteps;
  const currentIndex = steps.indexOf(current as ReformerStepKey & StepKey);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const progress = ((safeIndex + 1) / steps.length) * 100;

  const stepLabels: Record<string, string> = singleService
    ? {
        date: t.booking.steps.date,
        time: t.booking.steps.time,
        summary: t.booking.steps.summary,
      }
    : t.booking.steps;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs uppercase tracking-[0.16em] text-[var(--studio-muted)]">
        <span>
          {formatMessage(t.booking.stepOf, {
            current: safeIndex + 1,
            total: steps.length,
          })}
        </span>
        <span>{stepLabels[steps[safeIndex]]}</span>
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
