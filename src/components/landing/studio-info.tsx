"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Mail, Phone, Clock, Users, Wallet } from "lucide-react";
import {
  formatMessage,
  useLocale,
  useStudioBranding,
  useTranslations,
} from "@/components/providers/locale-provider";
import {
  formatStudioPhone,
  isPublicPhone,
  siteConfig,
  studioMapsUrl,
  studioTelHref,
} from "@/lib/site-config";
import { formatScheduleHoursForLocale } from "@/lib/studio-schedule";

export function StudioInfo() {
  const t = useTranslations();
  const { locale } = useLocale();
  const studio = useStudioBranding();
  const [hours, setHours] = useState(t.common.hours);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/studio")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const schedule = data?.studio?.schedule as
          | Array<{
              dayOfWeek: number;
              startTime: string;
              endTime: string;
              lunchStart: string | null;
              lunchEnd: string | null;
              gapMinutes: number;
            }>
          | undefined;
        if (cancelled || !schedule?.length) return;
        setHours(
          formatScheduleHoursForLocale(
            schedule.map((row) => ({
              dayOfWeek: row.dayOfWeek,
              dayName: "",
              isActive: true,
              startTime: row.startTime,
              endTime: row.endTime,
              lunchStart: row.lunchStart ?? "",
              lunchEnd: row.lunchEnd ?? "",
              gapMinutes: row.gapMinutes,
            })),
            locale
          )
        );
      })
      .catch(() => {
        // Keep the static hours line
      });
    return () => {
      cancelled = true;
    };
  }, [locale, t.common.hours]);

  const phone = studio.phone;
  const mapsUrl = studioMapsUrl();

  return (
    <section id="visit" className="border-t border-[var(--studio-line)]">
      <div className="studio-container py-16 sm:py-20">
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-[var(--studio-ink)]">
          {t.visit.title}
        </h2>
        <p className="mt-3 max-w-xl text-base text-[var(--studio-muted)]">{t.visit.subtitle}</p>

        <dl className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5">
            <dt className="flex items-center gap-2 text-sm font-medium text-[var(--studio-ink)]">
              <Clock className="h-4 w-4" />
              {t.visit.hours}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-[var(--studio-muted)]">{hours}</dd>
          </div>
          <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5">
            <dt className="flex items-center gap-2 text-sm font-medium text-[var(--studio-ink)]">
              <Wallet className="h-4 w-4" />
              {t.visit.price}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-[var(--studio-muted)]">
              {formatMessage(t.visit.priceDetail, { price: studio.sessionPriceFrom })}
            </dd>
          </div>
          <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5">
            <dt className="flex items-center gap-2 text-sm font-medium text-[var(--studio-ink)]">
              <Users className="h-4 w-4" />
              {t.visit.classSize}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-[var(--studio-muted)]">
              {formatMessage(t.visit.classSizeDetail, { count: siteConfig.slotCapacity })}
            </dd>
          </div>
          <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5">
            <dt className="flex items-center gap-2 text-sm font-medium text-[var(--studio-ink)]">
              <MapPin className="h-4 w-4" />
              {t.visit.address}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-[var(--studio-muted)]">
              {studio.location}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-[var(--studio-ink)] underline-offset-4 hover:underline"
              >
                {t.visit.directions}
              </a>
            </dd>
          </div>
          {isPublicPhone(phone) ? (
            <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5">
              <dt className="flex items-center gap-2 text-sm font-medium text-[var(--studio-ink)]">
                <Phone className="h-4 w-4" />
                {t.visit.phone}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed">
                <a
                  href={studioTelHref(phone)}
                  className="text-[var(--studio-ink)] underline-offset-4 hover:underline"
                >
                  {formatStudioPhone(phone)}
                </a>
              </dd>
            </div>
          ) : null}
          <div className="rounded-2xl border border-[var(--studio-line)] bg-[var(--studio-surface)] p-5">
            <dt className="flex items-center gap-2 text-sm font-medium text-[var(--studio-ink)]">
              <Mail className="h-4 w-4" />
              {t.visit.email}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed">
              <a
                href={`mailto:${studio.email}`}
                className="break-all text-[var(--studio-ink)] underline-offset-4 hover:underline"
              >
                {studio.email}
              </a>
            </dd>
          </div>
        </dl>

        <div className="mt-10">
          <Link href="/book" className="studio-btn studio-btn-primary w-full sm:w-auto">
            {t.visit.book}
          </Link>
        </div>
      </div>
    </section>
  );
}
