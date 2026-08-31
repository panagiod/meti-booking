"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { RedirectLoading } from "@/components/ui/redirect-loading";
import { useCheckoutStore } from "@/lib/checkout-store";

export default function RedirectPage() {
  const router = useRouter();
  const { setCheckingOut } = useCheckoutStore();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Read pending booking synchronously before any await.
        // In dev, StrictMode runs this effect twice; if reading happened
        // after getSession, the second run could find the booking already
        // consumed by /checkout and fall through to role-based redirect
        // (dashboard). Deciding synchronously keeps both runs on the same path.
        const pendingBooking = localStorage.getItem("meti-pending-booking");
        if (pendingBooking) {
          let valid = false;
          try {
            const bookingData = JSON.parse(pendingBooking);
            valid = !!(bookingData.advisorId && bookingData.serviceId);
          } catch (e) {}

          if (valid) {
            // Not removed here: checkout consumes it on mount.
            setCheckingOut(true);
            const params = new URLSearchParams(JSON.parse(pendingBooking));
            router.push(`/checkout?${params.toString()}`);
            return;
          }

          // Invalid booking: clear and continue with normal redirect
          localStorage.removeItem("meti-pending-booking");
        }

        const { data } = await authClient.getSession();

        if (!data) {
          router.push("/login");
          return;
        }

        const user = data.user as any;

        // First user in the system → automatically admin
        if (user.role === "CLIENT") {
          try {
            const res = await fetch("/api/admin/setup");
            const { hasAdmins } = await res.json();
            if (!hasAdmins) {
              await fetch("/api/admin/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
              });
              router.push("/admin");
              return;
            }
          } catch {}
        }

        // Redirect based on role
        switch (user.role) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "ADVISOR":
            router.push("/advisor");
            break;
          default:
            router.push("/dashboard");
        }
      } catch (error) {
        router.push("/login");
      }
    };

    handleRedirect();
  }, [router, setCheckingOut]);

  return <RedirectLoading />;
}
