import { config } from "dotenv";
import { resolve } from "path";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(__dirname, "../.env") });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../src/generated/prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function cleanDatabase() {
  try {
    console.log("🗑️  Cleaning database...");

    // Delete in correct order (respect foreign keys)
    await prisma.review.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.instructorService.deleteMany();
    await prisma.instructorSchedule.deleteMany();
    await prisma.instructorProfile.deleteMany();
    await prisma.adminProfile.deleteMany();
    await prisma.clientProfile.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Database cleaned successfully");
    console.log("   All users and data have been removed");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
