"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Receipt, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(cents / 100);
}

export default function PaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["advisor-invoices"],
    queryFn: async () => {
      const r = await fetch("/api/advisor/invoices");
      if (!r.ok) throw new Error();
      return r.json();
    },
  });

  if (isLoading) return <LoadingPage />;

  const invoices = data?.invoices || [];
  const currentMonth = data?.currentMonth || { feesCents: 0, earningsCents: 0, appointmentCount: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Pagos</h1>
        <p className="text-[var(--text-muted)] mt-1">Ingresos y facturación de fees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Ingresos del mes</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                  {formatCurrency(currentMonth.earningsCents)}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {currentMonth.appointmentCount} asesorías
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[var(--success)]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Fee pendiente (mes actual)</p>
                <p className="text-2xl font-heading font-bold text-[var(--warning)]">
                  {formatCurrency(currentMonth.feesCents)}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Se factura al cierre del mes
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[var(--warning)]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-[var(--text-muted)]">Facturas</p>
            <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">{invoices.length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {invoices.filter((i: any) => i.status === "PENDING").length} pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Receipt}
              title="Sin facturas aún"
              description="Tus facturas de fees mensuales aparecerán aquí al cierre de cada mes."
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
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Período</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Asesorías</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Ingresos</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Fee</th>
                    <th className="px-4 py-3 font-medium text-[var(--text-muted)]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="text-[var(--text-primary)] font-medium capitalize">
                            {format(new Date(inv.periodStart), "MMMM yyyy", { locale: es })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{inv.appointmentCount}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{formatCurrency(inv.totalEarningsCents)}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--primary)]">{formatCurrency(inv.totalFeeCents)}</td>
                      <td className="px-4 py-3">
                        {inv.status === "PAID" ? (
                          <Badge variant="success">Pagada</Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
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
