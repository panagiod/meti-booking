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
import {
  formatMessage,
  useTranslations,
} from "@/components/providers/locale-provider";
import type { Messages } from "@/i18n";

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
  t,
}: {
  localeLabel: string;
  content: StudioLocaleContent;
  onChange: (next: StudioLocaleContent) => void;
  t: Messages["admin"];
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
          {formatMessage(t.seoTab, { locale: localeLabel })}
        </h3>
        <div className="space-y-3">
          <TextArea
            label={t.pageTitle}
            value={content.meta.title}
            onChange={(v) => update("meta", "title", v)}
            rows={2}
          />
          <TextArea
            label={t.metaDescription}
            value={content.meta.description}
            onChange={(v) => update("meta", "description", v)}
            rows={3}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          {formatMessage(t.heroSection, { locale: localeLabel })}
        </h3>
        <div className="space-y-3">
          <TextArea
            label={t.eyebrow}
            value={content.hero.eyebrow}
            onChange={(v) => update("hero", "eyebrow", v)}
            rows={1}
          />
          <TextArea
            label={t.headline}
            value={content.hero.title}
            onChange={(v) => update("hero", "title", v)}
            rows={2}
          />
          <TextArea
            label={t.description}
            value={content.hero.description}
            onChange={(v) => update("hero", "description", v)}
            rows={4}
          />
          <TextArea
            label={t.bookButton}
            value={content.hero.bookSession}
            onChange={(v) => update("hero", "bookSession", v)}
            rows={1}
          />
          <TextArea
            label={t.heroImageAlt}
            value={content.hero.imageAlt}
            onChange={(v) => update("hero", "imageAlt", v)}
            rows={2}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          {formatMessage(t.aboutSection, { locale: localeLabel })}
        </h3>
        <div className="space-y-3">
          <TextArea
            label={t.sectionTitle}
            value={content.about.title}
            onChange={(v) => update("about", "title", v)}
            rows={2}
          />
          <TextArea
            label={t.introduction}
            value={content.about.intro}
            onChange={(v) => update("about", "intro", v)}
            rows={5}
          />
          <TextArea
            label={t.certificationsIntro}
            value={content.about.certificationsIntro}
            onChange={(v) => update("about", "certificationsIntro", v)}
            rows={3}
          />
          <TextArea
            label={t.specialization}
            value={content.about.specialization}
            onChange={(v) => update("about", "specialization", v)}
            rows={3}
          />
          <TextArea
            label={t.philosophyTitle}
            value={content.about.philosophyTitle}
            onChange={(v) => update("about", "philosophyTitle", v)}
            rows={2}
          />
          <TextArea
            label={t.philosophy1}
            value={content.about.philosophyParagraph1}
            onChange={(v) => update("about", "philosophyParagraph1", v)}
            rows={4}
          />
          <TextArea
            label={t.philosophy2}
            value={content.about.philosophyParagraph2}
            onChange={(v) => update("about", "philosophyParagraph2", v)}
            rows={4}
          />
          <TextArea
            label={t.programIntro}
            value={content.about.programIntro}
            onChange={(v) => update("about", "programIntro", v)}
            rows={2}
          />
          <TextArea
            label={t.closingTitle}
            value={content.about.closingTitle}
            onChange={(v) => update("about", "closingTitle", v)}
            rows={2}
          />
          <TextArea
            label={t.closingText}
            value={content.about.closingText}
            onChange={(v) => update("about", "closingText", v)}
            rows={3}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{t.hoursLine}</h3>
        <TextArea
          label={t.hoursLineHint}
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
  const t = useTranslations();
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
        dialog.showAlert(t.admin.uploadFailed, data.error || t.admin.uploadFailed, "error");
        return;
      }
      onUploaded(data.url, data.content);
      dialog.showAlert(t.admin.saved, formatMessage(t.admin.imageUpdated, { title }), "success");
    } catch {
      dialog.showAlert(t.admin.uploadFailed, t.admin.connectionError, "error");
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
          {uploading ? t.admin.uploading : t.admin.replaceImage}
        </Button>
      </CardContent>
      <AlertDialog state={dialog} />
    </Card>
  );
}

export default function AdminContentPage() {
  const t = useTranslations();
  const dialog = useDialog();
  const { showAlert } = dialog;
  const [tab, setTab] = useState<Tab>("el");
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
      showAlert(t.common.error, t.admin.loadWebsiteError, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, t.admin.loadWebsiteError, t.common.error]);

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
        dialog.showAlert(t.common.error, data.error || t.admin.couldNotSave, "error");
        return;
      }
      setContent(data.content);
      setHasChanges(false);
      dialog.showAlert(t.admin.saved, t.admin.websiteUpdated, "success");
    } catch {
      dialog.showAlert(t.common.error, t.admin.connectionError, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !content) {
    return <LoadingPage label={t.admin.loadingWebsite} />;
  }

  const tabs: { id: Tab; label: string; icon: typeof Globe }[] = [
    { id: "en", label: t.admin.tabEnglish, icon: Type },
    { id: "el", label: t.admin.tabGreek, icon: Type },
    { id: "media", label: t.admin.tabMedia, icon: ImageIcon },
  ];

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
              {t.admin.websiteTitle}
            </h1>
            <p className="mt-1 text-[var(--text-muted)]">{t.admin.websiteSub}</p>
          </div>
          <Button onClick={save} disabled={!hasChanges || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t.admin.saving : t.admin.saveChanges}
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
                localeLabel={t.admin.tabEnglish}
                content={content.contentEn}
                onChange={(contentEn) => updateContent({ contentEn })}
                t={t.admin}
              />
            </CardContent>
          </Card>
        )}

        {tab === "el" && (
          <Card>
            <CardContent className="p-6">
              <LocaleFields
                localeLabel={t.admin.tabGreek}
                content={content.contentEl}
                onChange={(contentEl) => updateContent({ contentEl })}
                t={t.admin}
              />
            </CardContent>
          </Card>
        )}

        {tab === "media" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.admin.studioDetails}</CardTitle>
                <CardDescription>{t.admin.studioDetailsSub}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    {t.admin.studioName}
                  </label>
                  <Input
                    value={content.name}
                    onChange={(e) => updateContent({ name: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    {t.admin.addressEn}
                  </label>
                  <Input
                    value={content.location}
                    onChange={(e) => updateContent({ location: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    {t.admin.addressEl}
                  </label>
                  <Input
                    value={content.locationEl}
                    onChange={(e) => updateContent({ locationEl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    {t.admin.phone}
                  </label>
                  <Input
                    value={content.phone}
                    onChange={(e) => updateContent({ phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    {t.admin.email}
                  </label>
                  <Input
                    type="email"
                    value={content.email}
                    onChange={(e) => updateContent({ email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                    {t.admin.priceFrom}
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
                title={t.admin.heroImage}
                description={t.admin.heroImageHint}
                imageKey="hero"
                currentUrl={content.heroImage}
                onUploaded={(_url, savedContent) => applyPersistedContent(savedContent)}
              />
              <ImageUploadCard
                title={t.admin.reformerImage}
                description={t.admin.reformerImageHint}
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
