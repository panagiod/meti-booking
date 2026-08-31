import { NextResponse } from "next/server";

/** Reject cron calls when secret is missing (production) or header mismatches. */
export function requireCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Cron not configured (CRON_SECRET required)" },
        { status: 503 }
      );
    }
    return null;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
