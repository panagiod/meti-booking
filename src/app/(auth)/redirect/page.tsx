"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { RedirectLoading } from "@/components/ui/redirect-loading";
import { useCheckoutStore } from "@/lib/checkout-store";
import { clearPendingBooking, peekPendingBooking } from "@/lib/booking-utils";
import { homePathForRole, isSafeAuthNext, loginUrl } from "@/lib/auth-redirect";

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCheckingOut } = useCheckoutStore();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const next = searchParams.get("next");
        const explicitNext = isSafeAuthNext(next) ? next : null;

        // Resume checkout only when the user did not ask for another page
        // (e.g. "Go to my bookings"). Always consume the pending payload
        // so a leftover booking cannot loop login ↔ checkout.
        const pendingBooking = peekPendingBooking();
        if (pendingBooking && !explicitNext) {
          clearPendingBooking();
          setCheckingOut(true);
          router.replace(`/checkout?${pendingBooking.toString()}`);
          return;
        }

        if (pendingBooking && explicitNext) {
          clearPendingBooking();
        }

        const { data } = await authClient.getSession();

        if (!data) {
          router.replace(loginUrl(explicitNext));
          return;
        }

        if (explicitNext) {
          router.replace(explicitNext);
          return;
        }

        const user = data.user as { id?: string; role?: string };

        if (user.role === "CLIENT") {
          try {
            const res = await fetch("/api/admin/setup", { credentials: "include" });
            const { hasAdmins } = await res.json();
            if (!hasAdmins && user.id) {
              await fetch("/api/admin/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userId: user.id }),
              });
              router.replace("/admin");
              return;
            }
          } catch {
            // Keep going to the client dashboard
          }
        }

        router.replace(homePathForRole(user.role));
      } catch {
        router.replace("/login");
      }
    };

    void handleRedirect();
  }, [router, searchParams, setCheckingOut]);

  return <RedirectLoading />;
}

export default function RedirectPage() {
  return (
    <Suspense fallback={<RedirectLoading />}>
      <RedirectContent />
    </Suspense>
  );
}
