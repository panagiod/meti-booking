export type MonitorSeverity = "down" | "usage";

export interface MonitorIssue {
  id: string;
  severity: MonitorSeverity;
  title: string;
  detail: string;
  action: string;
}

export interface MonitorSample {
  homepageOk: boolean;
  bookOk: boolean;
  healthOk: boolean;
  serviceActive: boolean;
  diskUsedPercent: number;
  memoryUsedPercent: number;
  load15: number;
  cpuCount: number;
  upcomingBooked: number;
  upcomingCapacity: number;
}

export const DISK_ALERT_PERCENT = 80;
export const MEMORY_ALERT_PERCENT = 88;
export const LOAD_ALERT_MULTIPLIER = 1.5;
export const CALENDAR_ALERT_RATIO = 0.8;

export function evaluateMonitor(sample: MonitorSample): MonitorIssue[] {
  const issues: MonitorIssue[] = [];

  if (!sample.serviceActive) {
    issues.push({
      id: "service-down",
      severity: "down",
      title: "Studio app is not running",
      detail: "systemd service meti-booking is not active.",
      action: "SSH in and run: systemctl status meti-booking && journalctl -u meti-booking -n 50",
    });
  }

  if (!sample.healthOk) {
    issues.push({
      id: "health-down",
      severity: "down",
      title: "Health check failed",
      detail: "The app did not answer /api/health.",
      action: "Check the site and restart if needed: systemctl restart meti-booking",
    });
  }

  if (!sample.homepageOk || !sample.bookOk) {
    issues.push({
      id: "public-down",
      severity: "down",
      title: "Public site is not loading",
      detail: `Homepage ${sample.homepageOk ? "ok" : "failed"}, /book ${sample.bookOk ? "ok" : "failed"}.`,
      action: "Open https://meti-pilates.com. If it stays down, check Caddy and the VPS.",
    });
  }

  if (sample.diskUsedPercent >= DISK_ALERT_PERCENT) {
    issues.push({
      id: "disk-high",
      severity: "usage",
      title: "Disk is filling up",
      detail: `Disk is ${sample.diskUsedPercent}% full.`,
      action: "Free space or upgrade the Hetzner volume. Backups and uploads live on this disk.",
    });
  }

  if (sample.memoryUsedPercent >= MEMORY_ALERT_PERCENT) {
    issues.push({
      id: "memory-high",
      severity: "usage",
      title: "Memory is very high",
      detail: `RAM is ${sample.memoryUsedPercent}% used.`,
      action: "Restart the app, or upgrade the 4GB VPS if this keeps happening.",
    });
  }

  if (sample.cpuCount > 0 && sample.load15 >= sample.cpuCount * LOAD_ALERT_MULTIPLIER) {
    issues.push({
      id: "load-high",
      severity: "usage",
      title: "Server load is high",
      detail: `15-minute load is ${sample.load15} on ${sample.cpuCount} CPU(s).`,
      action: "Check if a deploy or backup is running. If load stays high, upgrade the VPS.",
    });
  }

  if (
    sample.upcomingCapacity > 0 &&
    sample.upcomingBooked / sample.upcomingCapacity >= CALENDAR_ALERT_RATIO
  ) {
    const percent = Math.round((sample.upcomingBooked / sample.upcomingCapacity) * 100);
    issues.push({
      id: "calendar-full",
      severity: "usage",
      title: "The next two weeks are almost full",
      detail: `${sample.upcomingBooked} of ${sample.upcomingCapacity} slots are booked (${percent}%).`,
      action: "Open more days or hours in Admin → Hours if you want to take more bookings.",
    });
  }

  return issues;
}

export function shouldSendAlert(
  currentIds: string[],
  previousIds: string[],
  lastSentAt: string | null,
  now = new Date(),
  remindAfterMs = 6 * 60 * 60 * 1000
): { send: boolean; recovered: boolean } {
  const recovered = previousIds.length > 0 && currentIds.length === 0;
  if (recovered) return { send: true, recovered: true };
  if (currentIds.length === 0) return { send: false, recovered: false };

  const newIssue = currentIds.some((id) => !previousIds.includes(id));
  if (newIssue) return { send: true, recovered: false };

  if (!lastSentAt) return { send: true, recovered: false };
  const elapsed = now.getTime() - new Date(lastSentAt).getTime();
  return { send: elapsed >= remindAfterMs, recovered: false };
}
