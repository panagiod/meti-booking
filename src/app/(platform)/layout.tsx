"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoadingPage } from "@/components/ui/loading";

// This layout is only used for client dashboard pages
// Admin and advisor have their own layouts with sidebars
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // Skip auth check for admin, advisor, and checkout routes
  const isAdminOrAdvisor = pathname.startsWith("/admin") || pathname.startsWith("/advisor");
  const isCheckout = pathname.startsWith("/checkout");

  useEffect(() => {
    if (isAdminOrAdvisor || isCheckout) {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.push("/login");
          return;
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router, isAdminOrAdvisor, isCheckout]);

  // Admin, advisor, and checkout have their own layouts or don't need auth check
  if (isAdminOrAdvisor || isCheckout) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPage label="Loading..." />
      </div>
    );
  }

  // Client pages get simple wrapper
  return <>{children}</>;
}
