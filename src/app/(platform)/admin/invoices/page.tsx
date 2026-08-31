"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sileo } from "sileo";
import { Send, FileText, CheckCircle2, Receipt } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data, isLoading } = useQuery({
    queryKey: ["admin-invoices", month],
    queryFn: async () => {
      const r = await fetch(`/api/admin/invoices?month=${month}`);
      if (!r.ok) throw new Error();
      return r.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/admin/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      if (!r.ok) throw new Error();
      return r.json();
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      sileo.success({ title: "Invoices generated", description: `${res.creators || res.created} created, ${res.updated} updated for ${res.month}.` });
    },
    onError: () => sileo.error({ title: "Error", description: "Could not generate invoices." }),
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await fetch(`/api/admin/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      sileo.success({ title: "Invoice updated" });
    },
  });

  if (isLoading) return <LoadingPage />;

  const invoices = data?.invoices || [];
  const pendingFee = data?.stats?.totalPendingFeeCents || 0;

  // Month options (last 6)
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { value: val, label: format(new Date(d.getFullYear(), d.getMonth(), 1), "MMMM yyyy", { locale: enUS }) };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Billing</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage fee invoices for advisors</p>
        </div>
        <div className="flex items-center gap-3">
          <Select options={monthOptions} value={month} onChange={setMonth} />
          <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
            <Send className="w-4 h-4 mr-2" />
            {generateMutation.isPending ? "Generating..." : "Generate invoices"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">Fees pending ({month})</p>
            <p className="text-2xl font-heading font-bold text-[var(--warning)]">{formatCurrency(pendingFee)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">Invoices this month</p>
            <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">Pagadas</p>
            <p className="text-2xl font-heading font-bold text-[var(--success)]">
              {invoices.filter((i: any) => i.status === "PAID").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Receipt}
              title="No invoices for this month"
              description="Generate invoices to calculate each advisor's pending fees."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Advisor</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Period</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Appointments</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Revenue</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Fee due</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Estado</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--text-primary)]">{inv.advisorName}</p>
                        <p className="text-xs text-[var(--text-muted)]">{inv.advisorEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {format(new Date(inv.periodStart), "MMM yyyy", { locale: enUS })}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{inv.appointmentCount}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{formatCurrency(inv.totalEarningsCents)}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--primary)]">{formatCurrency(inv.totalFeeCents)}</td>
                      <td className="px-4 py-3">
                        {inv.status === "PAID" ? (
                          <Badge variant="success">Pagada</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {inv.status === "PENDING" ? (
                          <Button size="sm" variant="secondary" onClick={() => markPaidMutation.mutate({ id: inv.id, status: "PAID" })}>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Marcar pagada
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => markPaidMutation.mutate({ id: inv.id, status: "PENDING" })}>
                            Reabrir
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
