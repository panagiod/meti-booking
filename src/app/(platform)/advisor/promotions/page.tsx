"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sileo } from "sileo";
import { Plus, Tag, Trash2, Percent, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(cents / 100);
}

export default function PromotionsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const dialog = useDialog();

  const { data, isLoading } = useQuery({
    queryKey: ["advisor-promotions"],
    queryFn: async () => { const r = await fetch("/api/advisor/promotions"); if (!r.ok) throw new Error(); return r.json(); },
  });

  const { data: servicesData } = useQuery({
    queryKey: ["advisor-services-for-promo"],
    queryFn: async () => { const r = await fetch("/api/advisor/services"); if (!r.ok) throw new Error(); return r.json(); },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch("/api/advisor/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["advisor-promotions"] }); sileo.success({ title: "Promoción creada", description: "La promoción está activa para tus clientes." }); setShowModal(false); },
    onError: (err: Error) => { sileo.error({ title: "Error", description: err.message || "No se pudo crear la promoción." }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/advisor/promotions/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["advisor-promotions"] }); sileo.success({ title: "Promoción eliminada" }); },
    onError: () => { sileo.error({ title: "Error", description: "No se pudo eliminar la promoción." }); },
  });

  const toggleActive = useMutation({
    mutationFn: async (promo: { id: string; isActive: boolean }) => {
      await fetch(`/api/advisor/promotions/${promo.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !promo.isActive }) });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["advisor-promotions"] }); },
  });

  if (isLoading) return <LoadingPage />;
  const promotions = data?.promotions || [];
  const services: Array<{ id: string; name: string; priceCents: number }> = servicesData?.services || [];
  const now = new Date();

  const getStatus = (p: { isActive: boolean; startAt: string; endAt: string }) => {
    if (!p.isActive) return { label: "Inactiva", color: "outline" as const };
    if (new Date(p.startAt) > now) return { label: "Programada", color: "secondary" as const };
    if (new Date(p.endAt) < now) return { label: "Expirada", color: "outline" as const };
    return { label: "Activa", color: "success" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">Promociones</h1>
          <p className="text-[var(--text-muted)] mt-1">Crea ofertas especiales para tus servicios</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nueva promoción
        </Button>
      </div>

      {promotions.length === 0 ? (
        <Card><CardContent className="p-12">
          <EmptyState icon={Tag} title="Sin promociones" description="Crea tu primera promoción para atraer más clientes con ofertas especiales."
            action={{ label: "Crear promoción", onClick: () => setShowModal(true) }} />
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promo: { id: string; name: string; service: { name: string }; discountType: string; discountValue: number; startAt: string; endAt: string; isActive: boolean }) => {
            const status = getStatus(promo);
            const isExpired = new Date(promo.endAt) < now;
            return (
              <Card key={promo.id} className={!promo.isActive || isExpired ? "opacity-60" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-[var(--text-primary)]">{promo.name}</h3>
                        <Badge variant={status.color}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">Servicio: {promo.service.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-[var(--primary)] font-semibold">
                          {promo.discountType === "percentage" ? <><Percent className="w-4 h-4" />{promo.discountValue}%</> : <>{formatCurrency(promo.discountValue * 100)}</>}
                        </span>
                        <span className="flex items-center gap-1 text-[var(--text-muted)]">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(promo.startAt), "d MMM", { locale: es })} – {format(new Date(promo.endAt), "d MMM, yyyy", { locale: es })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive.mutate({ id: promo.id, isActive: promo.isActive })} disabled={isExpired}>
                        {promo.isActive ? "Desactivar" : "Activar"}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-[var(--error)]" onClick={async () => {
                        const ok = await dialog.showConfirm("Eliminar promoción", `¿Estás seguro de eliminar "${promo.name}"? Esta acción no se puede deshacer.`, "warning");
                        if (ok) deleteMutation.mutate(promo.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <PromotionModal
          promotion={null}
          onClose={() => setShowModal(false)}
          onSubmit={(d) => createMutation.mutate(d)}
          isLoading={createMutation.isPending}
          services={services}
        />
      )}
      <AlertDialog state={dialog} />
    </div>
  );
}

function PromotionModal({ promotion, onClose, onSubmit, isLoading, services }: { promotion: Record<string, unknown> | null; onClose: () => void; onSubmit: (data: Record<string, unknown>) => void; isLoading: boolean; services: Array<{ id: string; name: string; priceCents: number }> }) {
  const [name, setName] = useState((promotion?.name as string) || "");
  const [serviceId, setServiceId] = useState((promotion?.serviceId as string) || "");
  const [discountType, setDiscountType] = useState((promotion?.discountType as string) || "percentage");
  const [discountValue, setDiscountValue] = useState((promotion?.discountValue as number) || 10);
  const [startAt, setStartAt] = useState((promotion?.startAt as string)?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [endAt, setEndAt] = useState((promotion?.endAt as string)?.slice(0, 10) || "");

  const serviceOptions = services.map(s => ({ value: s.id, label: `${s.name} — ${formatCurrency(s.priceCents)}` }));
  const discountTypeOptions = [
    { value: "percentage", label: "Porcentaje (%)" },
    { value: "fixed", label: "Monto fijo ($)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">Nueva promoción</h2>
          <Input placeholder="Nombre (ej. Black Friday)" value={name} onChange={e => setName(e.target.value)} />
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Servicio</label>
            <Select options={serviceOptions} value={serviceId} onChange={setServiceId} placeholder="Selecciona un servicio" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Tipo</label>
              <Select options={discountTypeOptions} value={discountType} onChange={setDiscountType} />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Valor</label>
              {discountType === "fixed" ? (
                <CurrencyInput value={discountValue} onChange={setDiscountValue} min={0} />
              ) : (
                <Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} min={0} max={100} />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Desde</label>
              <Input type="date" value={startAt} onChange={e => setStartAt(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Hasta</label>
              <Input type="date" value={endAt} onChange={e => setEndAt(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => onSubmit({ name, serviceId, discountType, discountValue, startAt: startAt + "T00:00:00", endAt: endAt + "T23:59:59" })} disabled={isLoading || !serviceId || !name}>
              {isLoading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
