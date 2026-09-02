#!/usr/bin/env tsx
/**
 * Cancel leftover automated test bookings so public slots stay free.
 * Used after production smoke tests / deploys.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { isAutomatedTestEmail } from "../src/lib/appointment-cancel";

config({ path: resolve(__dirname, "../.env") });

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const holding = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
      scheduledAt: { gte: new Date() },
    },
    include: { client: { select: { email: true } } },
  });

  const testBookings = holding.filter((apt: (typeof holding)[number]) =>
    isAutomatedTestEmail(apt.client.email)
  );
  if (testBookings.length === 0) {
    console.log("No leftover test bookings holding slots.");
    await prisma.$disconnect();
    return;
  }

  const ids = testBookings.map((apt: (typeof testBookings)[number]) => apt.id);
  await prisma.appointment.updateMany({
    where: { id: { in: ids } },
    data: {
      status: "CANCELLED",
      cancelReason: "Cancelled leftover automated test bookings",
      cancelledAt: new Date(),
    },
  });

  console.log(`Freed ${ids.length} test booking slot(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
