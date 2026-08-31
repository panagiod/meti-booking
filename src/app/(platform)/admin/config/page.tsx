"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Badge } from "@/components/ui/badge";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { Save, DollarSign, Percent, Settings, Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  minimumPriceCents: number;
  feePercentage: number;
  maxFeeCents: number;
  isActive: boolean;
}

export default function ConfigPage() {
  const dialog = useDialog();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // New category form
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMinPrice, setNewMinPrice] = useState(100);
  const [newFee, setNewFee] = useState(15);
  const [newMaxFee, setNewMaxFee] = useState(1000);
  const [newColor, setNewColor] = useState("#FF6B35");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = (id: string, field: keyof Category, value: any) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat))
    );
    setHasChanges(true);
  };

  const handleCreateCategory = async () => {
    if (!newName.trim()) {
      dialog.showAlert("Campo requerido", "El nombre del rubro es requerido.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newName,
          description: newDescription || null,
          minimumPriceCents: newMinPrice * 100,
          feePercentage: newFee,
          maxFeeCents: newMaxFee * 100,
          color: newColor,
        }),
      });

      if (res.ok) {
        await fetchCategories();
        setShowModal(false);
        resetForm();
        dialog.showAlert("Éxito", "Rubro creado correctamente.", "success");
      } else {
        const data = await res.json();
        dialog.showAlert("Error", data.error || "Error al crear rubro", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión. Intenta de nuevo.", "error");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const confirmed = await dialog.showConfirm(
      "Eliminar rubro",
      `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`,
      "warning"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        await fetchCategories();
        dialog.showAlert("Éxito", "Rubro eliminado correctamente.", "success");
      } else {
        const data = await res.json();
        dialog.showAlert("Error", data.error || "Error al eliminar", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error al eliminar. Intenta de nuevo.", "error");
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewDescription("");
    setNewMinPrice(100);
    setNewFee(15);
    setNewMaxFee(1000);
    setNewColor("#FF6B35");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categories }),
      });

      if (res.ok) {
        setHasChanges(false);
        dialog.showAlert("Éxito", "Configuración guardada correctamente.", "success");
      } else {
        dialog.showAlert("Error", "Error al guardar. Intenta de nuevo.", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión. Intenta de nuevo.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateExample = (priceCents: number, feePercentage: number, maxFeeCents: number) => {
    let fee = Math.round(priceCents * (feePercentage / 100));
    const appliedMax = fee > maxFeeCents;
    if (appliedMax) {
      fee = maxFeeCents;
    }
    return {
      advisor: priceCents,
      fee,
      total: priceCents + fee,
      appliedMax,
    };
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(cents);
  };

  if (isLoading) return <LoadingPage />;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
              Configuración de Rubros
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Configura el precio mínimo y comisión para cada rubro de asesoría
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo rubro
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>

        {/* Info */}
        <Card className="bg-[var(--accent-light)] border-[var(--accent)]">
          <CardContent className="p-4 flex items-start gap-3">
            <Settings className="w-5 h-5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[var(--text-primary)]">
              <p className="font-medium mb-1">Configuración por rubro</p>
              <p className="text-[var(--text-secondary)]">
                Cada rubro tiene su propio precio mínimo y porcentaje de comisión.
                Los asesores de cada rubro deben respetar estas configuraciones.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const example = calculateExample(50000, category.feePercentage, category.maxFeeCents);
            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color || "#e5e7eb" }}
                      >
                        <span className="text-white font-bold text-lg">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description && (
                          <CardDescription className="text-xs">
                            {category.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="text-[var(--error)] hover:text-[var(--error)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Minimum Price */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Precio mínimo
                      </label>
                      <div className="flex items-center gap-2">
                        <CurrencyInput value={Math.round(category.minimumPriceCents / 100)} onChange={(v) => handleUpdateCategory(category.id, "minimumPriceCents", v * 100)} className="w-40" min={100} />
                        <span className="text-sm text-[var(--text-muted)]">pesos</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Los asesores no pueden cobrar menos de esto
                      </p>
                    </div>

                    {/* Fee Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        <Percent className="w-4 h-4 inline mr-1" />
                        Fee de plataforma
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={category.feePercentage}
                          onChange={(e) =>
                            handleUpdateCategory(
                              category.id,
                              "feePercentage",
                              Number(e.target.value)
                            )
                          }
                          className="w-32"
                          min={0}
                          max={100}
                          step={0.5}
                        />
                        <span className="text-sm text-[var(--text-muted)]">%</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Porcentaje que se añade al precio del asesor
                      </p>
                    </div>

                    {/* Max Fee */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Fee máximo
                      </label>
                      <div className="flex items-center gap-2">
                        <CurrencyInput
                          value={Math.round(category.maxFeeCents / 100)}
                          onChange={(v) => handleUpdateCategory(category.id, "maxFeeCents", v * 100)}
                          className="w-40"
                          min={0}
                        />
                        <span className="text-sm text-[var(--text-muted)]">pesos</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Tope máximo del fee (si el % supera este valor)
                      </p>
                    </div>
                  </div>

                  {/* Example calculation */}
                  <div className="mt-4 p-3 rounded-lg bg-[var(--background)]">
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                      Ejemplo de cálculo (servicio de $50,000):
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">Precio del asesor:</span>
                      <span className="text-[var(--text-primary)]">
                        {formatCurrency(example.advisor)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Fee ({category.feePercentage}%){example.appliedMax ? ` → Máx: ${formatCurrency(category.maxFeeCents)}` : ""}:
                      </span>
                      <span className={example.appliedMax ? "text-[var(--warning)] font-medium" : "text-[var(--text-primary)]"}>
                        {formatCurrency(example.fee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t border-[var(--border)] mt-2 pt-2">
                      <span className="text-[var(--text-primary)]">Total cliente:</span>
                      <span className="text-[var(--primary)]">
                        {formatCurrency(example.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Create Category Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Nuevo rubro</CardTitle>
                <CardDescription>
                  Crea un nuevo rubro de asesoría
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Nombre *</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Nutrición, Ejercicio, Coaching..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Descripción</label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Breve descripción del rubro"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Precio mínimo ($)
                    </label>
                    <CurrencyInput value={newMinPrice} onChange={setNewMinPrice} min={100} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Fee plataforma (%)
                    </label>
                    <Input
                      type="number"
                      value={newFee}
                      onChange={(e) => setNewFee(Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Fee máximo ($)
                    </label>
                    <CurrencyInput value={newMaxFee} onChange={setNewMaxFee} min={0} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="p-3 rounded-lg bg-[var(--background)]">
                  <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                    Vista previa:
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: newColor }}
                    >
                      <span className="text-white font-bold text-sm">
                        {newName ? newName.charAt(0) : "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{newName || "Nombre del rubro"}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Mínimo: ${newMinPrice} · Fee: {newFee}% · Máx: ${newMaxFee}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCategory}>
                    Crear rubro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <AlertDialog state={dialog} />
    </>
  );
}
