"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoadingPage } from "@/components/ui/loading";
import { useTranslations } from "@/components/providers/locale-provider";
import { loginUrl } from "@/lib/auth-redirect";

// This layout is only used for client dashboard pages
// Admin and advisor have their own layouts with sidebars
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);

  // Skip auth check for admin, advisor, and checkout routes
  const isAdminOrAdvisor = pathname.startsWith("/admin") || pathname.startsWith("/advisor");
  const isCheckout = pathname.startsWith("/checkout");

  useEffect(() => {
    if (isAdminOrAdvisor || isCheckout) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const checkSession = async () => {
      setIsLoading(true);
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { data } = await authClient.getSession();
          if (cancelled) return;
          if (data) {
            setIsLoading(false);
            return;
          }
        } catch {
          // Retry — Google session cookie can lag one tick after OAuth
        }
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
      if (!cancelled) {
        router.replace(loginUrl(pathname));
      }
    };

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, [router, isAdminOrAdvisor, isCheckout, pathname]);

  // Admin, advisor, and checkout have their own layouts or don't need auth check
  if (isAdminOrAdvisor || isCheckout) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPage label={t.dashboard.loading} />
      </div>
    );
  }

  // Client pages get simple wrapper
  return <>{children}</>;
}
