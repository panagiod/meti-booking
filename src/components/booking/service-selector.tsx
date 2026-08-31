"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Tag } from "lucide-react";
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
  title = "Select a service",
  subtitle = "Choose the session you need",
}: ServiceSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {subtitle}
        </p>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          const promo = service.promotion;
          const discount = promo
            ? promo.discountType === "percentage"
              ? Math.round(service.priceCents * promo.discountValue / 100)
              : Math.round(promo.discountValue * 100)
            : 0;
          const priceAfterDiscount = Math.max(service.priceCents - discount, 0);
          // Fee is always calculated on the original price (discount is absorbed by the advisor)
          const fee = Math.round(service.priceCents * 0.15);
          const totalOriginal = service.priceCents + fee;
          const totalWithDiscount = priceAfterDiscount + fee;

          return (
            <Card
              key={service.id}
              className={cn(
                "cursor-pointer transition-all",
                isSelected
                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                  : "hover:border-[var(--primary)]/50"
              )}
              onClick={() => onSelect(service)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-heading font-semibold text-[var(--text-primary)]">
                        {service.name}
                      </h3>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      )}
                      {promo && (
                        <Badge variant="success" className="text-xs flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {promo.name}
                          {promo.discountType === "percentage" && (
                            <span> -{promo.discountValue}%</span>
                          )}
                          {promo.discountType === "fixed" && (
                            <span> -{formatCurrency(promo.discountValue * 100)}</span>
                          )}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(service.durationMin)}
                      </span>
                      <span className="flex items-center gap-1">
                        {discount > 0 ? (
                          <>
                            <span className="line-through">{formatCurrency(totalOriginal)}</span>
                            <span className="text-[var(--accent)] font-semibold">{formatCurrency(totalWithDiscount)}</span>
                          </>
                        ) : (
                          <>{formatCurrency(totalOriginal)}</>
                        )}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    className={cn(
                      "w-5 h-5 transition-transform",
                      isSelected
                        ? "text-[var(--primary)] rotate-90"
                        : "text-[var(--text-muted)]"
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
