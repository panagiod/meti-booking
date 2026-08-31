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
    console.log("🗑️  Limpiando base de datos...");

    // Eliminar en orden correcto (respetar foreign keys)
    await prisma.review.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.advisorService.deleteMany();
    await prisma.advisorSchedule.deleteMany();
    await prisma.advisorProfile.deleteMany();
    await prisma.adminProfile.deleteMany();
    await prisma.clientProfile.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Base de datos limpiada correctamente");
    console.log("   Todos los usuarios y datos han sido eliminados");
  } catch (error) {
    console.error("❌ Error al limpiar la base de datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
