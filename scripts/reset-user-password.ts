#!/usr/bin/env tsx
/**
 * Admin emergency password reset (when email reset is unavailable).
 *
 * Usage:
 *   pnpm exec tsx scripts/reset-user-password.ts user@example.com NewPassword123
 */
import { config } from "dotenv";
import { resolve } from "path";
import { hashPassword } from "better-auth/crypto";

config({ path: resolve(__dirname, "../.env") });

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: pnpm exec tsx scripts/reset-user-password.ts <email> <new-password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (!account) {
    console.error(`No email/password account for ${email} (maybe Google sign-in only).`);
    process.exit(1);
  }

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction([
    prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  console.log(`Password updated for ${email}. All sessions revoked.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
