import type { Messages } from "../types";

const el: Messages = {
  meta: {
    title: "Flow Pilates — Κράτηση μαθημάτων Pilates",
    description:
      "Μαθήματα reformer και mat σε μικρές ομάδες. Κλείστε online, ελάτε, κινηθείτε καλά.",
  },
  nav: {
    sessions: "Μαθήματα",
    signIn: "Σύνδεση",
    account: "Λογαριασμός",
    bookNow: "Κράτηση",
  },
  hero: {
    eyebrow: "Reformer · Mat · Ιδιωτικό",
    title: "Pilates, με απλή κράτηση.",
    description:
      "Μαθήματα reformer και mat σε μικρές ομάδες. Κλείστε online, ελάτε, κινηθείτε καλά.",
    bookSession: "Κλείστε μάθημα",
    viewSessions: "Δείτε μαθήματα",
    imageAlt: "Γυναίκα σε μηχάνημα reformer pilates σε φωτεινό στούντιο",
  },
  sessions: {
    label: "Μαθήματα",
    title: "Επιλέξτε μάθημα",
    subtitle: "Διαθεσιμότητα σε πραγματικό χρόνο. Άμεση επιβεβαίωση.",
    mostPopular: "Πιο δημοφιλές",
    book: "Κράτηση",
    fromPrice: "από",
    readyTitle: "Έτοιμοι να κινηθείτε;",
    readySubtitle: "Επιλέξτε μάθημα και κλείστε θέση σε λιγότερο από ένα λεπτό.",
    types: {
      reformer: {
        name: "Reformer",
        description: "Εργασία στο carriage για δύναμη, μήκος και έλεγχο.",
        duration: "50 λεπτά",
      },
      mat: {
        name: "Mat Pilates",
        description: "Ροή στο χάλι για σταθερότητα κέντρου και κινητικότητα.",
        duration: "55 λεπτά",
      },
      private: {
        name: "Ιδιωτικό",
        description: "Προσωπικό μάθημα προσαρμοσμένο σε εσάς.",
        duration: "60 λεπτά",
      },
      duo: {
        name: "Duo",
        description: "Ημι-ιδιωτικό μάθημα — φέρτε έναν φίλο.",
        duration: "60 λεπτά",
      },
    },
  },
  footer: {
    book: "Κράτηση",
    contact: "Επικοινωνία",
  },
  book: {
    back: "Πίσω",
    studioUnavailable: "Το στούντιο δεν είναι διαθέσιμο",
    scheduleError: "Δεν ήταν δυνατή η φόρτωση του προγράμματος.",
    loadError: "Κάτι πήγε στραβά. Ανανεώστε τη σελίδα.",
  },
  booking: {
    stepOf: "Βήμα {current} από {total}",
    steps: {
      service: "Μάθημα",
      date: "Ημερομηνία",
      time: "Ώρα",
      summary: "Επιβεβαίωση",
    },
    selectSession: "Επιλέξτε μάθημα",
    selectSessionSub: "Διαλέξτε τι θέλετε να κλείσετε",
    pickDate: "Επιλέξτε ημερομηνία",
    pickDateSub: "Πότε θέλετε να έρθετε;",
    pickTime: "Επιλέξτε ώρα",
    noSlots: "Δεν υπάρχουν διαθέσιμες ώρες αυτή την ημέρα",
    confirm: "Επιβεβαίωση",
    confirmSub: "Ελέγξτε πριν την πληρωμή",
    session: "Μάθημα",
    date: "Ημερομηνία",
    time: "Ώρα",
    total: "Σύνολο",
    reschedulePolicy: "Δωρεάν αλλαγή έως {hours} ώρες πριν το μάθημα.",
    continuePayment: "Συνέχεια στην πληρωμή",
    processing: "Επεξεργασία…",
    serviceNames: {
      "Mat Pilates": "Mat Pilates",
      "Reformer Session": "Reformer",
      "Private Session": "Ιδιωτικό μάθημα",
      "Duo Session": "Duo μάθημα",
      "Strategic Consulting": "Στρατηγική συμβουλευτική",
      "Quick Q&A": "Σύντομες ερωτήσεις",
    },
  },
  common: {
    hours: "Δευ–Παρ 6:00–20:00 · Σαβ 8:00–14:00",
  },
};

export default el;
