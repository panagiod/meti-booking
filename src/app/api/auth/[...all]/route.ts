import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { isAuthDatabaseAvailable } from "@/lib/auth-availability";

const handler = toNextJsHandler(auth);

function authUnavailableResponse() {
  return NextResponse.json(
    {
      message: "Account sign-in and registration require a database connection.",
      code: "AUTH_UNAVAILABLE",
    },
    { status: 503 }
  );
}

function requiresDatabase(url: string): boolean {
  return /sign-up|sign-in|callback|get-session|session/.test(url);
}

export async function GET(request: NextRequest) {
  if (!isAuthDatabaseAvailable() && requiresDatabase(request.url)) {
    return authUnavailableResponse();
  }
  return handler.GET(request);
}

export async function POST(request: NextRequest) {
  if (!isAuthDatabaseAvailable() && requiresDatabase(request.url)) {
    return authUnavailableResponse();
  }
  return handler.POST(request);
}
