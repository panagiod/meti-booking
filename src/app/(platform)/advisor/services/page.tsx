"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
  useAdvisorServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/lib/hooks";
import { Plus, Briefcase, Clock, DollarSign, Edit, Trash2, Eye, EyeOff, AlertTriangle, Tag } from "lucide-react";
import { sileo } from "sileo";
import { formatCurrency } from "@/lib/utils";
function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export default function ServicesPage() {
  const dialog = useDialog();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useAdvisorServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const services = data?.services || [];
  const isActive = data?.isActive ?? true;

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await dialog.showConfirm(
      "Delete service",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      "warning"
    );

    if (confirmed) {
      setDeletingId(id);
      deleteService.mutate(id, {
        onSuccess: () => {
          sileo.success({ title: "Service deleted", description: `"${name}" was deleted successfully.` });
        },
        onError: () => {
          sileo.error({ title: "Error", description: "Could not delete service. Please try again." });
        },
        onSettled: () => {
          setDeletingId(null);
        },
      });
    }
  };

  const handleToggleActive = (service: any) => {
    updateService.mutate(
      { id: service.id, isActive: !service.isActive },
      {
        onSuccess: () => {
          sileo.success({
            title: service.isActive ? "Service deactivated" : "Service activated",
            description: service.isActive
              ? "Clients will no longer be able to book this service."
              : "Clients can now book this service.",
          });
        },
        onError: () => {
          sileo.error({ title: "Error", description: "Could not change service status." });
        },
      }
    );
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            My Services
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage the services you offer to your clients
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={!isActive}>
          <Plus className="w-4 h-4 mr-2" />
          New service
        </Button>
      </div>

      {/* Advisor inactive warning */}
      {!isActive && (
        <Card className="border-[var(--warning)] bg-[var(--warning-light)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0" />
              <p className="text-sm text-[var(--text-primary)]">
                <strong>Your advisor account is pending approval.</strong> You will not be able to create services or receive clients until an administrator verifies your profile and documents.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Briefcase}
              title={isActive ? "No services created yet" : "Services unavailable"}
              description={isActive
                ? "Create your first service so clients can book consultations with you."
                : "You need to be approved by an administrator before creating services."
              }
              action={isActive ? {
                label: "Create first service",
                onClick: () => setShowModal(true),
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service: any) => (
            <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-heading font-semibold text-lg text-[var(--text-primary)]">
                        {service.name}
                      </h3>
                      <Badge variant={service.isActive ? "success" : "outline"}>
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-sm text-[var(--text-muted)] mb-3">
                        {service.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Clock className="w-4 h-4" />
                        {formatDuration(service.durationMin)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(service.priceCents)} your earnings
                      </div>
                      {service.category && (
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Tag className="w-4 h-4" />
                          {service.category.name} ({service.category.feePercentage}%, Max: {formatCurrency(service.category.maxFeeCents)})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(service)}
                    >
                      {service.isActive ? (
                        <Eye className="w-4 h-4 text-[var(--success)]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingService(service);
                        setShowModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(service.id, service.name)}
                      disabled={deletingId === service.id}
                      className="text-[var(--error)] hover:text-[var(--error)]"
                    >
                      {deletingId === service.id ? (
                        <div className="w-4 h-4 border-2 border-[var(--error)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">
                      Endal price for client
                    </span>
                    <span className="font-heading font-bold text-[var(--text-primary)]">
                      {formatCurrency(
                        service.priceCents + Math.round(service.priceCents * ((service.category?.feePercentage || 15) / 100))
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setShowModal(false);
            setEditingService(null);
          }}
          onSubmit={(data) => {
            if (editingService) {
              updateService.mutate(data, {
                onSuccess: () => {
                  sileo.success({ title: "Service updated", description: "Changes were saved successfully." });
                  setShowModal(false);
                  setEditingService(null);
                },
                onError: (err: any) => {
                  sileo.error({ title: "Error", description: err.message || "Could not update service." });
                },
              });
            } else {
              createService.mutate(data, {
                onSuccess: () => {
                  sileo.success({ title: "Service created", description: "Your new service is now available to clients." });
                  setShowModal(false);
                  setEditingService(null);
                },
                onError: (err: any) => {
                  sileo.error({ title: "Error", description: err.message || "Could not create service." });
                },
              });
            }
          }}
          isLoading={createService.isPending || updateService.isPending}
        />
      )}
      <AlertDialog state={dialog} />
    </div>
  );
}

function ServiceModal({
  service,
  onClose,
  onSubmit,
  isLoading,
}: {
  service: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [categoryId, setCategoryId] = useState(service?.categoryId || "");
  const [duration, setDuration] = useState(service?.durationMin || 60);
  const [price, setPrice] = useState(service ? service.priceCents / 100 : 50);
  const [rescheduleHours, setRescheduleHours] = useState(service?.rescheduleHoursMin || 24);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch advisor's categories on mount
  useState(() => {
    fetch("/api/advisor/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.profile?.categories || []);
      })
      .catch(() => {});
  });

  // Get selected category details
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const feePercentage = selectedCategory?.feePercentage || 15;
  const minimumPriceCents = selectedCategory?.minimumPriceCents || 10000;
  const minimumPriceDollars = minimumPriceCents / 100;
  const maxFeeCents = selectedCategory?.maxFeeCents || 100000;

  // Calculate price breakdown
  const priceCents = price * 100;
  let platformFee = Math.round(priceCents * (feePercentage / 100));
  const appliedMaxFee = platformFee > maxFeeCents;
  if (appliedMaxFee) {
    platformFee = maxFeeCents;
  }
  const totalForClient = priceCents + platformFee;

  // Category options for Select
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: `${cat.name} (Fee: ${cat.feePercentage}%, Max: ${formatCurrency(cat.maxFeeCents)})`,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: service?.id,
      name,
      description: description || undefined,
      categoryId: categoryId || undefined,
      durationMin: duration,
      priceCents: price * 100,
      rescheduleHoursMin: rescheduleHours,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-bold mb-4">
            {service ? "Edit service" : "New service"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Service name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Consulta General"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Category *
              </label>
              <Select
                options={categoryOptions}
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Select a category"
              />
              {selectedCategory && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Platform fee: {feePercentage}% • Max fee: {formatCurrency(maxFeeCents)} • Minimum price: {formatCurrency(minimumPriceCents)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Description
              </label>
              <textarea
                className="w-full h-20 px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this service includes..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Duration (minutes) *
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={15}
                  max={480}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Your earnings ($) *
                </label>
                <CurrencyInput
                  value={price}
                  onChange={setPrice}
                  min={minimumPriceDollars}
                  required
                />
                {price < minimumPriceDollars && (
                  <p className="text-xs text-[var(--error)] mt-1">
                    The minimum price for this category is {formatCurrency(minimumPriceCents)}
                  </p>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background)] text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Your earnings:</span>
                <span className="font-medium">{formatCurrency(priceCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">
                  Fee ({feePercentage}%){appliedMaxFee ? ` → Max: ${formatCurrency(maxFeeCents)}` : ""}:
                </span>
                <span className={appliedMaxFee ? "font-medium text-[var(--warning)]" : "font-medium"}>
                  {formatCurrency(platformFee)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Endal client price:</span>
                <span className="font-bold text-[var(--primary)]">{formatCurrency(totalForClient)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Minimum reschedule notice (hours before)
              </label>
              <Input
                type="number"
                value={rescheduleHours}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setRescheduleHours(0);
                  } else {
                    setRescheduleHours(Math.max(0, Number(raw)));
                  }
                }}
                onKeyDown={(e) => {
                  const input = e.target as HTMLInputElement;
                  const isDigit = e.key >= "0" && e.key <= "9";
                  const isControl = e.key === "Backspace" || e.key === "Delete";
                  if ((isDigit || isControl) && input.value === "0") {
                    e.preventDefault();
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                      window.HTMLInputElement.prototype, "value"
                    )?.set;
                    nativeInputValueSetter?.call(input, isDigit ? e.key : "");
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                  }
                }}
                onBlur={(e) => {
                  setRescheduleHours(Math.max(0, Number(e.target.value)));
                }}
                min={0}
                max={168}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || price < minimumPriceDollars}>
                {isLoading ? "Saving..." : service ? "Save changes" : "Create service"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
