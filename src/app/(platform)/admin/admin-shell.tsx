"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  Clock,
  Ban,
  LayoutTemplate,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/components/providers/locale-provider";

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AdminShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      label: t.admin.navStudio,
      items: [
        { name: t.admin.navOverview, href: "/admin", icon: LayoutDashboard },
        { name: t.admin.navBookings, href: "/admin/bookings", icon: ClipboardList },
        { name: t.admin.navClients, href: "/admin/users", icon: Users },
      ],
    },
    {
      label: t.admin.navCalendar,
      items: [
        { name: t.admin.navHours, href: "/admin/schedule", icon: Clock },
        { name: t.admin.navClosures, href: "/admin/closures", icon: Ban },
      ],
    },
    {
      label: t.admin.navSite,
      items: [{ name: t.admin.navWebsite, href: "/admin/content", icon: LayoutTemplate }],
    },
  ];

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--secondary)] text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-9 w-auto" />
            </Link>
            <button
              className="lg:hidden p-1 text-white/70 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-3 border-b border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-white/90">{t.admin.studioAdmin}</span>
            </div>
            <LanguageSwitcher tone="onDark" />
          </div>

          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {navigation.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = isNavActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-5 h-5",
                            isActive ? "text-[var(--accent)]" : "text-white/50"
                          )}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="font-medium text-white">
                    {user.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-white/50 truncate">{t.admin.roleAdmin}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.admin.signOut}
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
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
              <LanguageSwitcher className="border-[var(--border)]" />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
