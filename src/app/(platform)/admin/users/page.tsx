"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { useAdminUsers } from "@/lib/hooks";
import {
  filterAdminUsers,
  normalizeAdminUserRole,
  summarizeAdminUsers,
  type AdminUserListItem,
} from "@/lib/admin-users";
import { Search, Users } from "lucide-react";

function roleLabel(role: string): string {
  const normalized = normalizeAdminUserRole(role);
  if (normalized === "admin") return "Admin";
  if (normalized === "instructor") return "Instructor";
  return "Client";
}

function roleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  const normalized = normalizeAdminUserRole(role);
  if (normalized === "admin") return "default";
  if (normalized === "instructor") return "outline";
  return "secondary";
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { data, isLoading } = useAdminUsers();

  const users = (data?.users || []) as AdminUserListItem[];
  const totals = summarizeAdminUsers(users);
  const visibleUsers = useMemo(
    () => filterAdminUsers(users, { role: roleFilter, search: searchQuery }),
    [users, roleFilter, searchQuery]
  );

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          User Management
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          People who have signed in or booked a session
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">Total users</p>
            <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
              {totals.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">Clients</p>
            <p className="text-2xl font-heading font-bold text-[var(--accent)]">
              {totals.clients}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">Admins</p>
            <p className="text-2xl font-heading font-bold text-[var(--success)]">
              {totals.admins}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === "all" ? "default" : "secondary"}
                size="sm"
                onClick={() => setRoleFilter("all")}
              >
                All
              </Button>
              <Button
                variant={roleFilter === "client" ? "default" : "secondary"}
                size="sm"
                onClick={() => setRoleFilter("client")}
              >
                Clients
              </Button>
              <Button
                variant={roleFilter === "admin" ? "default" : "secondary"}
                size="sm"
                onClick={() => setRoleFilter("admin")}
              >
                Admins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {visibleUsers.length} {visibleUsers.length === 1 ? "user" : "users"} found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visibleUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={users.length === 0 ? "No registered users" : "No matching users"}
              description={
                users.length === 0
                  ? "When users sign up or book a session, they will appear here."
                  : "Try a different search or filter. Totals above stay the same."
              }
            />
          ) : (
            <div className="space-y-4">
              {visibleUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--background)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-[var(--primary)]">
                        {user.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {user.name}
                        </h3>
                        <Badge variant={roleBadgeVariant(user.role)}>
                          {roleLabel(user.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-[var(--text-secondary)]">
                      {user.appointments} appointments
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
