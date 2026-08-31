"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { useAdminUsers } from "@/lib/hooks";
import { Search, Users, Mail } from "lucide-react";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleeFilter] = useState("all");

  const { data, isLoading } = useAdminUsers({
    role: roleFilter !== "all" ? roleFilter : undefined,
    search: searchQuery || undefined,
  });

  const users = data?.users || [];

  const totalClients = users.filter((u: any) => u.role === "client").length;
  const totalAdvisors = users.filter((u: any) => u.role === "advisor").length;

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          User Management
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Manage clients and advisors on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total users</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                  {users.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Clients</p>
                <p className="text-2xl font-heading font-bold text-[var(--accent)]">
                  {totalClients}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Advisors</p>
                <p className="text-2xl font-heading font-bold text-[var(--success)]">
                  {totalAdvisors}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                onClick={() => setRoleeFilter("all")}
              >
                All
              </Button>
              <Button
                variant={roleFilter === "client" ? "default" : "secondary"}
                size="sm"
                onClick={() => setRoleeFilter("client")}
              >
                Clients
              </Button>
              <Button
                variant={roleFilter === "advisor" ? "default" : "secondary"}
                size="sm"
                onClick={() => setRoleeFilter("advisor")}
              >
                Advisors
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {users.length} users found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No registered users"
              description="When users sign up on the platform, they will appear here."
            />
          ) : (
            <div className="space-y-4">
              {users.map((user: any) => (
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
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : user.role === "advisor"
                              ? "accent"
                              : "secondary"
                          }
                        >
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "advisor"
                            ? "Advisor"
                            : "Client"}
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
