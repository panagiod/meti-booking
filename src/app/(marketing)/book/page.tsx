"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ServiceSelector } from "@/components/booking/service-selector";
import { CalendarPicker } from "@/components/booking/calendar-picker";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingSummary } from "@/components/booking/booking-summary";
import { BookingSteps } from "@/components/booking/booking-steps";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { LoadingPage } from "@/components/ui/loading";
import { authClient } from "@/lib/auth-client";
import { getAvailableDates, type TimeSlot } from "@/lib/slots";
import { siteConfig } from "@/lib/site-config";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/components/providers/locale-provider";

interface Advisor {
  id: string;
  name: string;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    durationMin: number;
    priceCents: number;
    rescheduleHoursMin: number;
  }>;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    lunchStart: string | null;
    lunchEnd: string | null;
    gapMinutes: number;
  }>;
  bookingLeadHours: number;
}

export default function BookPage() {
  const router = useRouter();
  const dialog = useDialog();
  const t = useTranslations();
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<"service" | "date" | "time" | "summary">("service");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadStudio();
  }, []);

  const loadStudio = async () => {
    try {
      const studioRes = await fetch("/api/studio");
      if (!studioRes.ok) {
        setLoadError(t.book.studioUnavailable);
        return;
      }
      const { studio } = await studioRes.json();
      const advisorRes = await fetch(`/api/advisors/${studio.advisorId}`);
      if (!advisorRes.ok) {
        setLoadError(t.book.scheduleError);
        return;
      }
      const data = await advisorRes.json();
      setAdvisor(data.advisor);
    } catch {
      setLoadError(t.book.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  const availableDates = useMemo(() => {
    if (!selectedService || !advisor?.schedule?.length) return [];
    return getAvailableDates(
      advisor.schedule,
      selectedService.durationMin,
      2,
      [],
      advisor.bookingLeadHours || 2
    );
  }, [selectedService, advisor?.schedule, advisor?.bookingLeadHours]);

  const [apiSlots, setApiSlots] = useState<Record<string, { slots: TimeSlot[]; hasAvailability: boolean }>>({});

  useEffect(() => {
    if (!selectedService || !advisor || availableDates.length === 0) {
      setApiSlots({});
      return;
    }
    let cancelled = false;
    const fetchRealSlots = async () => {
      const results: Record<string, { slots: TimeSlot[]; hasAvailability: boolean }> = {};
      await Promise.all(
        availableDates.map(async (day) => {
          try {
            const res = await fetch(
              `/api/slots?advisorId=${advisor.id}&serviceId=${selectedService.id}&date=${day.dateStr}`
            );
            if (res.ok) {
              const data = await res.json();
              const slots = data.slots || [];
              results[day.dateStr] = {
                slots,
                hasAvailability: slots.some((s: TimeSlot) => s.available),
              };
            }
          } catch {
            // ignore
          }
        })
      );
      if (!cancelled) setApiSlots(results);
    };
    fetchRealSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedService, advisor, availableDates]);

  const mergedDates = useMemo(() => {
    return availableDates.map((day) => {
      const real = apiSlots[day.dateStr];
      if (!real) return day;
      return { ...day, slots: real.slots, hasAvailability: real.hasAvailability };
    });
  }, [availableDates, apiSlots]);

  const selectedDaySlots = useMemo(() => {
    if (!selectedDate || !selectedService) return null;
    return mergedDates.find((d) => d.dateStr === selectedDate.dateStr) || null;
  }, [selectedDate, selectedService, mergedDates]);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep("date");
  };

  const handleDateSelect = (date: any) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("summary");
  };

  const handleConfirm = async () => {
    if (!advisor || !selectedService || !selectedDate || !selectedTime) return;

    let isLoggedIn = false;
    try {
      const { data } = await authClient.getSession();
      isLoggedIn = !!data;
    } catch {
      isLoggedIn = false;
    }

    const bookingData = {
      advisorId: advisor.id,
      advisorName: advisor.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: String(selectedService.priceCents),
      duration: String(selectedService.durationMin),
      date: selectedDate.dateStr,
      time: selectedTime,
    };

    localStorage.setItem("meti-pending-booking", JSON.stringify(bookingData));

    if (!isLoggedIn) {
      router.push("/login");
    } else {
      const params = new URLSearchParams(bookingData);
      router.push(`/checkout?${params.toString()}`);
    }
  };

  const handleBack = () => {
    switch (step) {
      case "date":
        setStep("service");
        break;
      case "time":
        setStep("date");
        break;
      case "summary":
        setStep("time");
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="studio-booking flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--studio-line)] border-t-[var(--studio-ink)]" />
      </div>
    );
  }

  if (loadError || !advisor) {
    return (
      <div className="studio-booking flex min-h-[60vh] items-center justify-center px-6">
        <p className="text-center text-[var(--studio-muted)]">{loadError || t.book.studioUnavailable}</p>
      </div>
    );
  }

  return (
  <>
    <div className="studio-booking mx-auto max-w-xl px-6 py-10 lg:px-8 lg:py-14">
      <div className="mb-10 flex items-center justify-between">
        {step !== "service" ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.book.back}
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--studio-muted)] transition hover:text-[var(--studio-ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {siteConfig.name}
          </Link>
        )}
      </div>

      <BookingSteps current={step} />

      <div className="mt-10">
        {step === "service" && (
          <ServiceSelector
            services={advisor.services}
            selectedService={selectedService}
            onSelect={handleServiceSelect}
          />
        )}

        {step === "date" && selectedService && (
          <CalendarPicker
            availableDates={mergedDates.length ? mergedDates : availableDates}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
          />
        )}

        {step === "time" && selectedDaySlots && (
          <TimeSlotPicker
            daySlots={selectedDaySlots}
            selectedTime={selectedTime}
            onSelect={handleTimeSelect}
          />
        )}

        {step === "summary" && selectedDaySlots && selectedTime && selectedService && (
          <BookingSummary
            service={selectedService}
            daySlots={selectedDaySlots}
            time={selectedTime}
            onConfirm={handleConfirm}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>

    <AlertDialog state={dialog} />
  </>
  );
}
