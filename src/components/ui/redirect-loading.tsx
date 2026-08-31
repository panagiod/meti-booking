"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserCheck, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Verifying your session",
    description: "Confirming access credentials",
  },
  {
    icon: UserCheck,
    title: "Validating your account",
    description: "Checking your role and permissions",
  },
  {
    icon: Sparkles,
    title: "Preparing your workspace",
    description: "Loading your personalized dashboard",
  },
];

const STEP_MS = 1400;

export function RedirectLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % STEPS.length);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, []);

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center bg-[var(--background)] px-4 z-50">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[var(--primary)] opacity-[0.08] blur-3xl animate-[float_9s_ease-in-out_infinite] motion-reduce:animate-none" />
        <div className="absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full bg-[var(--accent)] opacity-[0.08] blur-3xl animate-[float_11s_ease-in-out_infinite_reverse] motion-reduce:animate-none" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-10">
          <div className="absolute -inset-5 rounded-[32px] animate-[pulse-glow_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
          <div className="relative w-20 h-20 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-[var(--shadow-primary)]">
            <span className="font-heading text-4xl font-extrabold text-white select-none">
              M
            </span>
          </div>
          <div
            className="absolute -inset-3 rounded-[28px] border border-dashed border-[var(--primary)]/50 animate-spin motion-reduce:animate-none"
            style={{ animationDuration: "14s" }}
          >
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[var(--shadow-accent)]" />
          </div>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] animate-[fade-in-up_0.5s_var(--ease-out)_forwards]">
          Welcome to Meti
        </h1>
        <div
          key={step}
          className="mt-2 animate-[fade-in_0.4s_var(--ease-out)_forwards]"
        >
          <p className="font-heading text-base font-semibold text-[var(--primary)]">
            {current.title}…
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {current.description}
          </p>
        </div>

        <div className="w-64 sm:w-72 mt-8">
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-700 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 w-72 sm:w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm p-4 space-y-2 shadow-[var(--shadow-sm)] text-left">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={s.title}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-500",
                  active && "bg-[var(--primary-light)]"
                )}
              >
                <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  {active ? (
                    <span className="loading-spinner loading-spinner-sm block" />
                  ) : done ? (
                    <Check className="w-4 h-4 text-[var(--success)]" strokeWidth={3} />
                  ) : (
                    <s.icon className="w-4 h-4 text-[var(--text-muted)] opacity-40" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors duration-500",
                    active
                      ? "font-semibold text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]"
                  )}
                >
                  {s.title}
                </span>
                {done && (
                  <span className="ml-auto text-xs font-medium text-[var(--success)]">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="absolute bottom-6 text-xs text-[var(--text-muted)]">
        Meti · Professional online consultations
      </p>
    </div>
  );
}
