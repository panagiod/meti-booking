"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ServiceSelector } from "@/components/booking/service-selector";
import { CalendarPicker } from "@/components/booking/calendar-picker";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingSummary } from "@/components/booking/booking-summary";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { LoadingPage } from "@/components/ui/loading";
import { authClient } from "@/lib/auth-client";
import { getAvailableDates, type TimeSlot } from "@/lib/slots";
import { siteConfig } from "@/lib/site-config";
import { ArrowLeft, MapPin } from "lucide-react";

interface Advisor {
  id: string;
  name: string;
  image: string | null;
  speciality: string | null;
  bio: string | null;
  isVerified: boolean;
  mpMode: string;
  bookingLeadHours: number;
  rating: number;
  reviewCount: number;
  categories: string[];
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
        setLoadError("The studio is not set up yet. Please run the demo setup script.");
        return;
      }
      const { studio } = await studioRes.json();
      const advisorRes = await fetch(`/api/advisors/${studio.advisorId}`);
      if (!advisorRes.ok) {
        setLoadError("Could not load instructor schedule.");
        return;
      }
      const data = await advisorRes.json();
      setAdvisor(data.advisor);
    } catch (error) {
      console.error("Error loading studio:", error);
      setLoadError("Something went wrong loading the booking page.");
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
            // ignore per-day fetch errors
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-[var(--text-muted)] text-center max-w-md">
          {loadError || "Studio not available"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--background)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="container-meti py-6">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Book a pilates session
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {siteConfig.name} · {siteConfig.location}
            </p>
          </div>
        </div>

        {step !== "service" && (
          <div className="sticky top-16 z-30 bg-[var(--surface)]/80 backdrop-blur-lg border-b border-[var(--border)]">
            <div className="container-meti flex items-center h-12">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        )}

        <div className="container-meti py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="relative overflow-hidden">
                {advisor.mpMode === "TEST" && (
                  <div className="absolute top-3.5 -right-8 z-10 rotate-45 bg-[var(--warning)] text-white text-[10px] font-bold px-8 py-0.5 shadow-md pointer-events-none">
                    DEMO
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-[var(--primary)]">
                        {advisor.name?.charAt(0) || "F"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                          {advisor.name}
                        </h2>
                        {advisor.isVerified && <VerifiedBadge isVerified size="sm" />}
                      </div>
                      <p className="text-[var(--text-muted)]">
                        {advisor.speciality || "Certified Pilates Instructor"}
                      </p>
                      <RatingStars
                        rating={advisor.rating}
                        showValue
                        size="sm"
                        reviewCount={advisor.reviewCount}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <MapPin className="w-4 h-4" />
                    In-studio at {siteConfig.location}
                  </div>

                  {advisor.bio && (
                    <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                      {advisor.bio}
                    </p>
                  )}

                  {advisor.categories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {advisor.categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {step === "service" && (
                <ServiceSelector
                  services={advisor.services}
                  selectedService={selectedService}
                  onSelect={handleServiceSelect}
                  title="Select a session"
                  subtitle="Choose the pilates session you'd like to book"
                />
              )}

              {step === "date" && selectedService && (
                <CalendarPicker
                  availableDates={availableDates}
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
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}
