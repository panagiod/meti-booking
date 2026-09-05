"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { upcomingCyprusHolidays } from "@/lib/cyprus-holidays";
import { Ban, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getDateFnsLocale } from "@/lib/date-locale";

interface BlockedTime {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function AdminClosuresPage() {
  const t = useTranslations();
  const { locale } = useLocale();
  const dateLocale = getDateFnsLocale(locale);
  const dialog = useDialog();
  const { showAlert } = dialog;
  const [isLoading, setIsLoading] = useState(true);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/studio", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load studio");
      const data = await res.json();
      setBlockedTimes(data.studio.blockedTimes || []);
    } catch {
      showAlert(t.common.error, t.admin.loadClosuresError, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, t.admin.loadClosuresError, t.common.error]);

  useEffect(() => {
    void load();
  }, [load]);

  const addBlock = async () => {
    if (!blockTitle || !blockStart || !blockEnd) {
      dialog.showAlert(t.admin.missingFields, t.admin.fillTitleDates, "warning");
      return;
    }
    setIsBlocking(true);
    try {
      const res = await fetch("/api/admin/studio/blocked-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: blockTitle,
          startDate: blockStart,
          endDate: blockEnd,
          isAllDay: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        dialog.showAlert(t.common.error, data.error || t.admin.couldNotAddBlock, "error");
        return;
      }
      setBlockedTimes((prev) =>
        [...prev, data.blockedTime].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
      );
      setBlockTitle("");
      setBlockStart("");
      setBlockEnd("");
      dialog.showAlert(t.admin.blocked, t.admin.datesBlocked, "success");
    } catch {
      dialog.showAlert(t.common.error, t.admin.connectionError, "error");
    } finally {
      setIsBlocking(false);
    }
  };

  const removeBlock = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/studio/blocked-times?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        dialog.showAlert(t.common.error, t.admin.couldNotRemoveBlock, "error");
        return;
      }
      setBlockedTimes((prev) => prev.filter((item) => item.id !== id));
    } catch {
      dialog.showAlert(t.common.error, t.admin.connectionError, "error");
    }
  };

  if (isLoading) return <LoadingPage label={t.admin.loadingClosures} />;

  return (
    <>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            {t.admin.closuresTitle}
          </h1>
          <p className="mt-1 text-[var(--text-muted)]">{t.admin.closuresSub}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.admin.publicHolidays}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
              {upcomingCyprusHolidays().map((holiday) => (
                <li
                  key={holiday.date}
                  className="flex items-center justify-between gap-3 p-3 text-sm"
                >
                  <span className="font-medium text-[var(--text-primary)]">
                    {locale === "el" ? holiday.nameEl : holiday.name}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {format(new Date(`${holiday.date}T12:00:00`), "EEE d MMM yyyy", {
                      locale: dateLocale,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ban className="w-5 h-5" />
              {t.admin.extraClosures}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--text-muted)]">{t.admin.extraClosuresSub}</p>
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  {t.admin.blockTitle}
                </label>
                <Input
                  placeholder={t.admin.blockTitlePlaceholder}
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">{t.admin.from}</label>
                <Input
                  type="date"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">{t.admin.to}</label>
                <Input
                  type="date"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={addBlock} disabled={isBlocking} variant="secondary">
              <Ban className="w-4 h-4 mr-2" />
              {isBlocking ? t.admin.adding : t.admin.blockDates}
            </Button>

            {blockedTimes.length > 0 ? (
              <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
                {blockedTimes.map((block) => (
                  <li
                    key={block.id}
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{block.title}</p>
                      <p className="text-[var(--text-muted)]">
                        {format(new Date(block.startDate), "d MMM yyyy", { locale: dateLocale })}
                        {" – "}
                        {format(new Date(block.endDate), "d MMM yyyy", { locale: dateLocale })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlock(block.id)}
                      className="text-[var(--danger)] hover:text-[var(--danger)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-[var(--text-muted)]">{t.admin.noExtraClosures}</p>
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog state={dialog} />
    </>
  );
}
