import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" as const, status: 401 as const };
  }
  return { session };
}

/** Ensures the authenticated user matches the target userId (or bootstrap token). */
export async function requireSelfOrBootstrap(
  userId: string,
  bootstrapHeader: string | null
): Promise<
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { ok: false; error: string; status: 401 | 403 }
> {
  const bootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (
    bootstrapToken &&
    bootstrapHeader &&
    bootstrapHeader === bootstrapToken
  ) {
    const session = await getSession();
    if (session) return { ok: true, session };
    // Bootstrap token without session: only for automated first-admin setup
    return {
      ok: false,
      error: "Bootstrap requires an authenticated session for the target user",
      status: 401,
    };
  }

  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  if (session.user.id !== userId) {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  return { ok: true, session };
}
