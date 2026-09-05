import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { exportClientAccount } from "@/lib/account-privacy-server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await exportClientAccount(session.user.id);
  if (!payload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": 'attachment; filename="meti-pilates-data.json"',
    },
  });
}
