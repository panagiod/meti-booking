import { config } from "dotenv";
import { resolve } from "path";
import { studioAdminEmails } from "../src/lib/studio-admins";
import { ensureStudioOwnerAdmin } from "../src/lib/admin-promote";
import { prisma } from "../src/lib/prisma";

config({ path: resolve(__dirname, "../.env") });

async function main() {
  const emails = studioAdminEmails();
  if (emails.length === 0) {
    console.log("[ensure-studio-admin] no studio admin emails configured");
    return;
  }

  for (const email of emails) {
    const result = await ensureStudioOwnerAdmin(email);
    if (!result) {
      console.log(`[ensure-studio-admin] ${email} has not signed in yet`);
      continue;
    }
    console.log(`[ensure-studio-admin] ${email} is ADMIN (was ${result.previousRole})`);
  }
}

main()
  .catch((error) => {
    console.error("[ensure-studio-admin] Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
