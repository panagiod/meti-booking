"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { User, Mail, Save, Camera, X } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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
        setName(data.user.name || "");
        setImage(data.user.image || "");
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
      } else {
        const data = await res.json();
        alert(data.error || "Error al subir la imagen");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, image }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        alert("Perfil actualizado correctamente");
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar perfil");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Mi Perfil
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Administra tu información personal
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información personal
          </CardTitle>
          <CardDescription>
            Actualiza tu nombre y foto de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
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
                disabled={isUploading}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {isUploading ? (
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
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)]">
                Foto de perfil
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                JPEG, PNG o WebP (máx. 2MB)
              </p>
              {image && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm text-[var(--error)] hover:underline mt-1 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Eliminar foto
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Nombre
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-secondary)]">{user.email}</span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
