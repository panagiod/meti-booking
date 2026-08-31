"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { Briefcase, Search, Calendar, Star, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const dialog = useDialog();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleBecomeAdvisor = async () => {
    setIsRequesting(true);
    try {
      const res = await fetch("/api/client/become-advisor", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.message);
      } else {
        const data = await res.json();
        dialog.showAlert("Error", data.error || "Error al procesar tu solicitud", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión. Intenta de nuevo.", "error");
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  if (!user) return null;

  if (message) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
              ¡Solicitud enviada!
            </h2>
            <p className="text-[var(--text-muted)] mb-4">{message}</p>
            <Button onClick={() => window.location.reload()}>Continuar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          ¡Hola, {user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Bienvenido a tu panel de control
        </p>
      </div>

      {/* CTA to become advisor */}
      <Card className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-semibold text-lg mb-1">
              ¿Eres profesional?
            </h3>
            <p className="text-white/90">
              Ofrece tus asesorías y genera ingresos con Meti
            </p>
          </div>
          <Button
            className="bg-white text-[var(--accent)] hover:bg-white/90"
            onClick={handleBecomeAdvisor}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                Procesando...
              </div>
            ) : (
              <>
                <Briefcase className="w-4 h-4 mr-2" />
                Quiero ser asesor
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/services">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-1">
                    Explorar Asesores
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Encuentra profesionales expertos
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/appointments">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-1">
                    Mis Citas
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Administra tus asesorías
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reviews">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--warning-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-[var(--warning)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-1">
                    Mis Reseñas
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Califica tus asesorías
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">
              Tu actividad reciente aparecerá aquí
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de la cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <dt className="text-sm text-[var(--text-muted)]">Nombre</dt>
              <dd className="text-sm font-medium text-[var(--text-primary)]">{user.name}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <dt className="text-sm text-[var(--text-muted)]">Email</dt>
              <dd className="text-sm font-medium text-[var(--text-primary)]">{user.email}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-sm text-[var(--text-muted)]">Rol</dt>
              <dd className="text-sm font-medium text-[var(--primary)]">Cliente</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
