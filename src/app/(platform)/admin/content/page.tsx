"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import type { StudioContentData, StudioLocaleContent } from "@/lib/studio-content-types";
import { Save, Upload, ImageIcon, Type, Globe } from "lucide-react";

type Tab = "en" | "el" | "media";

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}

function LocaleFields({
  localeLabel,
  content,
  onChange,
}: {
  localeLabel: string;
  content: StudioLocaleContent;
  onChange: (next: StudioLocaleContent) => void;
}) {
  const update = <K extends keyof StudioLocaleContent>(
    section: K,
    field: keyof StudioLocaleContent[K],
    value: string
  ) => {
    onChange({
      ...content,
      [section]: { ...content[section], [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          SEO & browser tab ({localeLabel})
        </h3>
        <div className="space-y-3">
          <TextArea
            label="Page title"
            value={content.meta.title}
            onChange={(v) => update("meta", "title", v)}
            rows={2}
          />
          <TextArea
            label="Meta description"
            value={content.meta.description}
            onChange={(v) => update("meta", "description", v)}
            rows={3}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          Homepage hero ({localeLabel})
        </h3>
        <div className="space-y-3">
          <TextArea
            label="Eyebrow"
            value={content.hero.eyebrow}
            onChange={(v) => update("hero", "eyebrow", v)}
            rows={1}
          />
          <TextArea
            label="Headline"
            value={content.hero.title}
            onChange={(v) => update("hero", "title", v)}
            rows={2}
          />
          <TextArea
            label="Description"
            value={content.hero.description}
            onChange={(v) => update("hero", "description", v)}
            rows={4}
          />
          <TextArea
            label="Book button"
            value={content.hero.bookSession}
            onChange={(v) => update("hero", "bookSession", v)}
            rows={1}
          />
          <TextArea
            label="Hero image alt text"
            value={content.hero.imageAlt}
            onChange={(v) => update("hero", "imageAlt", v)}
            rows={2}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          About section ({localeLabel})
        </h3>
        <div className="space-y-3">
          <TextArea
            label="Section title"
            value={content.about.title}
            onChange={(v) => update("about", "title", v)}
            rows={2}
          />
          <TextArea
            label="Introduction"
            value={content.about.intro}
            onChange={(v) => update("about", "intro", v)}
            rows={5}
          />
          <TextArea
            label="Certifications intro"
            value={content.about.certificationsIntro}
            onChange={(v) => update("about", "certificationsIntro", v)}
            rows={3}
          />
          <TextArea
            label="Specialization paragraph"
            value={content.about.specialization}
            onChange={(v) => update("about", "specialization", v)}
            rows={3}
          />
          <TextArea
            label="Philosophy title"
            value={content.about.philosophyTitle}
            onChange={(v) => update("about", "philosophyTitle", v)}
            rows={2}
          />
          <TextArea
            label="Philosophy paragraph 1"
            value={content.about.philosophyParagraph1}
            onChange={(v) => update("about", "philosophyParagraph1", v)}
            rows={4}
          />
          <TextArea
            label="Philosophy paragraph 2"
            value={content.about.philosophyParagraph2}
            onChange={(v) => update("about", "philosophyParagraph2", v)}
            rows={4}
          />
          <TextArea
            label="Program intro"
            value={content.about.programIntro}
            onChange={(v) => update("about", "programIntro", v)}
            rows={2}
          />
          <TextArea
            label="Closing title"
            value={content.about.closingTitle}
            onChange={(v) => update("about", "closingTitle", v)}
            rows={2}
          />
          <TextArea
            label="Closing text"
            value={content.about.closingText}
            onChange={(v) => update("about", "closingText", v)}
            rows={3}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Hours line</h3>
        <TextArea
          label="Displayed under hero & footer"
          value={content.common.hours}
          onChange={(v) => update("common", "hours", v)}
          rows={1}
        />
      </div>
    </div>
  );
}

function ImageUploadCard({
  title,
  description,
  imageKey,
  currentUrl,
  onUploaded,
}: {
  title: string;
  description: string;
  imageKey: "hero" | "reformer";
  currentUrl: string;
  onUploaded: (url: string, savedContent: StudioContentData) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const dialog = useDialog();

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("imageKey", imageKey);
      formData.append("oldUrl", currentUrl);

      const res = await fetch("/api/admin/studio/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        dialog.showAlert("Upload failed", data.error || "Could not upload image", "error");
        return;
      }
      onUploaded(data.url, data.content);
      dialog.showAlert("Saved", `${title} image updated and saved`, "success");
    } catch {
      dialog.showAlert("Upload failed", "Connection error", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
          <Image src={currentUrl} alt={title} fill className="object-cover" unoptimized />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Replace image"}
        </Button>
      </CardContent>
      <AlertDialog state={dialog} />
    </Card>
  );
}

export default function AdminContentPage() {
  const dialog = useDialog();
  const [tab, setTab] = useState<Tab>("en");
  const [content, setContent] = useState<StudioContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/studio/content", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setContent(data.content);
      setHasChanges(false);
    } catch {
      dialog.showAlert("Error", "Could not load website content", "error");
    } finally {
      setIsLoading(false);
    }
  }, [dialog]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (!hasChanges) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasChanges]);

  const applyPersistedContent = (savedContent: StudioContentData) => {
    setContent(savedContent);
    setHasChanges(false);
  };

  const updateContent = (patch: Partial<StudioContentData>) => {
    setContent((prev) => (prev ? { ...prev, ...patch } : prev));
    setHasChanges(true);
  };

  const save = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/studio/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        dialog.showAlert("Error", data.error || "Could not save", "error");
        return;
      }
      setContent(data.content);
      setHasChanges(false);
      dialog.showAlert("Saved", "Website content updated", "success");
    } catch {
      dialog.showAlert("Error", "Connection error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !content) {
    return <LoadingPage label="Loading website content" />;
  }

  const tabs: { id: Tab; label: string; icon: typeof Globe }[] = [
    { id: "en", label: "English", icon: Type },
    { id: "el", label: "Greek (ΕΛ)", icon: Type },
    { id: "media", label: "Images & contact", icon: ImageIcon },
  ];

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
              Website content
            </h1>
            <p className="mt-1 text-[var(--text-muted)]">
              Edit homepage text, images, and contact details shown to customers
            </p>
          </div>
          <Button onClick={save} disabled={!hasChanges || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium transition",
                tab === item.id
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {tab === "en" && (
          <Card>
            <CardContent className="p-6">
              <LocaleFields
                localeLabel="English"
                content={content.contentEn}
                onChange={(contentEn) => updateContent({ contentEn })}
              />
            </CardContent>
          </Card>
        )}

        {tab === "el" && (
          <Card>
            <CardContent className="p-6">
              <LocaleFields
                localeLabel="Ελληνικά"
                content={content.contentEl}
                onChange={(contentEl) => updateContent({ contentEl })}
              />
            </CardContent>
          </Card>
        )}

        {tab === "media" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Studio details</CardTitle>
                <CardDescription>Shown in the header, footer, and contact links</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    Studio name
                  </label>
                  <Input
                    value={content.name}
                    onChange={(e) => updateContent({ name: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    Address / location
                  </label>
                  <Input
                    value={content.location}
                    onChange={(e) => updateContent({ location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    Phone
                  </label>
                  <Input
                    value={content.phone}
                    onChange={(e) => updateContent({ phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={content.email}
                    onChange={(e) => updateContent({ email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    Price from (€)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={content.sessionPriceFrom}
                    onChange={(e) =>
                      updateContent({ sessionPriceFrom: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <ImageUploadCard
                title="Hero image"
                description="Large image on the homepage (JPEG, PNG, or WebP, max 5MB)"
                imageKey="hero"
                currentUrl={content.heroImage}
                onUploaded={(_url, savedContent) => applyPersistedContent(savedContent)}
              />
              <ImageUploadCard
                title="Reformer image"
                description="Secondary studio photo (used if session cards are shown)"
                imageKey="reformer"
                currentUrl={content.reformerImage}
                onUploaded={(_url, savedContent) => applyPersistedContent(savedContent)}
              />
            </div>
          </div>
        )}
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}
