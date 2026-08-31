import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

config({ path: resolve(__dirname, "../.env") });

const DEMO_PASSWORD = "Demo1234!";
const DEMO_USERS = {
  admin: {
    email: "admin@demo.meti-booking.local",
    name: "Demo Admin",
    role: "ADMIN" as const,
  },
  advisor: {
    email: "advisor@demo.meti-booking.local",
    name: "Demo Advisor",
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
      await prisma.adminProfile.deleteMany({ where: { userId: user.id } });
      await prisma.adminProfile.create({
        data: { userId: user.id, level: "SUPERADMIN" },
      });
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
            bio: "Demo advisor profile for showcasing the booking flow.",
            isActive: true,
            isVerified: true,
            verificationStatus: "APPROVED",
          },
        });
      }

      const category = await prisma.category.findUnique({ where: { slug: "legal" } });
      if (category) {
        await prisma.advisorCategory.deleteMany({ where: { advisorId: advisor.id } });
        await prisma.advisorCategory.create({
          data: { advisorId: advisor.id, categoryId: category.id },
        });
      }

      await prisma.advisorSchedule.deleteMany({ where: { advisorId: advisor.id } });
      for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
        await prisma.advisorSchedule.create({
          data: {
            advisorId: advisor.id,
            dayOfWeek,
            startTime: "09:00",
            endTime: "17:00",
            lunchStart: "12:00",
            lunchEnd: "13:00",
            gapMinutes: 15,
          },
        });
      }

      await prisma.advisorService.deleteMany({ where: { advisorId: advisor.id } });
      await prisma.advisorService.createMany({
        data: [
          {
            advisorId: advisor.id,
            name: "Strategic Consulting",
            description: "60-minute strategy session for demo bookings.",
            durationMin: 60,
            priceCents: 100000,
            isActive: true,
          },
          {
            advisorId: advisor.id,
            name: "Quick Q&A",
            description: "30-minute focused advisory call.",
            durationMin: 30,
            priceCents: 50000,
            isActive: true,
          },
        ],
      });

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

  await prisma.$disconnect();

  console.log("\n[demo-setup] Demo environment is ready.\n");
  console.log("Accounts (password for all: Demo1234!):");
  console.log(`  Admin:   ${DEMO_USERS.admin.email}`);
  console.log(`  Advisor: ${DEMO_USERS.advisor.email}`);
  console.log(`  Client:  ${DEMO_USERS.client.email}`);
  console.log("\nNext: pnpm dev → http://localhost:3000");
}

main().catch((error) => {
  console.error("[demo-setup] Failed:", error);
  process.exit(1);
});
