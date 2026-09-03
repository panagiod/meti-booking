"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarPicker } from "@/components/booking/calendar-picker";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingSummary } from "@/components/booking/booking-summary";
import { BookingSteps } from "@/components/booking/booking-steps";
import { fetchBatchSlots } from "@/lib/fetch-batch-slots";
import { getAvailableDates, type DaySlots, type TimeSlot } from "@/lib/slots";
import { siteConfig } from "@/lib/site-config";
import { resolveBookingLeadHours } from "@/lib/booking-config";
import { useTranslations, useStudioBranding } from "@/components/providers/locale-provider";
import { savePendingBooking } from "@/lib/booking-utils";
import { ArrowLeft } from "lucide-react";

interface StudioBooking {
  instructorId: string;
  instructorName: string;
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
  const t = useTranslations();
  const studio = useStudioBranding();
  const [booking, setBooking] = useState<StudioBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<"date" | "time" | "summary">("date");
  const [selectedService, setSelectedService] = useState<StudioBooking["services"][number] | null>(null);
  const [selectedDate, setSelectedDate] = useState<DaySlots | null>(null);
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
      const { studio: payload } = await studioRes.json();
      const services = payload?.services ?? [];
      if (!payload?.instructorId || services.length === 0 || !payload.schedule?.length) {
        setLoadError(t.book.scheduleError);
        return;
      }
      setBooking({
        instructorId: payload.instructorId,
        instructorName: payload.instructorName || payload.name,
        services,
        schedule: payload.schedule,
        bookingLeadHours: payload.bookingLeadHours,
      });
      setSelectedService(services[0]);
      setStep("date");
    } catch {
      setLoadError(t.book.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  const availableDates = useMemo(() => {
    if (!selectedService || !booking?.schedule?.length) return [];
    return getAvailableDates(
      booking.schedule,
      selectedService.durationMin,
      siteConfig.bookingWeeksAhead,
      [],
      resolveBookingLeadHours(booking.bookingLeadHours)
    );
  }, [selectedService, booking?.schedule, booking?.bookingLeadHours]);

  const [apiSlots, setApiSlots] = useState<Record<string, { slots: TimeSlot[]; hasAvailability: boolean }>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [didAutoOpen, setDidAutoOpen] = useState(false);

  useEffect(() => {
    if (!selectedService || !booking || availableDates.length === 0) {
      setApiSlots({});
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    const fetchRealSlots = async () => {
      const results = await fetchBatchSlots(
        booking.instructorId,
        selectedService.id,
        availableDates.map((day) => day.dateStr)
      );
      if (!cancelled) {
        setApiSlots(results);
        setSlotsLoading(false);
      }
    };
    fetchRealSlots();
    return () => {
      cancelled = true;
      setSlotsLoading(false);
    };
  }, [selectedService, booking, availableDates]);

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

  const nextOpenDay = useMemo(
    () => mergedDates.find((day) => day.hasAvailability) ?? null,
    [mergedDates]
  );

  useEffect(() => {
    if (didAutoOpen || step !== "date" || !nextOpenDay) return;
    setDidAutoOpen(true);
    setSelectedDate(nextOpenDay);
    setSelectedTime(null);
    setStep("time");
  }, [didAutoOpen, step, nextOpenDay]);

  const handleDateSelect = (date: DaySlots) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("summary");
  };

  const handleConfirm = async () => {
    if (!booking || !selectedService || !selectedDate || !selectedTime) return;

    const bookingData = {
      instructorId: booking.instructorId,
      instructorName: booking.instructorName,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: String(selectedService.priceCents),
      duration: String(selectedService.durationMin),
      date: selectedDate.dateStr,
      time: selectedTime,
    };

    savePendingBooking(bookingData);
    const params = new URLSearchParams(bookingData);
    router.push(`/checkout?${params.toString()}`);
  };

  const handleBack = () => {
    switch (step) {
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

  if (loadError || !booking) {
    return (
      <div className="studio-booking flex min-h-[60vh] items-center justify-center px-6">
        <p className="text-center text-[var(--studio-muted)]">{loadError || t.book.studioUnavailable}</p>
      </div>
    );
  }

  return (
    <div className="studio-booking studio-container max-w-xl py-8 sm:py-10 lg:py-14">
      <div className="mb-8 sm:mb-10">
        {step !== "date" ? (
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
            {studio.name}
          </Link>
        )}
      </div>

      <BookingSteps current={step} singleService />

      <div className="mt-8 sm:mt-10">
        {step === "date" && selectedService && (
          <CalendarPicker
            availableDates={mergedDates}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
            isLoading={slotsLoading}
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
  );
}
