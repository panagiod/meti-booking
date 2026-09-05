import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { prisma } from "@/lib/prisma";
import { sendStudioOpsEmail } from "@/lib/email";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import { countSlotsPerDay, type StudioDaySchedule } from "@/lib/studio-schedule";
import { evaluateMonitor, shouldSendAlert, type MonitorSample } from "@/lib/studio-monitor";

const STATE_PATH = process.env.METI_MONITOR_STATE || "/var/lib/meti-booking/monitor-state.json";
const SITE = process.env.APP_URL || process.env.BETTER_AUTH_URL || "https://meti-pilates.com";

interface MonitorState {
  ids: string[];
  lastSentAt: string | null;
}

function httpOk(url: string): boolean {
  try {
    const code = execFileSync("curl", ["-fsS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "15", url], {
      encoding: "utf8",
    }).trim();
    return /^(200|307|308)$/.test(code);
  } catch {
    return false;
  }
}

function serviceActive(): boolean {
  try {
    return execFileSync("systemctl", ["is-active", "meti-booking"], { encoding: "utf8" }).trim() === "active";
  } catch {
    return false;
  }
}

function diskUsedPercent(): number {
  const line = execFileSync("df", ["-P", "/"], { encoding: "utf8" }).trim().split("\n")[1] || "";
  const used = line.trim().split(/\s+/)[4] || "0%";
  return Number(used.replace("%", "")) || 0;
}

function memoryUsedPercent(): number {
  const text = readFileSync("/proc/meminfo", "utf8");
  const total = Number(/MemTotal:\s+(\d+)/.exec(text)?.[1] || 0);
  const available = Number(/MemAvailable:\s+(\d+)/.exec(text)?.[1] || 0);
  if (!total) return 0;
  return Math.round(((total - available) / total) * 100);
}

function loadAndCpus(): { load15: number; cpuCount: number } {
  const load15 = Number(readFileSync("/proc/loadavg", "utf8").trim().split(/\s+/)[2] || 0);
  const cpuCount = execFileSync("nproc", { encoding: "utf8" }).trim();
  return { load15, cpuCount: Number(cpuCount) || 1 };
}

function readState(): MonitorState {
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf8")) as MonitorState;
  } catch {
    return { ids: [], lastSentAt: null };
  }
}

function writeState(state: MonitorState) {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state), { mode: 0o600 });
}

function safeNumber(read: () => number, fallback = 0): number {
  try {
    return read();
  } catch {
    return fallback;
  }
}

async function calendarUsage(): Promise<{ upcomingBooked: number; upcomingCapacity: number }> {
  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcomingBooked = await prisma.appointment.count({
    where: {
      scheduledAt: { gte: now, lte: in14Days },
      status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      isTest: false,
    },
  });

  const instructor = await resolveStudioInstructor();
  if (!instructor) {
    return { upcomingBooked, upcomingCapacity: 0 };
  }

  const [service, schedules] = await Promise.all([
    prisma.instructorService.findFirst({
      where: { instructorId: instructor.id, isActive: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.instructorSchedule.findMany({
      where: { instructorId: instructor.id, isActive: true },
    }),
  ]);
  const duration = service?.durationMin || 45;
  let perWeek = 0;
  for (const row of schedules as Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    lunchStart: string | null;
    lunchEnd: string | null;
    gapMinutes: number;
  }>) {
    const day: StudioDaySchedule = {
      dayOfWeek: row.dayOfWeek,
      dayName: "",
      isActive: true,
      startTime: row.startTime,
      endTime: row.endTime,
      lunchStart: row.lunchStart || "",
      lunchEnd: row.lunchEnd || "",
      gapMinutes: row.gapMinutes ?? 0,
    };
    perWeek += countSlotsPerDay(day, duration);
  }

  return { upcomingBooked, upcomingCapacity: perWeek * 2 };
}

async function main() {
  let calendar = { upcomingBooked: 0, upcomingCapacity: 0 };
  try {
    calendar = await calendarUsage();
  } catch (error) {
    console.error("Calendar usage check failed:", error);
  }

  const sample: MonitorSample = {
    homepageOk: httpOk(`${SITE}/`),
    bookOk: httpOk(`${SITE}/book`),
    healthOk: httpOk(`${SITE}/api/health`),
    serviceActive: serviceActive(),
    diskUsedPercent: safeNumber(diskUsedPercent),
    memoryUsedPercent: safeNumber(memoryUsedPercent),
    load15: safeNumber(() => loadAndCpus().load15),
    cpuCount: safeNumber(() => loadAndCpus().cpuCount, 1),
    upcomingBooked: calendar.upcomingBooked,
    upcomingCapacity: calendar.upcomingCapacity,
  };

  const issues = evaluateMonitor(sample);
  const currentIds = issues.map((issue) => issue.id);
  const previous = readState();
  const decision = shouldSendAlert(currentIds, previous.ids, previous.lastSentAt);

  console.log(
    JSON.stringify({
      sample,
      issues: currentIds,
      send: decision.send,
      recovered: decision.recovered,
    })
  );

  if (!decision.send) {
    writeState({ ids: currentIds, lastSentAt: previous.lastSentAt });
    return;
  }

  const subject = decision.recovered
    ? "MeTi Pilates is healthy again"
    : issues.some((issue) => issue.severity === "down")
      ? "MeTi Pilates needs attention (downtime)"
      : "MeTi Pilates needs attention (high usage)";

  const body = decision.recovered
    ? `<p style="margin:0 0 16px;color:#374151;line-height:1.6;">The studio site looks healthy again. No action needed.</p>`
    : `<p style="margin:0 0 16px;color:#374151;line-height:1.6;">Something needs a look on the studio server:</p>
      <ul style="padding-left:20px;color:#374151;line-height:1.6;">
        ${issues
          .map(
            (issue) =>
              `<li><strong>${issue.title}</strong> — ${issue.detail}<br /><em>${issue.action}</em></li>`
          )
          .join("")}
      </ul>
      <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">This check runs every 15 minutes. You will get another email if it is still wrong after 6 hours.</p>`;

  const sent = await sendStudioOpsEmail(subject, body);
  writeState({
    ids: currentIds,
    lastSentAt: sent ? new Date().toISOString() : previous.lastSentAt,
  });
  if (!sent) {
    console.error("Could not send ops alert email (RESEND_API_KEY missing?)");
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
