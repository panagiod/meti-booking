"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { Calendar, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { loginUrl } from "@/lib/auth-redirect";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.replace(loginUrl("/dashboard"));
          return;
        }
        let role = (data.user as { role?: string }).role;
        if (role !== "ADMIN") {
          try {
            const claim = await fetch("/api/admin/claim", {
              method: "POST",
              credentials: "include",
            });
            if (claim.ok) {
              const body = (await claim.json()) as { role?: string };
              if (body.role) role = body.role;
            }
          } catch {
            // Stay on the client dashboard
          }
        }
        if (role === "ADMIN") {
          router.replace("/admin");
          return;
        }
        setUser(data.user);
      } catch {
        router.replace(loginUrl("/dashboard"));
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) return <LoadingPage />;

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Hello, {user.name?.split(" ")[0]}!
        </h1>
        <p className="text-[var(--text-muted)] mt-1">Welcome to your bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/book">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-1">
                    Book a session
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Choose a date and time for reformer pilates
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/appointments">
          <Card className="hover:shadow-lg transition-all cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-1">
                    My bookings
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    View or cancel upcoming sessions
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <dt className="text-sm text-[var(--text-muted)]">Name</dt>
              <dd className="text-sm font-medium text-[var(--text-primary)]">{user.name}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-sm text-[var(--text-muted)]">Email</dt>
              <dd className="text-sm font-medium text-[var(--text-primary)]">{user.email}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
