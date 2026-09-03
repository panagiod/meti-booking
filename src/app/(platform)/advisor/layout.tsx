"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoadingPage } from "@/components/ui/loading";

/**
 * Legacy marketplace instructor portal. MeTi Pilates is managed only from
 * /admin — anyone who hits /advisor is sent to admin (if they are ADMIN)
 * or their client bookings.
 */
export default function AdvisorLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.replace("/login");
          return;
        }
        const role = (data.user as { role?: string }).role;
        router.replace(role === "ADMIN" ? "/admin" : "/dashboard");
      } catch {
        router.replace("/login");
      }
    };

    void checkSession();
  }, [router]);

  return <LoadingPage fullScreen label="Redirecting" />;
}
