"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { getPendingBooking } from "@/lib/booking-utils";
import {
  Shield,
  User,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Check,
} from "lucide-react";

type Step = "role" | "categories" | "documents" | "pending";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const dialog = useDialog();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<Step>("role");
  const [hasAdmins, setHasAdmins] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Form data
  const [bio, setBio] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState("CERTIFICATE");

  // Loading states
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.push("/login");
          return;
        }
        setUser(data.user);

        // Check for pending booking FIRST
        const pendingBooking = localStorage.getItem("meti-pending-booking");
        if (pendingBooking) {
          try {
            const bookingData = JSON.parse(pendingBooking);
            // Validate booking data has required fields
            if (bookingData.advisorId && bookingData.serviceId) {
              localStorage.removeItem("meti-pending-booking");
              const params = new URLSearchParams(bookingData);
              router.push(`/checkout?${params.toString()}`);
              return;
            }
          } catch (e) {
            // Invalid data, clear it
            localStorage.removeItem("meti-pending-booking");
          }
        }

        const userWithRole = data.user as any;

        // Si no hay ningún admin, mostrar onboarding siempre
        // para que el primer usuario pueda elegir ser admin
        try {
          const adminRes = await fetch("/api/admin/setup");
          const { hasAdmins } = await adminRes.json();
          if (!hasAdmins) {
            setIsLoading(false);
            return; // Mostrar onboarding
          }
        } catch {}

        // Si ya hay admins y el usuario tiene rol, redirigir al panel correspondiente
        if (userWithRole.role) {
          switch (userWithRole.role) {
            case "ADMIN":
              router.push("/admin");
              break;
            case "ADVISOR":
              router.push("/advisor");
              break;
            case "CLIENT":
              router.push("/dashboard");
              break;
            default:
              router.push("/dashboard");
          }
          return;
        }

        // Only show onboarding if user has no role (new user)
        const res = await fetch("/api/admin/setup");
        const { hasAdmins: adminsExist } = await res.json();
        setHasAdmins(adminsExist);

        // Fetch categories
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        setIsLoading(false);
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBecomeAdmin = async () => {
    setIsSettingUp(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        router.push("/admin");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión. Intenta de nuevo.", "error");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleBecomeClient = async () => {
    setIsSettingUp(true);
    try {
      const res = await fetch("/api/client/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión. Intenta de nuevo.", "error");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleCategoriesSubmit = () => {
    if (selectedCategories.length === 0) {
      dialog.showAlert(
        "Selección requerida",
        "Por favor selecciona al menos un rubro de experticia.",
        "warning"
      );
      return;
    }
    setStep("documents");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleDocumentsSubmit = async () => {
    if (documents.length === 0) {
      dialog.showAlert(
        "Documentos requeridos",
        "Por favor carga al menos un documento de verificación.",
        "warning"
      );
      return;
    }

    setIsUploading(true);
    try {
      // Create advisor profile with categories
      const setupRes = await fetch("/api/advisor/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bio,
          categoryIds: selectedCategories,
        }),
      });

      if (!setupRes.ok) {
        throw new Error("Error creating advisor profile");
      }

      // Upload documents
      for (const doc of documents) {
        const formData = new FormData();
        formData.append("file", doc);
        formData.append("documentType", documentType);

        await fetch("/api/advisor/documents", {
          method: "POST",
          body: formData,
        });
      }

      setStep("pending");
    } catch (error) {
      dialog.showAlert(
        "Error",
        "Error al enviar documentos. Intenta de nuevo.",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return null;

  // Pending verification screen
  if (step === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--warning-light)] flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[var(--warning)]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
              ¡Solicitud enviada!
            </h2>
            <p className="text-[var(--text-muted)] mb-4">
              Tu perfil y documentos están siendo revisados. Te notificaremos cuando sea aprobado.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Mientras tanto, puedes explorar la plataforma como cliente.
            </p>
            <Button className="mt-6" onClick={() => router.push("/advisor")}>
              Ir al Panel de Asesor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Documents step
  if (step === "documents") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => setStep("categories")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Button>
            <CardTitle className="text-center mt-8">Documentos de verificación</CardTitle>
            <CardDescription className="text-center">
              Carga documentos que acrediten tu experiencia profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de documento</label>
              <Select
                value={documentType}
                onChange={(value) => setDocumentType(value)}
                options={[
                  { value: "CERTIFICATE", label: "Certificado profesional" },
                  { value: "LICENSE", label: "Licencia profesional" },
                  { value: "DEGREE", label: "Título universitario" },
                  { value: "RESUME", label: "Hoja de vida / CV" },
                  { value: "OTHER", label: "Otro documento" },
                ]}
              />
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-muted)] mb-2">
                Arrastra archivos o haz clic para seleccionar
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                PDF, JPEG, PNG o WebP (máx. 10MB cada uno)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Seleccionar archivos
              </Button>
            </div>

            {/* Uploaded Files */}
            {documents.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Archivos seleccionados:</p>
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[var(--background)] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => removeDocument(index)}
                      className="text-[var(--error)] hover:text-[var(--error-dark)]"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleDocumentsSubmit}
              disabled={documents.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar para verificación
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Categories step
  if (step === "categories") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => setStep("role")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Button>
            <CardTitle className="text-center mt-8">Tus áreas de experticia</CardTitle>
            <CardDescription className="text-center">
              Selecciona los rubros en los que tienes experiencia (puedes elegir varios)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected count */}
            <div className="text-center">
              <Badge variant={selectedCategories.length > 0 ? "default" : "outline"}>
                {selectedCategories.length} seleccionados
              </Badge>
            </div>

            {/* Categories grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-[var(--text-primary)]">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">Biografía (opcional)</label>
              <textarea
                className="w-full h-24 px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none"
                placeholder="Cuéntanos sobre tu experiencia..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleCategoriesSubmit}
              disabled={selectedCategories.length === 0}
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Role selection step
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[var(--primary)]">M</span>
            </div>
            <CardTitle className="text-2xl font-heading">
              ¡Bienvenido a Meti!
            </CardTitle>
            <CardDescription>
              Hola {user.name}, ¿qué quieres hacer en Meti?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Option: Advisor */}
            <button
              onClick={() => setStep("categories")}
              disabled={isSettingUp}
              className="w-full p-4 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-light)] hover:bg-[var(--accent)]/10 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-[var(--text-primary)]">
                    Ser Asesor
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Ofrece tus servicios profesionales. Requiere verificación de documentos.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--accent)] mt-1" />
              </div>
            </button>

            {/* Option: Client — default */}
            <button
              onClick={() => router.push("/dashboard")}
              disabled={isSettingUp}
              className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--secondary)] transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--secondary)]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-[var(--secondary)] dark:text-[var(--text-primary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-[var(--text-primary)]">
                    Cliente
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Busca y agenda asesorías con profesionales.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
      <AlertDialog state={dialog} />
    </>
  );
}
