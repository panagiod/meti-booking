import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ensureStudioOwnerAdmin } from "@/lib/admin-promote";
import { isStudioAdminEmail } from "@/lib/studio-admins";

export async function requireAdminSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  const email = session.user.email;
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    if (!isStudioAdminEmail(email)) {
      return { error: "Forbidden" as const, status: 403 as const };
    }
    await ensureStudioOwnerAdmin(email);
    (session.user as { role?: string }).role = "ADMIN";
  }

  return { session };
}
