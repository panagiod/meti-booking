import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import AdminShell from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await requireAdminSession();

  if ("error" in authResult) {
    redirect(authResult.status === 401 ? "/login" : "/dashboard");
  }

  return (
    <AdminShell
      user={{
        name: authResult.session.user.name,
        email: authResult.session.user.email,
        image: authResult.session.user.image,
      }}
    >
      {children}
    </AdminShell>
  );
}
