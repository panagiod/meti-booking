"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Clock,
  User,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { LoadingPage } from "../ui/loading";

interface WaitingRoomProps {
  appointmentId: string;
  userRole: "advisor" | "client";
  onJoin: () => void;
}

interface AppointmentData {
  id: string;
  scheduledAt: string;
  durationMin: number;
  service: { name: string };
  instructor: { user: { name: string } };
  client: { name: string };
  status: string;
}

const START_TIME_MESSAGE = "It's time to start!";

export function WaitingRoom({ appointmentId, userRole, onJoin }: WaitingRoomProps) {
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAppointment(data.appointment);
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  useEffect(() => {
    if (!appointment) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const scheduled = new Date(appointment.scheduledAt);
      const diff = scheduled.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(START_TIME_MESSAGE);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [appointment]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <LoadingPage label="Loading waiting room..." />
      </div>
    );
  }

  if (!appointment) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-[var(--text-muted)]">Appointment not found</p>
        </CardContent>
      </Card>
    );
  }

  const isTime = timeLeft === START_TIME_MESSAGE;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <CardTitle className="text-xl">Waiting room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Appointment Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">
              {userRole === "advisor" ? "Client:" : "Instructor:"}
            </span>
            <span className="font-medium text-[var(--text-primary)]">
              {userRole === "advisor"
                ? appointment.client.name
                : appointment.instructor.user.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">Date:</span>
            <span className="font-medium text-[var(--text-primary)]">
              {format(new Date(appointment.scheduledAt), "MMMM d, yyyy", {
                locale: enUS,
              })}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">Time:</span>
            <span className="font-medium text-[var(--text-primary)]">
              {format(new Date(appointment.scheduledAt), "HH:mm")} •{" "}
              {appointment.durationMin} min
            </span>
          </div>
        </div>

        {/* Time Left */}
        <div className="text-center py-4">
          {isTime ? (
            <Badge variant="success" className="text-lg px-4 py-2">
              {START_TIME_MESSAGE}
            </Badge>
          ) : (
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-2">
                Your session starts in:
              </p>
              <p className="text-3xl font-heading font-bold text-[var(--primary)]">
                {timeLeft}
              </p>
            </div>
          )}
        </div>

        {/* Join Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={onJoin}
          disabled={!isTime}
        >
          {isTime ? (
            <>
              Join video call
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 mr-2" />
              Waiting...
            </>
          )}
        </Button>

        <p className="text-xs text-center text-[var(--text-muted)]">
          {userRole === "advisor"
            ? "The client will join when the session begins"
            : "Your instructor will grant access when the session begins"}
        </p>
      </CardContent>
    </Card>
  );
}
