"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Calendar,
  User,
  Star,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { LoadingPage } from "@/components/ui/loading";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Explorar Asesores",
    href: "/services",
    icon: Search,
  },
  {
    name: "Mis Citas",
    href: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    name: "Mis Reseñas",
    href: "/dashboard/reviews",
    icon: Star,
  },
  {
    name: "Mi Perfil",
    href: "/dashboard/profile",
    icon: User,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.push("/login");
          return;
        }
        setUser(data.user);
        // Verificar rol: cliente puede estar en dashboard
        const role = (data.user as any).role;
        if (role === "ADMIN") {
          router.push("/admin");
          return;
        }
        if (role === "ADVISOR") {
          router.push("/advisor");
          return;
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--surface)] border-r border-[var(--border)] transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-9 w-auto" />
            </Link>
            <button
              className="lg:hidden p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--primary-light)] text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 mb-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                  <span className="font-medium text-[var(--primary)]">
                    {user.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">Cliente</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-[var(--text-muted)] hover:text-[var(--error)]"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--surface)]/80 backdrop-blur-lg border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-full px-4">
            <button
              className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
