"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoadingPage } from "@/components/ui/loading";
import { peekPendingBooking } from "@/lib/booking-utils";
import { homePathForRole, loginUrl } from "@/lib/auth-redirect";
import { useTranslations } from "@/components/providers/locale-provider";

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const redirect = async () => {
      const pending = peekPendingBooking();
      if (pending) {
        router.replace(`/checkout?${pending.toString()}`);
        return;
      }

      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.replace(loginUrl("/onboarding"));
          return;
        }
        router.replace(homePathForRole((data.user as { role?: string }).role));
      } catch {
        router.replace("/login");
      }
    };

    void redirect();
  }, [router]);

  return <LoadingPage fullScreen label={t.dashboard.loading} />;
}
