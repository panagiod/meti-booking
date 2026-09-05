"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultLocale,
  getMessages,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
  type Messages,
} from "@/i18n";
import {
  buildDefaultStudioContent,
  mergeMessages,
  localeContentFromStudio,
  studioBranding,
} from "@/lib/studio-content";
import type { StudioContentData } from "@/lib/studio-content-types";

export type StudioBranding = ReturnType<typeof studioBranding>;

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  studio: StudioBranding;
  contentLoaded: boolean;
  refreshStudioContent: () => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return defaultLocale;
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("el")) return "el";
  return defaultLocale;
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];
  if (fromCookie && isLocale(fromCookie)) return fromCookie;
  const fromStorage = localStorage.getItem(LOCALE_COOKIE);
  if (fromStorage && isLocale(fromStorage)) return fromStorage;
  return detectBrowserLocale();
}

function applyDocumentLocale(locale: Locale) {
  const root = document.documentElement;
  root.lang = locale;
  root.dir = "ltr";
  root.classList.toggle("locale-el", locale === "el");
}

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
  localStorage.setItem(LOCALE_COOKIE, locale);
  applyDocumentLocale(locale);
}

const defaultContent = buildDefaultStudioContent();
const defaultBranding = studioBranding(defaultContent);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [ready, setReady] = useState(false);
  const [studioContent, setStudioContent] = useState<StudioContentData>(defaultContent);
  const [contentLoaded, setContentLoaded] = useState(false);

  const loadStudioContent = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/content", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setStudioContent({
        ...defaultContent,
        name: data.branding.name,
        location: data.branding.location,
        locationEl: data.branding.locationEl ?? defaultContent.locationEl,
        phone: data.branding.phone,
        email: data.branding.email,
        heroImage: data.branding.images.hero,
        reformerImage: data.branding.images.reformer,
        sessionPriceFrom: data.branding.sessionPriceFrom,
        contentEn: data.contentEn,
        contentEl: data.contentEl,
      });
    } catch (error) {
      console.error("Failed to load studio content:", error);
    } finally {
      setContentLoaded(true);
    }
  }, []);

  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleState(stored);
    applyDocumentLocale(stored);
    setReady(true);
    loadStudioContent();
  }, [loadStudioContent]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const messages = useMemo(() => {
    const base = getMessages(locale);
    const overrides = localeContentFromStudio(studioContent, locale);
    return mergeMessages(base, overrides);
  }, [locale, studioContent]);

  const studio = useMemo(() => studioBranding(studioContent, locale), [studioContent, locale]);

  const value = useMemo(
    () => ({
      locale,
      messages,
      setLocale,
      studio,
      contentLoaded,
      refreshStudioContent: loadStudioContent,
    }),
    [locale, messages, setLocale, studio, contentLoaded, loadStudioContent]
  );

  if (!ready) {
    return <div className="studio min-h-screen bg-[var(--studio-bg)]" />;
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslations() {
  return useLocale().messages;
}

export function useStudioBranding() {
  return useLocale().studio;
}

export function formatMessage(
  template: string,
  vars: Record<string, string | number>
) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}
