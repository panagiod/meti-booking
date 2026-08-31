"use client";

import { useState, useMemo, useEffect } from "react";
import { use } from "react";
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
import { savePendingBooking } from "@/lib/booking-utils";
import { useCheckoutStore } from "@/lib/checkout-store";
import { authClient } from "@/lib/auth-client";
import { getAvailableDates, formatCurrency, formatDuration, type TimeSlot } from "@/lib/slots";
import {
  ArrowLeft,
  Video,
  Share2,
  Heart,
  Star,
  Clock,
} from "lucide-react";

interface Advisor {
  id: string;
  name: string;
  image: string | null;
  speciality: string | null;
  bio: string | null;
  videoUrl: string | null;
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

export default function AdvisorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const dialog = useDialog();
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<"service" | "date" | "time" | "summary">("service");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAdvisor();
  }, [id]);

  const fetchAdvisor = async () => {
    try {
      const res = await fetch(`/api/advisors/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAdvisor(data.advisor);
      }
    } catch (error) {
      console.error("Error fetching advisor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableDates = useMemo(() => {
    if (!selectedService || !advisor?.schedule?.length) return [];
    return getAvailableDates(advisor.schedule, selectedService.durationMin, 2, [], advisor.bookingLeadHours || 24);
  }, [selectedService, advisor?.schedule]);

  // Disponibilidad REAL: consulta las citas existentes vía API por cada fecha.
  // getAvailableDates solo genera slots del horario; el API marca los ya reservados.
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
          } catch (e) {}
        })
      );
      if (!cancelled) setApiSlots(results);
    };
    fetchRealSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedService, advisor, availableDates]);

  // Merge: usar la disponibilidad real del API cuando esté disponible
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

    // Check if user is logged in
    let isLoggedIn = false;
    try {
      const { data } = await authClient.getSession();
      isLoggedIn = !!data;
    } catch (error) {
      isLoggedIn = false;
    }

    // Create booking params
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

    // Save booking data for later
    localStorage.setItem("meti-pending-booking", JSON.stringify(bookingData));

    if (!isLoggedIn) {
      // Not logged in - go to login first
      router.push("/login");
    } else {
      // Logged in - go directly to checkout
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

  if (!advisor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Asesor no encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Navigation bar for back button */}
        {step !== "service" && (
          <div className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-lg border-b border-[var(--border)]">
            <div className="container-meti flex items-center h-12">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        )}

        <div className="container-meti py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Advisor info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="relative overflow-hidden">
                {/* Test mode ribbon */}
                {advisor.mpMode === "TEST" && (
                  <div className="absolute top-3.5 -right-8 z-10 rotate-45 bg-[var(--warning)] text-white text-[10px] font-bold px-8 py-0.5 shadow-md pointer-events-none">
                    PRUEBA
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {advisor.image ? (
                      <img
                        src={advisor.image}
                        alt={advisor.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-[var(--primary)]">
                          {advisor.name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                          {advisor.name}
                        </h1>
                        {advisor.isVerified && (
                          <VerifiedBadge isVerified={true} size="sm" />
                        )}
                      </div>
                      <p className="text-[var(--text-muted)]">
                        {advisor.speciality || "Profesional"}
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
                    <Video className="w-4 h-4" />
                    100% Online por videollamada
                  </div>

                  {advisor.bio && (
                    <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                      {advisor.bio}
                    </p>
                  )}

                  {/* Video de presentación */}
                  {advisor.videoUrl && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                        Video de presentación
                      </p>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${advisor.videoUrl.replace(/.*(?:v=|\/|youtu\.be\/)([\w-]{11}).*/, "$1")}`}
                          title="Video de presentación"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {advisor.categories.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                        Rubros
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {advisor.categories.map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column - Booking flow */}
            <div className="lg:col-span-2">
              {step === "service" && (
                <ServiceSelector
                  services={advisor.services}
                  selectedService={selectedService}
                  onSelect={handleServiceSelect}
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
