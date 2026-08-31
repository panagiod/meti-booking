import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

const ACTIVE_DAYS = [1, 3, 6] as const; // Mon, Wed, Sat
const START = "14:00";
const END = "17:00";

async function main() {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../src/generated/prisma/client");
  const { formatScheduleHoursForLocale, mergeScheduleFromDb } = await import(
    "../src/lib/studio-schedule"
  );
  const { getStudioContent, saveStudioContent } = await import(
    "../src/lib/studio-content-server"
  );
  const { resolveStudioAdvisor } = await import("../src/lib/studio-advisor");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const advisor = await resolveStudioAdvisor();
  if (!advisor) {
    throw new Error("No studio instructor configured");
  }

  await prisma.advisorSchedule.deleteMany({ where: { advisorId: advisor.id } });

  for (const dayOfWeek of ACTIVE_DAYS) {
    await prisma.advisorSchedule.create({
      data: {
        advisorId: advisor.id,
        dayOfWeek,
        startTime: START,
        endTime: END,
        lunchStart: null,
        lunchEnd: null,
        gapMinutes: 10,
        isActive: true,
      },
    });
  }

  const schedules = await prisma.advisorSchedule.findMany({
    where: { advisorId: advisor.id },
    orderBy: { dayOfWeek: "asc" },
  });
  const merged = mergeScheduleFromDb(schedules);
  const content = await getStudioContent();
  await saveStudioContent({
    ...content,
    contentEn: {
      ...content.contentEn,
      common: {
        ...content.contentEn.common,
        hours: formatScheduleHoursForLocale(merged, "en"),
      },
    },
    contentEl: {
      ...content.contentEl,
      common: {
        ...content.contentEl.common,
        hours: formatScheduleHoursForLocale(merged, "el"),
      },
    },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  console.log("[reset-studio-schedule] Done");
  console.log("  Advisor:", advisor.id);
  console.log(
    "  Active:",
    schedules.map((s) => `${days[s.dayOfWeek]} ${s.startTime}–${s.endTime}`).join(", ")
  );
  console.log("  Hours EN:", formatScheduleHoursForLocale(merged, "en"));
  console.log("  Hours EL:", formatScheduleHoursForLocale(merged, "el"));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[reset-studio-schedule] Failed:", err);
  process.exit(1);
});
