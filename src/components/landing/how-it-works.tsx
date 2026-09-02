"use client";

import { Calendar, Clock, CreditCard, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    number: "01",
    title: "Pick a session",
    description:
      "Choose your reformer session — 45 minutes with clear pricing.",
    color: "var(--primary)",
    bgColor: "var(--primary-light)",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Select a date",
    description:
      "Browse the studio calendar and see which days have openings for your session type.",
    color: "var(--accent)",
    bgColor: "var(--accent-light)",
  },
  {
    icon: Clock,
    number: "03",
    title: "Choose a time slot",
    description:
      "Pick an available time that fits your schedule. Slots update in real time as others book.",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  {
    icon: CreditCard,
    number: "04",
    title: "Confirm & pay",
    description:
      "Sign in, review your booking, and pay securely. You'll get a confirmation right away.",
    color: "var(--warning)",
    bgColor: "var(--warning-light)",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-[var(--surface)]">
      <div className="container-meti">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            How booking works
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Reserve your pilates session in four simple steps — no phone calls required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-[var(--border)] to-transparent">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-r border-t border-[var(--border)] bg-[var(--surface)]" />
                </div>
              )}

              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div
                    className="flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{ backgroundColor: step.bgColor }}
                  >
                    <step.icon className="w-10 h-10" style={{ color: step.color }} />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
