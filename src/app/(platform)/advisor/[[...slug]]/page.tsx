import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { homePathForRole } from "@/lib/auth-redirect";

/** Legacy marketplace URLs. Signed-in users go home; everyone else books a session. */
export default async function AdvisorRedirectPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect(homePathForRole((session.user as { role?: string }).role));
  }
  redirect("/book");
}
