import type { Messages } from "../types";

const en: Messages = {
  meta: {
    title: "Flow Pilates — Book Pilates Sessions Online",
    description:
      "Small-group reformer and mat classes. Book online, show up, move well.",
  },
  nav: {
    sessions: "Sessions",
    signIn: "Sign in",
    account: "Account",
    bookNow: "Book now",
  },
  hero: {
    eyebrow: "Reformer · Mat · Private",
    title: "Pilates, booked beautifully.",
    description:
      "Small-group reformer and mat classes. Book online, show up, move well.",
    bookSession: "Book a session",
    viewSessions: "View sessions",
    imageAlt: "Woman on a reformer pilates machine in a bright studio",
  },
  sessions: {
    label: "Sessions",
    title: "Choose your class",
    subtitle: "Live availability. Instant confirmation.",
    mostPopular: "Most popular",
    book: "Book",
    fromPrice: "from",
    readyTitle: "Ready to move?",
    readySubtitle: "Pick a session and reserve your spot in under a minute.",
    types: {
      reformer: {
        name: "Reformer",
        description: "Spring-loaded carriage work for strength, length, and control.",
        duration: "50 min",
      },
      mat: {
        name: "Mat Pilates",
        description: "Floor-based flow focused on core stability and mobility.",
        duration: "55 min",
      },
      private: {
        name: "Private",
        description: "Fully tailored session with your instructor.",
        duration: "60 min",
      },
      duo: {
        name: "Duo",
        description: "Semi-private session — bring a friend.",
        duration: "60 min",
      },
    },
  },
  footer: {
    book: "Book",
    contact: "Contact",
  },
  book: {
    back: "Back",
    studioUnavailable: "Studio not available",
    scheduleError: "Could not load schedule.",
    loadError: "Something went wrong. Please refresh the page.",
  },
  booking: {
    stepOf: "Step {current} of {total}",
    steps: {
      service: "Session",
      date: "Date",
      time: "Time",
      summary: "Confirm",
    },
    selectSession: "Select a session",
    selectSessionSub: "Choose what you'd like to book",
    pickDate: "Pick a date",
    pickDateSub: "When would you like to come in?",
    pickTime: "Pick a time",
    noSlots: "No slots available this day",
    confirm: "Confirm",
    confirmSub: "Review before payment",
    session: "Session",
    date: "Date",
    time: "Time",
    total: "Total",
    reschedulePolicy: "Free reschedule up to {hours} hours before your session.",
    continuePayment: "Continue to payment",
    processing: "Processing…",
    serviceNames: {
      "Mat Pilates": "Mat Pilates",
      "Reformer Session": "Reformer Session",
      "Private Session": "Private Session",
      "Duo Session": "Duo Session",
      "Strategic Consulting": "Strategic Consulting",
      "Quick Q&A": "Quick Q&A",
    },
  },
  common: {
    hours: "Mon–Fri 6am–8pm · Sat 8am–2pm",
  },
};

export default en;
