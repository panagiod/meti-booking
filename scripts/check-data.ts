import { config } from "dotenv";
import { resolve } from "path";
import { createSqlitePrisma } from "./lib/sqlite-prisma";

config({ path: resolve(__dirname, "../.env") });

async function check() {
  const prisma = createSqlitePrisma(process.env.DATABASE_URL!);

  const advisors = await prisma.instructorProfile.findMany({
    select: { id: true, isActive: true, verificationStatus: true, user: { select: { name: true } } },
  });
  console.log("Advisors:", JSON.stringify(advisors, null, 2));
  
  const services = await prisma.instructorService.findMany({
    select: { id: true, name: true, instructorId: true, isActive: true },
  });
  console.log("Services:", JSON.stringify(services, null, 2));
  
  await prisma.$disconnect();
}

check();
