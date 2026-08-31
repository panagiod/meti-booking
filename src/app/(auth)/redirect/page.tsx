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
        // El booking pendiente se lee de forma SÍNCRONA antes de cualquier await.
        // En dev, StrictMode ejecuta este effect dos veces seguidas; si la lectura
        // ocurriera después del getSession, la segunda ejecución podría encontrar
        // el booking ya consumido por /checkout y caería en el redirect por rol
        // (dashboard). Al decidir síncronamente, ambos runs toman la misma ruta.
        const pendingBooking = localStorage.getItem("meti-pending-booking");
        if (pendingBooking) {
          let valid = false;
          try {
            const bookingData = JSON.parse(pendingBooking);
            valid = !!(bookingData.advisorId && bookingData.serviceId);
          } catch (e) {}

          if (valid) {
            // No se elimina aquí: el checkout lo consume al montarse.
            setCheckingOut(true);
            const params = new URLSearchParams(JSON.parse(pendingBooking));
            router.push(`/checkout?${params.toString()}`);
            return;
          }

          // Booking inválido: limpiar y continuar con el redirect normal
          localStorage.removeItem("meti-pending-booking");
        }

        const { data } = await authClient.getSession();

        if (!data) {
          router.push("/login");
          return;
        }

        const user = data.user as any;

        // Primer usuario del sistema → automáticamente admin
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
