import { config } from "dotenv";
import { resolve } from "path";
import { createSqlitePrisma } from "./lib/sqlite-prisma";

config({ path: resolve(__dirname, "../.env") });

const prisma = createSqlitePrisma(process.env.DATABASE_URL!);

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
