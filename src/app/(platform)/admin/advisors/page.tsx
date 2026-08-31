"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useAdminAdvisors, useUpdateAdvisorStatus } from "@/lib/hooks";
import { Search, Briefcase, CheckCircle, XCircle, Clock, TestTube, MessageCircle } from "lucide-react";

export default function AdvisorsPage() {
  const dialog = useDialog();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch } = useAdminAdvisors({
    status: statusFilter,
    search: searchQuery || undefined,
  });

  const updateStatus = useUpdateAdvisorStatus();

  const advisors = data?.advisors || [];

  const getTimeElapsed = (joinDate: string) => {
    const now = new Date();
    const created = new Date(joinDate);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    return "Just registered";
  };

  const handleContactWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    const message = encodeURIComponent(`Hello ${name}, we are the Meti team. We want to help you set up your account.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleApprove = async (id: string, name: string) => {
    const confirmed = await dialog.showConfirm(
      "Approve advisor",
      `Are you sure you want to approve ${name}?`,
      "info"
    );

    if (confirmed) {
      updateStatus.mutate(
        { advisorId: id, action: "approve" },
        {
          onSuccess: () => {
            dialog.showAlert("Success", "Advisor approved successfully", "success");
            refetch();
          },
          onError: () => {
            dialog.showAlert("Error", "Failed to approve advisor", "error");
          },
        }
      );
    }
  };

  const handleReject = async (id: string, name: string) => {
    const confirmed = await dialog.showConfirm(
      "Reject advisor",
      `Are you sure you want to reject ${name}? They will be converted to a client.`,
      "warning"
    );

    if (confirmed) {
      updateStatus.mutate(
        { advisorId: id, action: "reject" },
        {
          onSuccess: () => {
            dialog.showAlert("Success", "Advisor rejected. They are now a client.", "success");
            refetch();
          },
          onError: () => {
            dialog.showAlert("Error", "Failed to reject advisor", "error");
          },
        }
      );
    }
  };

  const handleSuspend = async (id: string, name: string) => {
    const confirmed = await dialog.showConfirm(
      "Suspend advisor",
      `Are you sure you want to suspend ${name}?`,
      "warning"
    );

    if (confirmed) {
      updateStatus.mutate(
        { advisorId: id, action: "suspend" },
        {
          onSuccess: () => {
            dialog.showAlert("Success", "Advisor suspended", "success");
            refetch();
          },
          onError: () => {
            dialog.showAlert("Error", "Failed to suspend advisor", "error");
          },
        }
      );
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Advisor Management
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage professionals on the platform
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  placeholder="Search by name, email, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advisors List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {advisors.length} advisors found
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advisors.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No registered advisors"
                description="When professionals sign up and choose to become advisors, they will appear here."
              />
            ) : (
              <div className="space-y-4">
                {advisors.map((advisor: any) => (
                  <div
                    key={advisor.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--background)] ${advisor.mpMode === "TEST" ? "border-2 border-[var(--warning)]" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-[var(--primary)]">
                          {advisor.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)]">
                            {advisor.name}
                          </h3>
                          <Badge
                            variant={
                              advisor.status === "active" ? "success" : "warning"
                            }
                          >
                            {advisor.status === "active" ? "Active" : "Pending"}
                          </Badge>
                          {advisor.mpMode === "TEST" && (
                            <Badge variant="warning" className="flex items-center gap-1">
                              <TestTube className="w-3 h-3" />
                              Test mode · {getTimeElapsed(advisor.joinDate)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                          {advisor.speciality} • {advisor.email}
                        </p>
                        {advisor.mpMode === "TEST" && advisor.whatsappPhone && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[var(--text-muted)]">
                              📱 {advisor.whatsappPhone}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs text-[var(--success)]"
                              onClick={() => handleContactWhatsApp(advisor.whatsappPhone, advisor.name)}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Contactar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="text-[var(--text-secondary)]">
                        {advisor.services} services
                      </div>
                      <div className="text-[var(--text-secondary)]">
                        {advisor.appointments} appointments
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {advisor.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(advisor.id, advisor.name)}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(advisor.id, advisor.name)}
                            disabled={updateStatus.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSuspend(advisor.id, advisor.name)}
                          disabled={updateStatus.isPending}
                        >
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog state={dialog} />
    </>
  );
}
