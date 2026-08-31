"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { authClient } from "@/lib/auth-client";
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  Shield,
  Tag,
  ArrowLeft,
  AlertTriangle,
  LogIn,
  TestTube,
} from "lucide-react";
import {
  formatMessage,
  useLocale,
  useTranslations,
} from "@/components/providers/locale-provider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { formatLongDate, formatMoney } from "@/lib/format";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialog = useDialog();
  const t = useTranslations();
  const { locale } = useLocale();
  const [isProcessing, setIsProcessing] = useState(false);
  const [advisorHasMP, setAdvisorHasMP] = useState<boolean | null>(null);
  const [advisorMpMode, setAdvisorMpMode] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [promotion, setPromotion] = useState<any>(null);

  const advisorId = searchParams.get("advisorId");
  const advisorName = searchParams.get("advisorName") || "MeTi Pilates";
  const serviceId = searchParams.get("serviceId");
  const rawServiceName = searchParams.get("serviceName") || "Service";
  const serviceName =
    t.booking.serviceNames[rawServiceName] ?? rawServiceName;
  const servicePrice = Number(searchParams.get("servicePrice") || "0");
  const duration = Number(searchParams.get("duration") || "60");
  const date = searchParams.get("date") || "TBD";
  const time = searchParams.get("time") || "TBD";

  const discountCents = promotion
    ? promotion.discountType === "percentage"
      ? Math.round((servicePrice * promotion.discountValue) / 100)
      : Math.min(Math.round(promotion.discountValue * 100), servicePrice)
    : 0;
  const priceAfterDiscount = Math.max(servicePrice - discountCents, 0);
  const serviceFee = Math.round(servicePrice * 0.15);
  const totalOriginal = servicePrice + serviceFee;
  const serviceTotal = priceAfterDiscount + serviceFee;

  useEffect(() => {
    localStorage.removeItem("meti-pending-booking");
    checkLoginStatus();
    if (advisorId) {
      checkAdvisorMP(advisorId);
    }
    if (serviceId) {
      fetchPromotion(serviceId);
    }
  }, [advisorId, serviceId]);

  const fetchPromotion = async (sid: string) => {
    try {
      const res = await fetch(`/api/promotions?serviceId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.promotion) setPromotion(data.promotion);
      }
    } catch {}
  };

  const checkLoginStatus = async () => {
    try {
      const { data } = await authClient.getSession();
      setIsLoggedIn(!!data);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const checkAdvisorMP = async (id: string) => {
    try {
      const res = await fetch(`/api/advisors/${id}/mercadopago`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAdvisorHasMP(data.isConnected);
        setAdvisorMpMode(data.mpMode || null);
      } else {
        setAdvisorHasMP(false);
      }
    } catch (error) {
      setAdvisorHasMP(false);
    }
  };

  const handleLogin = () => {
    const bookingData = {
      advisorId,
      advisorName,
      serviceId,
      serviceName: rawServiceName,
      servicePrice: String(servicePrice),
      duration: String(duration),
      date,
      time,
    };
    localStorage.setItem("meti-pending-booking", JSON.stringify(bookingData));
    router.push("/login");
  };

  const handlePayment = async () => {
    if (isLoggedIn === false) {
      handleLogin();
      return;
    }

    if (isLoggedIn === null) return;

    if (!advisorHasMP) {
      dialog.showAlert(
        t.checkout.paymentUnavailable,
        t.checkout.paymentUnavailableSub,
        "warning"
      );
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          advisorId,
          serviceId,
          scheduledAt: `${date}T${time}:00`,
          discountCents,
          promotionId: promotion?.id || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.checkout.errorCreateAppointment);
      }

      const { initPoint } = await res.json();
      localStorage.removeItem("meti-pending-booking");
      window.location.href = initPoint;
    } catch (error) {
      console.error("Error:", error);
      dialog.showAlert(t.common.error, t.checkout.errorCreateAppointment, "error");
      setIsProcessing(false);
    }
  };

  if (!advisorId || !serviceId) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-[var(--text-muted)] mb-4">{t.checkout.noBookingData}</p>
            <Button onClick={() => router.push("/book")}>{t.checkout.bookSession}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--background)]">
        <header className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-lg border-b border-[var(--border)]">
          <div className="container-meti flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="ml-4 font-heading font-semibold text-[var(--text-primary)]">
                {t.checkout.title}
              </h1>
            </div>
            <LanguageSwitcher className="border-[var(--border)]" />
          </div>
        </header>

        <div className="container-meti py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="lg:col-span-2 space-y-6">
              {isLoggedIn === false && (
                <Card className="border-[var(--primary)]">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                        <LogIn className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-[var(--text-primary)] text-lg">
                          {t.checkout.signInToContinue}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          {t.checkout.signInToContinueSub}
                        </p>
                      </div>
                      <Button onClick={handleLogin} size="lg">
                        {t.auth.signIn}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {advisorMpMode === "TEST" && (
                <Card className="border-[var(--warning)] bg-[var(--warning-light)]">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <TestTube className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {t.checkout.testModeTitle}
                        </p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                          {t.checkout.testModeSub}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {t.checkout.paymentMethod}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {advisorHasMP === false ? (
                    <div className="p-4 rounded-lg border-2 border-[var(--warning)] bg-[var(--warning-light)]">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {t.checkout.paymentUnavailable}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {t.checkout.paymentUnavailableSub}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border-2 border-[var(--primary)] bg-[var(--primary-light)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {t.checkout.mercadoPago}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {t.checkout.mercadoPagoSub}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Shield className="w-4 h-4" />
                    {t.checkout.securePayment}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--warning-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">⚠️</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-[var(--text-primary)] mb-1">
                        {t.checkout.cancellationPolicy}
                      </p>
                      <ul className="text-[var(--text-muted)] space-y-1">
                        <li>• {t.checkout.cancelReschedule}</li>
                        <li>• {t.checkout.cancelNoRefund}</li>
                        <li>• {t.checkout.cancelNoShow}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t.checkout.summary}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <p className="font-medium text-[var(--text-primary)]">{advisorName}</p>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-primary)] capitalize">
                        {date !== "TBD" ? formatLongDate(date, locale) : date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-primary)]">
                        {time} · {duration} {t.checkout.min}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">{serviceName}</span>
                      {discountCents > 0 ? (
                        <span className="text-[var(--text-muted)] line-through">
                          {formatMoney(totalOriginal, locale)}
                        </span>
                      ) : (
                        <span className="text-[var(--text-primary)]">
                          {formatMoney(totalOriginal, locale)}
                        </span>
                      )}
                    </div>
                    {discountCents > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--accent)] flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {promotion.name}
                        </span>
                        <span className="text-[var(--accent)] font-medium">
                          -{formatMoney(discountCents, locale)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-[var(--border)] pt-3 flex justify-between font-heading font-bold text-lg">
                      <span className="text-[var(--text-primary)]">{t.checkout.total}</span>
                      <span className="text-[var(--primary)]">
                        {formatMoney(serviceTotal, locale)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{t.checkout.includesCosts}</p>
                  </div>

                  <Button
                    className="w-full h-12 text-base mt-4"
                    onClick={handlePayment}
                    disabled={isProcessing || advisorHasMP === false}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.common.processing}
                      </div>
                    ) : isLoggedIn === false ? (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        {t.checkout.signInToPay}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {formatMessage(t.checkout.pay, {
                          amount: formatMoney(serviceTotal, locale),
                        })}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog state={dialog} />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <CheckoutContent />
    </Suspense>
  );
}
