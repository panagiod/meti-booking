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
        setLoadError("Studio not available. Please try again later.");
        return;
      }
      const { studio } = await studioRes.json();
      const advisorRes = await fetch(`/api/advisors/${studio.advisorId}`);
      if (!advisorRes.ok) {
        setLoadError("Could not load schedule.");
        return;
      }
      const data = await advisorRes.json();
      setAdvisor(data.advisor);
    } catch {
      setLoadError("Something went wrong. Please refresh the page.");
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

  if (isLoading) return <LoadingPage />;

  if (loadError || !advisor) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <p className="text-center text-[var(--text-muted)]">{loadError || "Studio not available"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--background)] pt-24 pb-16">
        <div className="mx-auto max-w-lg px-5 sm:px-8">
          <div className="mb-8 flex items-center justify-between">
            {step !== "service" ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
            )}
            <p className="text-xs text-[var(--text-muted)]">{siteConfig.location}</p>
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
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}
