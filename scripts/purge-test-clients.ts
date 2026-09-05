/**
 * Remove test client accounts from the studio database.
 * Keeps Γεωργία Δημητρίου, studio admin emails, and instructor/admin roles.
 *
 *   CONFIRM=PURGE_TEST_CLIENTS pnpm exec tsx scripts/purge-test-clients.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { isStudioAdminEmail } from "../src/lib/studio-admins";
import { KEEP_STUDIO_CLIENT_NAME, isKeptStudioClientName } from "../src/lib/keep-studio-client";

config({ path: resolve(__dirname, "../.env") });

type StudioUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  instructor: { id: string } | null;
  admin: { id: string } | null;
  _count: { appointments: number };
};

function shouldKeep(user: StudioUser): boolean {
  if (user.role === "ADMIN" || user.role === "INSTRUCTOR") return true;
  if (user.instructor || user.admin) return true;
  if (isStudioAdminEmail(user.email)) return true;
  return isKeptStudioClientName(user.name);
}

async function main() {
  if (process.env.CONFIRM !== "PURGE_TEST_CLIENTS") {
    console.error("Refusing to purge. Re-run with CONFIRM=PURGE_TEST_CLIENTS");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");

  const users = (await prisma.user.findMany({
    include: {
      instructor: { select: { id: true } },
      admin: { select: { id: true } },
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: "asc" },
  })) as StudioUser[];

  const keep = users.filter((user: StudioUser) => shouldKeep(user));
  const remove = users.filter((user: StudioUser) => !shouldKeep(user));
  const keptClient = keep.filter((user: StudioUser) => isKeptStudioClientName(user.name));

  if (keptClient.length === 0) {
    console.error(
      `Refusing to purge: no client named ${KEEP_STUDIO_CLIENT_NAME} was found. Nobody was deleted.`
    );
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Keeping ${keep.length} account(s), including ${KEEP_STUDIO_CLIENT_NAME}:`);
  for (const user of keep as StudioUser[]) {
    console.log(`  keep ${user.role} ${user.name} appointments=${user._count.appointments}`);
  }

  if (remove.length === 0) {
    console.log("No test clients to remove.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Removing ${remove.length} test client(s):`);
  for (const user of remove as StudioUser[]) {
    console.log(`  remove ${user.role} ${user.name} appointments=${user._count.appointments}`);
  }

  const ids = remove.map((user: StudioUser) => user.id);

  const posts = await prisma.blogPost.deleteMany({
    where: { authorId: { in: ids } },
  });
  const reviews = await prisma.review.deleteMany({
    where: { appointment: { clientId: { in: ids } } },
  });
  const chats = await prisma.chatMessage.deleteMany({
    where: { appointment: { clientId: { in: ids } } },
  });
  const appointments = await prisma.appointment.deleteMany({
    where: { clientId: { in: ids } },
  });
  const profiles = await prisma.clientProfile.deleteMany({
    where: { userId: { in: ids } },
  });
  const sessions = await prisma.session.deleteMany({
    where: { userId: { in: ids } },
  });
  const accounts = await prisma.account.deleteMany({
    where: { userId: { in: ids } },
  });
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(
    `Purged test clients: users=${deletedUsers.count} appointments=${appointments.count} profiles=${profiles.count} sessions=${sessions.count} accounts=${accounts.count} reviews=${reviews.count} chats=${chats.count} posts=${posts.count}`
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
