#!/usr/bin/env tsx
/**
 * Cancel leftover bookings so public slots stay free.
 *
 * FREE_ALL_UPCOMING_SLOTS=1  — cancel every upcoming held slot (admin "Free all")
 * default                     — cancel automated test emails only
 */
import { config } from "dotenv";
import { resolve } from "path";
import { isAutomatedTestEmail } from "../src/lib/appointment-cancel";

config({ path: resolve(__dirname, "../.env") });

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const freeAll = process.env.FREE_ALL_UPCOMING_SLOTS === "1";

  const holding = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      scheduledAt: { gte: new Date() },
    },
    include: { client: { select: { email: true } } },
  });

  const targets = freeAll
    ? holding
    : holding.filter((apt: (typeof holding)[number]) => isAutomatedTestEmail(apt.client.email));

  if (targets.length === 0) {
    console.log(freeAll ? "No upcoming bookings holding slots." : "No leftover test bookings holding slots.");
    await prisma.$disconnect();
    return;
  }

  const ids = targets.map((apt: (typeof targets)[number]) => apt.id);
  await prisma.appointment.updateMany({
    where: { id: { in: ids } },
    data: {
      status: "CANCELLED",
      cancelReason: freeAll
        ? "Cancelled by admin — slots freed after tests"
        : "Cancelled leftover automated test bookings",
      cancelledAt: new Date(),
    },
  });

  console.log(`Freed ${ids.length} slot(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
