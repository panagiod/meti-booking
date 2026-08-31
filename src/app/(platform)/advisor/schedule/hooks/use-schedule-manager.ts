import { useState, useEffect, useCallback } from "react";
import { useDialog } from "@/hooks/use-dialog";
import { DaySchedule, defaultSchedule } from "../utils/schedule-utils";

export function useScheduleManager() {
  const dialog = useDialog();
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule);
  const [hasChanges, setHasChanges] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/advisor/schedule", { credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        if (data.schedules?.length > 0) {
          setSchedule(
            defaultSchedule.map((day) => {
              const dbDay = data.schedules.find((s: any) => s.dayOfWeek === day.dayOfWeek);
              if (dbDay) {
                return {
                  ...day,
                  isActive: dbDay.isActive,
                  startTime: dbDay.startTime,
                  endTime: dbDay.endTime,
                  lunchStart: dbDay.lunchStart || "",
                  lunchEnd: dbDay.lunchEnd || "",
                  gapMinutes: dbDay.gapMinutes,
                };
              }
              return day;
            })
          );
        }
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleDay = useCallback((dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, isActive: !d.isActive } : d
      )
    );
    setHasChanges(true);
  }, []);

  const updateTime = useCallback((dayOfWeek: number, field: keyof DaySchedule, value: string) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    );
    setHasChanges(true);
  }, []);

  const saveSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/advisor/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schedules: schedule }),
      });

      if (res.ok) {
        setHasChanges(false);
        dialog.showAlert("Success", "Schedule saved successfully", "success");
      }
    } catch (error) {
      dialog.showAlert("Error", "Connection error", "error");
    }
  }, [schedule, dialog]);

  return {
    isLoading,
    schedule,
    hasChanges,
    toggleDay,
    updateTime,
    saveSchedule,
  };
}
