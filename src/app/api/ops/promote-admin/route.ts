import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminPromoteError,
  isAdminPromoteTokenValid,
  promoteUserToAdmin,
} from "@/lib/admin-promote";

export const dynamic = "force-dynamic";

const promoteSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

/**
 * Token-authenticated endpoint (not a session cookie) so CI can promote a
 * user to ADMIN without SSH access. Protect with ADMIN_PROMOTE_TOKEN on the
 * server and the same value in the ADMIN_PROMOTE_TOKEN GitHub secret.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = promoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "email and token are required" }, { status: 400 });
    }

    const { email, token } = parsed.data;

    if (!isAdminPromoteTokenValid(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await promoteUserToAdmin(email);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof AdminPromoteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[ops/promote-admin] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
