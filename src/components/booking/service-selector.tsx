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
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>

      <div className="space-y-2">
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
                "flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary-light)]/50"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40"
              )}
            >
              <div>
                <p className="font-medium text-[var(--text-primary)]">{service.name}</p>
                <p className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(service.durationMin)}
                  </span>
                  <span>{formatCurrency(total)}</span>
                </p>
              </div>
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border-2",
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]"
                    : "border-[var(--border)]"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
