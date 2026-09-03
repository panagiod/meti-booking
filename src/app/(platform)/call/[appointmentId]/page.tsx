"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { VideoCall } from "@/components/video/video-call";
import { WaitingRoom } from "@/components/video/waiting-room";
import { LoadingPage } from "@/components/ui/loading";
import { Logo } from "@/components/ui/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";

interface AppointmentData {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
}

export default function CallPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [timeStatus, setTimeStatus] = useState<"before" | "during" | "after" | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.push("/login");
          return;
        }
        setUser(data.user);

        try {
          const res = await fetch(`/api/appointments/${appointmentId}`, { credentials: "include" });
          if (res.ok) {
            const { appointment: apt } = await res.json();
            if (apt) {
              setAppointment(apt);

              // Validate whether the appointment is within the time window
              const now = new Date();
              const start = new Date(apt.scheduledAt);
              const end = new Date(start.getTime() + apt.durationMin * 60000);

              // Allow joining 5 minutes before start
              const startWithBuffer = new Date(start.getTime() - 5 * 60000);

              if (now < startWithBuffer) {
                setTimeStatus("before");
              } else if (now > end) {
                setTimeStatus("after");
              } else {
                setTimeStatus("during");
                if (apt.status === "IN_PROGRESS") {
                  setInCall(true);
                }
              }
            }
          }
        } catch {}
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router, appointmentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingPage label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = (user as any).role === "ADVISOR" ? "advisor" : "client";

  // If the appointment has already ended, show a message
  if (timeStatus === "after" && !inCall) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="container-meti flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Logo className="h-9 w-auto" />
            </div>
          </div>
        </header>
        <main className="container-meti py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--error-light)] flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[var(--error)]" />
              </div>
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">
                The session has ended
              </h2>
              <p className="text-[var(--text-muted)] mb-6">
                This consultation has passed. If you need another appointment, you can book a new one.
              </p>
              <div className="flex flex-col gap-3">
                {userRole === "advisor" ? (
                  <Button onClick={() => router.push("/admin/schedule")}>
                    <Calendar className="w-4 h-4 mr-2" />
                    View schedule
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/book")}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Book another appointment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // If it is too early to join
  if (timeStatus === "before" && !inCall) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="container-meti flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Logo className="h-9 w-auto" />
            </div>
          </div>
        </header>
        <main className="container-meti py-8">
          <WaitingRoom
            appointmentId={appointmentId}
            userRole={userRole as "advisor" | "client"}
            onJoin={() => setInCall(true)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="container-meti flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Logo className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            {user.image && (
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        </div>
      </header>

      <main className="container-meti py-8">
        {inCall ? (
          <VideoCall
            appointmentId={appointmentId}
            userRole={userRole as "advisor" | "client"}
            userName={user.name}
            userId={user.id}
          />
        ) : (
          <WaitingRoom
            appointmentId={appointmentId}
            userRole={userRole as "advisor" | "client"}
            onJoin={() => setInCall(true)}
          />
        )}
      </main>
    </div>
  );
}
