import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function requireAdminSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return { error: "Forbidden" as const, status: 403 as const };
  }

  return { session };
}
