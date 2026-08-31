"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeWarningProps {
  scheduledAt: string;
  durationMin: number;
}

export function TimeWarning({ scheduledAt, durationMin }: TimeWarningProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [status, setStatus] = useState<"normal" | "warning" | "critical" | "ended">("normal");

  useEffect(() => {
    const endTime = new Date(new Date(scheduledAt).getTime() + durationMin * 60 * 1000);

    const updateTimer = () => {
      const now = new Date();
      const remaining = endTime.getTime() - now.getTime();
      const remainingMinutes = remaining / (1000 * 60);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setStatus("ended");
      } else if (remainingMinutes <= 1) {
        setStatus("critical");
      } else if (remainingMinutes <= 15) {
        setStatus("warning");
      } else {
        setStatus("normal");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt, durationMin]);

  if (status === "normal") return null;

  const totalSeconds = Math.max(0, Math.floor(timeRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div
      className={cn(
        "absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse",
        status === "ended" && "bg-[var(--error)] text-white animate-none",
        status === "critical" && "bg-[var(--error)] text-white",
        status === "warning" && "bg-[var(--warning)] text-white"
      )}
    >
      {status === "ended" ? (
        <>
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Session ended</span>
        </>
      ) : (
        <>
          <Clock className="w-5 h-5" />
          <span className="font-medium">
            {status === "critical" ? "Session ends in" : "Time remaining:"}{" "}
            {timeString}
          </span>
        </>
      )}
    </div>
  );
}
