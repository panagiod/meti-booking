import { randomBytes } from "crypto";
import type { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthBaseURL } from "@/lib/auth-config";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function useSecureCookies(): boolean {
  return getAuthBaseURL().startsWith("https://");
}

/** Create a better-auth session so guest checkout can load and cancel the booking. */
export async function attachGuestSession(
  response: NextResponse,
  userId: string,
  request: Request
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000),
      ipAddress,
      userAgent: request.headers.get("user-agent"),
    },
  });

  const secure = useSecureCookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
    secure,
  };

  response.cookies.set("better-auth.session_token", token, options);
  if (secure) {
    response.cookies.set("__Secure-better-auth.session_token", token, options);
  }
}
