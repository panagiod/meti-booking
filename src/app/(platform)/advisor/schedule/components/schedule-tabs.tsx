"use client";

import { Settings, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveTab = "schedule" | "calendar";

interface ScheduleTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function ScheduleTabs({ activeTab, onTabChange }: ScheduleTabsProps) {
  return (
    <div className="flex gap-2 border-b border-[var(--border)]">
      <button
        onClick={() => onTabChange("schedule")}
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
          activeTab === "schedule"
            ? "border-[var(--primary)] text-[var(--primary)]"
            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        )}
      >
        <Settings className="w-4 h-4 inline mr-2" />
        Horario semanal
      </button>
      <button
        onClick={() => onTabChange("calendar")}
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
          activeTab === "calendar"
            ? "border-[var(--primary)] text-[var(--primary)]"
            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        )}
      >
        <Calendar className="w-4 h-4 inline mr-2" />
        Calendario
      </button>
    </div>
  );
}
