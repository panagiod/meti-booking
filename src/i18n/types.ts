export type Locale = "en" | "el";

export const locales: Locale[] = ["en", "el"];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "flow-locale";

export type Messages = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    sessions: string;
    signIn: string;
    account: string;
    bookNow: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    bookSession: string;
    viewSessions: string;
    imageAlt: string;
  };
  sessions: {
    label: string;
    title: string;
    subtitle: string;
    mostPopular: string;
    book: string;
    fromPrice: string;
    readyTitle: string;
    readySubtitle: string;
    types: Record<
      string,
      { name: string; description: string; duration: string }
    >;
  };
  footer: {
    book: string;
    contact: string;
  };
  book: {
    back: string;
    studioUnavailable: string;
    scheduleError: string;
    loadError: string;
  };
  booking: {
    stepOf: string;
    steps: { service: string; date: string; time: string; summary: string };
    selectSession: string;
    selectSessionSub: string;
    pickDate: string;
    pickDateSub: string;
    pickTime: string;
    noSlots: string;
    confirm: string;
    confirmSub: string;
    session: string;
    date: string;
    time: string;
    total: string;
    reschedulePolicy: string;
    continuePayment: string;
    processing: string;
    serviceNames: Record<string, string>;
  };
  common: {
    hours: string;
  };
};
