import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ensureStudioOwnerAdmin } from "@/lib/admin-promote";
import { isStudioAdminEmail } from "@/lib/studio-admins";

export const dynamic = "force-dynamic";

/** If this Google account is a studio owner, persist ADMIN and say so. */
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const role = (session.user as { role?: string }).role;
  if (role === "ADMIN") {
    return NextResponse.json({ role: "ADMIN" });
  }

  if (!isStudioAdminEmail(email)) {
    return NextResponse.json({ role: role || "CLIENT" });
  }

  await ensureStudioOwnerAdmin(email);
  return NextResponse.json({ role: "ADMIN" });
}
