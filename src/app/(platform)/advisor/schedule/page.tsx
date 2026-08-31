"use client";

import { useState, useEffect } from "react";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";

import { useScheduleManager } from "./hooks/use-schedule-manager";
import { useBlockedTimes } from "./hooks/use-blocked-times";
import { useCalendarNav } from "./hooks/use-calendar-nav";

import { ScheduleTabs } from "./components/schedule-tabs";
import { WeeklyScheduleForm } from "./components/weekly-schedule-form";
import { CalendarHeader } from "./components/calendar-header";
import { MonthView } from "./components/month-view";
import { WeekView } from "./components/week-view";
import { DayView } from "./components/day-view";
import { AgendaView } from "./components/agenda-view";
import { BlockTimeModal } from "./components/block-time-modal";

type ActiveTab = "schedule" | "calendar";

export default function SchedulePage() {
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState<ActiveTab>("calendar");

  const {
    isLoading,
    schedule,
    hasChanges,
    toggleDay,
    updateTime,
    saveSchedule,
  } = useScheduleManager();

  const {
    blockedTimes,
    showModal,
    blockTitle,
    blockStartDate,
    blockEndDate,
    loadBlockedTimes,
    createBlock,
    deleteBlock,
    openModal,
    closeModal,
    setBlockTitle,
    setBlockStartDate,
    setBlockEndDate,
  } = useBlockedTimes();

  const {
    viewMode,
    setViewMode,
    currentDate,
    appointments,
    calendarDays,
    navigatePrev,
    navigateNext,
    goToToday,
    goToDay,
    fetchAppointments,
  } = useCalendarNav();

  useEffect(() => {
    loadBlockedTimes();
  }, [loadBlockedTimes]);

  useEffect(() => {
    if (activeTab === "calendar") {
      fetchAppointments();
    }
  }, [activeTab, fetchAppointments]);

  if (isLoading) return <LoadingPage label="Cargando tu agenda" />;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Mi Agenda
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Gestiona tu horario, citas y bloqueos
          </p>
        </div>

        {/* Tabs */}
        <ScheduleTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <WeeklyScheduleForm
            schedule={schedule}
            hasChanges={hasChanges}
            onToggleDay={toggleDay}
            onTimeChange={updateTime}
            onSave={saveSchedule}
          />
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-4">
            <CalendarHeader
              viewMode={viewMode}
              currentDate={currentDate}
              onPrev={navigatePrev}
              onNext={navigateNext}
              onToday={goToToday}
              onViewModeChange={setViewMode}
              onBlockClick={openModal}
            />

            {viewMode === "month" && (
              <MonthView
                calendarDays={calendarDays}
                currentDate={currentDate}
                blockedTimes={blockedTimes}
                appointments={appointments}
                onDayClick={goToDay}
              />
            )}

            {viewMode === "week" && (
              <WeekView
                calendarDays={calendarDays}
                blockedTimes={blockedTimes}
                appointments={appointments}
              />
            )}

            {viewMode === "day" && (
              <DayView
                currentDate={currentDate}
                blockedTimes={blockedTimes}
                appointments={appointments}
              />
            )}

            {viewMode === "agenda" && (
              <AgendaView
                calendarDays={calendarDays}
                blockedTimes={blockedTimes}
                appointments={appointments}
              />
            )}
          </div>
        )}
      </div>

      {/* Block Modal */}
      <BlockTimeModal
        isOpen={showModal}
        title={blockTitle}
        startDate={blockStartDate}
        endDate={blockEndDate}
        onTitleChange={setBlockTitle}
        onStartDateChange={setBlockStartDate}
        onEndDateChange={setBlockEndDate}
        onConfirm={createBlock}
        onCancel={closeModal}
      />

      <AlertDialog state={dialog} />
    </>
  );
}
