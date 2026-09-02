import { NextResponse } from "next/server";
import { isAuthDatabaseAvailable } from "@/lib/auth-availability";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    googleOAuthEnabled: isGoogleOAuthConfigured(),
    registrationEnabled: isAuthDatabaseAvailable(),
  });
}
