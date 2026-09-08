import { config } from "dotenv";
import { resolve } from "path";
import { prisma } from "../src/lib/prisma";
import { DEFAULT_CANCEL_HOURS } from "../src/lib/booking-config";

config({ path: resolve(__dirname, "../.env") });

/**
 * One-time: move leftover schema-default 24h windows to the new 12h default.
 * Does not overwrite other values (e.g. if admin later sets 24 again).
 */
async function main() {
  const result = await prisma.instructorService.updateMany({
    where: { rescheduleHoursMin: 24 },
    data: { rescheduleHoursMin: DEFAULT_CANCEL_HOURS },
  });
  console.log(
    `[align-cancel-hours] updated ${result.count} service(s) from 24 to ${DEFAULT_CANCEL_HOURS}`
  );
}

main()
  .catch((error) => {
    console.error("[align-cancel-hours] Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
