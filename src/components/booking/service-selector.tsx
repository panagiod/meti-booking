"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDuration, type Service } from "@/lib/slots";

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
  title?: string;
  subtitle?: string;
}

export function ServiceSelector({
  services,
  selectedService,
  onSelect,
  title = "Select a session",
  subtitle = "Choose what you'd like to book",
}: ServiceSelectorProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl text-[var(--studio-ink)]">{title}</h2>
        <p className="mt-2 text-[var(--studio-muted)]">{subtitle}</p>
      </div>

      <div className="divide-y divide-[var(--studio-line)] border-y border-[var(--studio-line)]">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          const fee = Math.round(service.priceCents * 0.15);
          const total = service.priceCents + fee;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service)}
              className={cn(
                "flex w-full items-center justify-between gap-4 py-5 text-left transition",
                isSelected ? "bg-[var(--studio-warm)]/50" : "hover:bg-[var(--studio-warm)]/30"
              )}
            >
              <div>
                <p className="font-display text-xl text-[var(--studio-ink)]">{service.name}</p>
                <p className="mt-1 flex items-center gap-3 text-sm text-[var(--studio-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(service.durationMin)}
                  </span>
                  <span>{formatCurrency(total)}</span>
                </p>
              </div>
              <span
                className={cn(
                  "h-5 w-5 shrink-0 rounded-full border-2 transition",
                  isSelected
                    ? "border-[var(--studio-ink)] bg-[var(--studio-ink)]"
                    : "border-[var(--studio-line)]"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
