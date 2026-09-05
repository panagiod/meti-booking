"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { User, Mail, Save, Camera, X, Download, Trash2 } from "lucide-react";
import { loginUrl } from "@/lib/auth-redirect";
import { useTranslations } from "@/components/providers/locale-provider";

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.replace(loginUrl("/dashboard/profile"));
          return;
        }
        setUser(data.user);
        setName(data.user.name || "");
        setImage(data.user.image || "");
        try {
          const profileRes = await fetch("/api/client/profile", { credentials: "include" });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            setUser(profile.user);
            setName(profile.user?.name || data.user.name || "");
            setImage(profile.user?.image || data.user.image || "");
            setPhone(profile.user?.client?.phone || "");
          }
        } catch {
          // session data is enough to show the page
        }
      } catch (error) {
        router.replace(loginUrl("/dashboard/profile"));
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
        alert(data.error || t.dashboard.uploadError);
      }
    } catch (error) {
      alert(t.dashboard.connectionError);
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
        body: JSON.stringify({ name, image, phone }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        alert(t.dashboard.profileUpdated);
      } else {
        const data = await res.json();
        alert(data.error || t.dashboard.profileUpdateError);
      }
    } catch (error) {
      alert(t.dashboard.connectionError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/account/export", { credentials: "include" });
      if (!res.ok) {
        alert(t.dashboard.downloadError);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meti-pilates-data.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t.dashboard.downloadError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t.dashboard.deleteAccountConfirm)) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 409) {
        alert(t.dashboard.deleteAccountBlocked);
        return;
      }
      if (!res.ok) {
        alert(t.dashboard.deleteError);
        return;
      }
      await authClient.signOut();
      alert(t.dashboard.deleted);
      router.replace("/");
    } catch {
      alert(t.dashboard.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          {t.dashboard.profileTitle}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          {t.dashboard.profileSub}
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t.dashboard.personalInfo}
          </CardTitle>
          <CardDescription>
            {t.dashboard.personalInfoSub}
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
                {t.dashboard.profilePhoto}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {t.dashboard.photoHint}
              </p>
              {image && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm text-[var(--error)] hover:underline mt-1 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  {t.dashboard.removePhoto}
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {t.dashboard.nameLabel}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.dashboard.yourName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {t.dashboard.phoneOptional}
            </label>
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+357 95 000000"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              {t.dashboard.emailLabel}
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-secondary)]">{user.email}</span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? t.dashboard.saving : t.dashboard.saveChanges}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.privacyTitle}</CardTitle>
          <CardDescription>{t.dashboard.privacySub}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">{t.dashboard.deleteAccountSub}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={handleExport} disabled={isExporting || isDeleting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? t.dashboard.downloadingData : t.dashboard.downloadData}
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting || isExporting}
              className="text-[var(--error)]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? t.dashboard.deletingAccount : t.dashboard.deleteAccount}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
