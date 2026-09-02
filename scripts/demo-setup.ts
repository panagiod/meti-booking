import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";
import { randomBytes } from "crypto";
import {
  studioScheduleSeedRows,
  formatScheduleHoursForLocale,
  mergeScheduleFromDb,
  STUDIO_SESSION_DURATION_MIN,
} from "../src/lib/studio-schedule";
import { DEFAULT_BOOKING_LEAD_HOURS } from "../src/lib/booking-config";

config({ path: resolve(__dirname, "../.env") });

const RESET = process.argv.includes("--reset");
const RESET_CONTENT = process.argv.includes("--reset-content");

function resolveDemoPassword(): string {
  if (process.env.DEMO_PASSWORD) {
    return process.env.DEMO_PASSWORD;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DEMO_PASSWORD is required in production. Set ALLOW_DEMO_SEED=1 and DEMO_PASSWORD."
    );
  }
  return "Demo1234!";
}

const DEMO_PASSWORD = resolveDemoPassword();
const DEMO_USERS = {
  admin: {
    email: "admin@demo.meti-booking.local",
    name: "Demo Admin",
    role: "ADMIN" as const,
  },
  advisor: {
    email: "tyrri_meropi@hotmail.com",
    name: "Meropi Tirri",
    role: "ADVISOR" as const,
  },
  client: {
    email: "client@demo.meti-booking.local",
    name: "Demo Client",
    role: "CLIENT" as const,
  },
};

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Copy .env.demo.example to .env first.");
  }

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "1") {
    throw new Error(
      "demo:setup is blocked in production. Set ALLOW_DEMO_SEED=1 to run intentionally."
    );
  }

  if (RESET) {
    console.log("[demo-setup] --reset: will overwrite existing schedule, services, and advisor profile.");
  } else {
    console.log("[demo-setup] Preserving existing admin calendar and website content (use --reset to re-seed).");
  }

  if (RESET_CONTENT) {
    console.log("[demo-setup] --reset-content: will reset website CMS to defaults.");
  }

  console.log("[demo-setup] Applying database migrations...");
  execSync("pnpm exec prisma migrate deploy", { stdio: "inherit" });

  console.log("[demo-setup] Seeding categories...");
  execSync("tsx scripts/seed-categories.ts", { stdio: "inherit" });

  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../src/generated/prisma/client");
  const { auth } = await import("../src/lib/auth");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const headers = new Headers({
    host: new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000").host,
  });

  async function ensureUser(
    email: string,
    name: string,
    role: "ADMIN" | "ADVISOR" | "CLIENT"
  ) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
      await auth.api.signUpEmail({
        body: { email, password: DEMO_PASSWORD, name },
        headers,
      });
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    if (role === "ADMIN") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      const existingProfile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });
      if (RESET || !existingProfile) {
        await prisma.adminProfile.deleteMany({ where: { userId: user.id } });
        await prisma.adminProfile.create({
          data: { userId: user.id, level: "SUPERADMIN" },
        });
      }
      await prisma.clientProfile.deleteMany({ where: { userId: user.id } });
      return user.id;
    }

    if (role === "ADVISOR") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "ADVISOR" } });
      await prisma.clientProfile.deleteMany({ where: { userId: user.id } });

      let advisor = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
      if (!advisor) {
        advisor = await prisma.advisorProfile.create({
          data: {
            userId: user.id,
            bio: "Certified STOTT Pilates instructor with 8+ years teaching reformer sessions.",
            speciality: "Pilates & Movement",
            isActive: true,
            isVerified: true,
            verificationStatus: "APPROVED",
            bookingLeadHours: DEFAULT_BOOKING_LEAD_HOURS,
          },
        });
      } else if (RESET) {
        await prisma.advisorProfile.update({
          where: { id: advisor.id },
          data: {
            bio: "Certified STOTT Pilates instructor with 8+ years teaching reformer sessions.",
            speciality: "Pilates & Movement",
            isActive: true,
            isVerified: true,
            verificationStatus: "APPROVED",
            bookingLeadHours: DEFAULT_BOOKING_LEAD_HOURS,
          },
        });
      }

      const category = await prisma.category.findUnique({ where: { slug: "pilates" } });
      const existingCategories = await prisma.advisorCategory.count({
        where: { advisorId: advisor.id },
      });
      if (category && (RESET || existingCategories === 0)) {
        await prisma.advisorCategory.deleteMany({ where: { advisorId: advisor.id } });
        await prisma.advisorCategory.create({
          data: { advisorId: advisor.id, categoryId: category.id },
        });
      }

      const existingSchedule = await prisma.advisorSchedule.count({
        where: { advisorId: advisor.id },
      });
      if (RESET || existingSchedule === 0) {
        await prisma.advisorSchedule.deleteMany({ where: { advisorId: advisor.id } });
        for (const row of studioScheduleSeedRows()) {
          await prisma.advisorSchedule.create({
            data: {
              advisorId: advisor.id,
              ...row,
              isActive: true,
            },
          });
        }
      }

      if (RESET) {
        await prisma.advisorService.updateMany({
          where: { advisorId: advisor.id, name: "Reformer Session" },
          data: { durationMin: STUDIO_SESSION_DURATION_MIN },
        });
      }

      const existingServices = await prisma.advisorService.count({
        where: { advisorId: advisor.id },
      });
      if (RESET || existingServices === 0) {
        await prisma.advisorService.deleteMany({ where: { advisorId: advisor.id } });
        await prisma.advisorService.create({
          data: {
            advisorId: advisor.id,
            name: "Reformer Session",
            description: "Equipment-based full-body workout on the reformer.",
            durationMin: STUDIO_SESSION_DURATION_MIN,
            priceCents: 1000,
            isActive: true,
            categoryId: category?.id,
          },
        });
      }

      return user.id;
    }

    await prisma.user.update({ where: { id: user.id }, data: { role: "CLIENT" } });
    await prisma.clientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return user.id;
  }

  console.log("[demo-setup] Creating demo users...");
  for (const account of Object.values(DEMO_USERS)) {
    await ensureUser(account.email, account.name, account.role);
    console.log(`  ✓ ${account.role.toLowerCase()}: ${account.email}`);
  }

  const { ensureStudioContentSeed, resetStudioContentToDefaults } = await import(
    "../src/lib/studio-content-server"
  );
  if (RESET_CONTENT) {
    await resetStudioContentToDefaults();
    console.log("[demo-setup] Studio website content reset to defaults.");
  } else {
    await ensureStudioContentSeed();
    console.log("[demo-setup] Studio website content seeded.");
  }

  await prisma.$disconnect();

  console.log("\n[demo-setup] Demo environment is ready.\n");
  if (process.env.NODE_ENV !== "production") {
    console.log(`Accounts (password: ${DEMO_PASSWORD}):`);
  } else {
    console.log("Demo accounts created. Password was set via DEMO_PASSWORD env (not printed).");
  }
  console.log(`  Admin:   ${DEMO_USERS.admin.email}`);
  console.log(`  Advisor: ${DEMO_USERS.advisor.email}`);
  console.log(`  Client:  ${DEMO_USERS.client.email}`);
  console.log("\nNext: pnpm dev → http://localhost:3000");
}

main().catch((error) => {
  console.error("[demo-setup] Failed:", error);
  process.exit(1);
});
