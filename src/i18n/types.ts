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
  about: {
    title: string;
    intro: string;
    certificationsIntro: string;
    certifications: Array<{ name: string; detail: string }>;
    specialization: string;
    philosophyTitle: string;
    philosophyParagraph1: string;
    philosophyParagraph2: string;
    programIntro: string;
    programBenefits: string[];
    closingTitle: string;
    closingText: string;
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
    spotsLeft: string;
    slotFull: string;
    confirm: string;
    confirmSub: string;
    session: string;
    date: string;
    time: string;
    total: string;
    sessionPrice: string;
    reschedulePolicy: string;
    continuePayment: string;
    confirmBooking: string;
    processing: string;
    serviceNames: Record<string, string>;
  };
  auth: {
    welcomeBack: string;
    signInSubtitle: string;
    createAccount: string;
    createAccountSubtitle: string;
    continueGoogle: string;
    connecting: string;
    orDivider: string;
    email: string;
    password: string;
    fullName: string;
    passwordMin: string;
    signingIn: string;
    signIn: string;
    creatingAccount: string;
    createAccountBtn: string;
    googleError: string;
    googleSignUpError: string;
    emailError: string;
    signInError: string;
    signUpError: string;
    noAccount: string;
    signUpFree: string;
    hasAccount: string;
    backHome: string;
  };
  checkout: {
    title: string;
    titlePayment: string;
    signInToContinue: string;
    signInToContinueSub: string;
    guestContactTitle: string;
    guestContactSub: string;
    guestEmailRequired: string;
    guestEmailInvalid: string;
    optionalName: string;
    continueAsGuest: string;
    testModeTitle: string;
    testModeSub: string;
    paymentMethod: string;
    paymentUnavailable: string;
    paymentUnavailableSub: string;
    mercadoPago: string;
    mercadoPagoSub: string;
    securePayment: string;
    cancellationPolicy: string;
    cancelReschedule: string;
    cancelNoRefund: string;
    cancelNoShow: string;
    summary: string;
    total: string;
    includesCosts: string;
    signInToPay: string;
    pay: string;
    confirmBooking: string;
    bookingOnlyTitle: string;
    bookingOnlySub: string;
    bookingPolicy: string;
    bookingPolicyReschedule: string;
    bookingPolicyContact: string;
    payAtStudio: string;
    noBookingData: string;
    bookSession: string;
    errorCreateAppointment: string;
    min: string;
  };
  checkoutResult: {
    signInToView: string;
    noBookingInfo: string;
    bookingConfirmed: string;
    bookingConfirmedSub: string;
    paymentConfirmed: string;
    paymentConfirmedSub: string;
    goToDashboard: string;
    paymentFailed: string;
    paymentFailedSub: string;
    bookAgain: string;
    confirmingPayment: string;
    confirmingPaymentSub: string;
    stillPending: string;
    refreshStatus: string;
    toastConfirmedTitle: string;
    toastConfirmedSub: string;
  };
  dashboard: {
    dashboard: string;
    bookSession: string;
    myAppointments: string;
    myReviews: string;
    myProfile: string;
    client: string;
    signOut: string;
    loading: string;
  };
  language: {
    ariaLabel: string;
  };
  common: {
    hours: string;
    error: string;
    continue: string;
    processing: string;
  };
};
