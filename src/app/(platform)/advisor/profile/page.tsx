"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useAdvisorProfile, useUpdateProfile } from "@/lib/hooks";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Save,
  Video,
  Pencil,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Phone,
  Camera,
  X,
} from "lucide-react";
import "lite-youtube-embed/src/lite-yt-embed.css";
import { sileo } from "sileo";

export default function ProfilePage() {
  const dialog = useDialog();
  const { data, isLoading } = useAdvisorProfile();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [bio, setBio] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documentType, setDocumentType] = useState("CERTIFICATE");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [bookingLeadHours, setBookingLeadHours] = useState(24);
  const [isHidden, setIsHidden] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  useEffect(() => {
    if (data?.profile) {
      setName(data.profile.user?.name || "");
      setImage(data.profile.user?.image || "");
      setBio(data.profile.bio || "");
      setVideoUrl(data.profile.videoUrl || "");
      setBookingLeadHours(data.profile.bookingLeadHours || 24);
      setIsHidden(data.profile.isHidden || false);
      setWhatsappPhone(data.profile.whatsappPhone || "");
      setSelectedCategoryIds((data.profile.categories || []).map((c: any) => c.id));
      fetchDocuments();
      fetchCategories();
    }
  }, [data]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setHasChanges(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (image) {
        formData.append("oldUrl", image);
      }

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImage(data.url);
        setHasChanges(true);
      } else {
        const data = await res.json();
        dialog.showAlert("Error", data.error || "Error al subir la imagen", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión", "error");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/advisor/documents", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const res = await fetch("/api/advisor/documents", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        await fetchDocuments();
        dialog.showAlert("Éxito", "Documento subido correctamente", "success");
      } else {
        const data = await res.json();
        dialog.showAlert("Error", data.error || "Error al subir documento", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    updateProfile.mutate(
      { name, image, bio, videoUrl: videoUrl || undefined, categoryIds: selectedCategoryIds, bookingLeadHours, whatsappPhone: whatsappPhone || undefined },
      {
        onSuccess: () => {
          setHasChanges(false);
          dialog.showAlert("Éxito", "Perfil actualizado correctamente", "success");
        },
        onError: () => {
          dialog.showAlert("Error", "Error al actualizar perfil", "error");
        },
      }
    );
  };

  const handleToggleVisibility = () => {
    const next = !isHidden;
    setIsHidden(next);
    updateProfile.mutate(
      { isHidden: next },
      {
        onSuccess: () => {
          sileo.success({
            title: next ? "Perfil oculto" : "Perfil visible",
            description: next
              ? "Ya no apareces en la lista pública de asesores."
              : "Tu perfil vuelve a aparecer en la lista pública de asesores.",
          });
        },
        onError: () => {
          setIsHidden(!next);
          sileo.error({ title: "Error", description: "No se pudo actualizar la visibilidad. Intenta de nuevo." });
        },
      }
    );
  };

  if (isLoading) return <LoadingPage />;

  const profile = data?.profile;
  const stats = data?.stats;

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">Error al cargar el perfil</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
              Mi Perfil
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Configura tu información pública para atraer clientes
            </p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || updateProfile.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateProfile.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Identidad, Bio, Stats y Agendado */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Editable Avatar */}
                  <div className="relative group flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-[var(--primary-light)] flex items-center justify-center overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-[var(--primary)]">
                          {name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Editable Name */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="Tu nombre"
                        className="font-heading text-xl font-bold"
                      />
                      <VerifiedBadge
                        isVerified={profile.isVerified}
                        verificationStatus={profile.verificationStatus}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <RatingStars rating={stats?.rating || 0} showValue size="sm" />
                      <span className="text-sm text-[var(--text-muted)]">
                        {stats?.reviewCount || 0} reseñas
                      </span>
                    </div>
                    {profile.categories && profile.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {profile.categories.map((cat: any) => (
                          <Badge key={cat.id} variant="secondary" className="text-xs">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {image && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs text-[var(--error)] hover:underline mt-2 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Eliminar foto
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="w-5 h-5" />
                  Biografía
                </CardTitle>
                <CardDescription>
                  Cuéntale a los clientes sobre tu experiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-40 px-4 py-3 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 resize-none"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Ej: Soy un profesional con X años de experiencia..."
                />
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-[var(--background)]">
                    <div className="text-2xl font-heading font-bold text-[var(--primary)]">
                      {stats?.reviewCount || 0}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Reseñas</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--background)]">
                    <div className="text-2xl font-heading font-bold text-[var(--accent)]">
                      {stats?.rating || 0}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Rating</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--background)]">
                    <div className="text-2xl font-heading font-bold text-[var(--success)]">
                      {profile.categories?.length || 0}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Rubros</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Configuración de agendado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--primary)]" />
                  Configuración de agendado
                </CardTitle>
                <CardDescription>
                  Define con cuánta anticipación mínima los clientes pueden reservar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={168}
                    value={bookingLeadHours}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setBookingLeadHours(0);
                      } else {
                        setBookingLeadHours(Math.max(0, Number(raw)));
                      }
                      setHasChanges(true);
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
                      setBookingLeadHours(Math.max(0, Number(e.target.value)));
                    }}
                    className="w-24 text-center"
                  />
                  <span className="text-sm text-[var(--text-muted)]">horas de anticipación</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3">
                  Ejemplo: si defines 6, los clientes no podrán reservar para las próximas 6 horas.
                  Con 0, pueden agendar cualquier horario disponible del día.
                </p>
              </CardContent>
            </Card>

            {/* Visibilidad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isHidden ? (
                    <EyeOff className="w-5 h-5 text-[var(--text-muted)]" />
                  ) : (
                    <Eye className="w-5 h-5 text-[var(--primary)]" />
                  )}
                  Visibilidad en el directorio
                </CardTitle>
                <CardDescription>
                  Controla si tu perfil aparece en la lista pública de asesores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {isHidden ? "Oculto del listado público" : "Visible en el listado público"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Al ocultarte, sigues activo y puedes atender tus citas, pero los
                      clientes no podrán encontrarte en el directorio.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleVisibility}
                    disabled={updateProfile.isPending}
                    aria-label="Cambiar visibilidad del perfil"
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${isHidden ? "bg-[var(--error)]" : "bg-[var(--success)]"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isHidden ? "left-6" : "left-0.5"}`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp (Contacto admin) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[var(--success)]" />
                  WhatsApp de contacto
                </CardTitle>
                <CardDescription>
                  Para comunicación con el equipo de Meti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhoneInput
                  value={whatsappPhone}
                  onChange={(val) => {
                    setWhatsappPhone(val);
                    setHasChanges(true);
                  }}
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Este número solo será visible por los administradores del sistema para contactarte en caso de inconvenientes con la configuración.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Rubros, Documentos y Video */}
          <div className="space-y-6">
            {/* Rubros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[var(--accent)]" />
                  Rubros de experticia
                </CardTitle>
                <CardDescription>
                  Selecciona las áreas en las que ofreces asesorías
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">Cargando rubros...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategoryIds.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${isSelected
                              ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50"
                            }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedCategoryIds.length === 0 && (
                  <p className="text-xs text-[var(--warning)] mt-3">
                    Selecciona al menos un rubro para que los clientes te encuentren por área.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentos de verificación
                </CardTitle>
                <CardDescription>
                  Sube certificados o licencias para verificar tu experiencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--primary)] transition-colors">
                  <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-muted)] mb-2">
                    Arrastra un archivo o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    PDF, JPEG o PNG (máx. 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="doc-upload"
                    onChange={handleUploadDocument}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => document.getElementById("doc-upload")?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Subiendo..." : "Seleccionar archivo"}
                  </Button>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Documentos ({documents.length})
                    </p>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)]"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            doc.manualStatus === "APPROVED"
                              ? "success"
                              : doc.manualStatus === "REJECTED"
                                ? "destructive"
                                : doc.aiStatus === "COMPLETED"
                                  ? "warning"
                                  : "outline"
                          }
                        >
                          {doc.manualStatus === "APPROVED"
                            ? "Aprobado"
                            : doc.manualStatus === "REJECTED"
                              ? "Rechazado"
                              : doc.aiStatus === "COMPLETED"
                                ? "Pendiente"
                                : "Analizando"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            

            {/* Video */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video de presentación
                </CardTitle>
                <CardDescription>
                  Un video corto aumenta las reservas un 300%
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videoUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden bg-[var(--background)]">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video de presentación"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoUrl("");
                          setHasChanges(true);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
                      <Video className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                      <p className="font-medium text-[var(--text-primary)] mb-1">
                        Sube tu video de presentación
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Pega una URL de YouTube
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        URL del video de YouTube
                      </label>
                      <Input
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}
