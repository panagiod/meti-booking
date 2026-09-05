import { siteConfig } from "@/lib/site-config";
import type { LegalBundle } from "@/i18n/legal-types";

const studio = siteConfig.siteName;
const operator = siteConfig.name;
const address = siteConfig.location;
const email = siteConfig.email;
const phone = "+357 95 519786";
const site = "meti-pilates.com";
const updated = "5 September 2026";

const legalEn: LegalBundle = {
  privacy: {
    title: "Privacy policy",
    updated,
    intro: `${studio} is an in-person reformer pilates studio in Limassol, Cyprus, operated by ${operator}. This policy explains how we handle personal data when you use ${site}.`,
    sections: [
      {
        heading: "1. Controller",
        paragraphs: [
          `The controller is ${operator}, trading as ${studio}, ${address}. Email: ${email}. Telephone: ${phone}.`,
          "If you have a question about your data, write to that email. You may also complain to the Commissioner for Personal Data Protection of the Republic of Cyprus (www.dataprotection.gov.cy).",
        ],
      },
      {
        heading: "2. What we collect",
        bullets: [
          "Name and email — to confirm a booking and contact you about the session.",
          "Phone number — optional, if you give it at checkout or on your profile.",
          "Profile photo — only if you upload one or sign in with Google.",
          "Booking history — date, time, status, and price of sessions.",
          "Technical data — IP address and browser type on the sign-in session, to keep the account secure and limit abuse.",
        ],
      },
      {
        heading: "3. Why we use it (legal bases)",
        bullets: [
          "Contract (GDPR Art. 6(1)(b)): creating the booking, sending confirmation and reminder emails, letting you cancel from your email link or account.",
          "Legitimate interests (Art. 6(1)(f)): studio operations, preventing booking abuse, and keeping the site secure. Those interests do not override your rights.",
          "Consent (Art. 6(1)(a)): only if you choose Google sign-in. You can use email or guest booking instead.",
          "Legal obligation (Art. 6(1)(c)): records we must keep for tax or accounting, if that applies.",
        ],
      },
      {
        heading: "4. Who receives data",
        paragraphs: [
          "We do not sell personal data. We share only what is needed:",
        ],
        bullets: [
          "Email delivery (Resend) — confirmation, reminder, cancellation, and password-reset messages. Resend may process data outside the EEA under its own safeguards.",
          "Hosting (Hetzner, European Union) — the website and booking database run on a server in the EU.",
          "Google — only if you sign in with Google.",
          "Encrypted backups — copies of the database are encrypted and stored with a cloud repository provider. The encryption key is not stored with those files.",
          "Authorities — if the law requires it.",
        ],
      },
      {
        heading: "5. Payment",
        paragraphs: [
          "You pay at the studio. We do not take card numbers on this website. If online payment is turned on later, only the payment provider will receive what it needs to take the payment. We will not store full card numbers.",
        ],
      },
      {
        heading: "6. How long we keep data",
        paragraphs: [
          "We keep booking records as long as we need them to run the studio and meet legal duties. Cancelled test bookings are removed automatically. You may download your data or ask us to delete your account from your profile. If you have an upcoming session, cancel it first. After deletion we anonymise your name, email, phone, and photo. Past session times may remain on the schedule without your identity.",
        ],
      },
      {
        heading: "7. Your rights",
        paragraphs: [
          "You may request access, correction, erasure, restriction, portability, or object to processing based on legitimate interests. Use your profile or email us. You also have the right to lodge a complaint with the Cyprus Commissioner for Personal Data Protection.",
        ],
      },
      {
        heading: "8. Children",
        paragraphs: [
          "The website is intended for adults. A parent or guardian may book for a younger person and is responsible for that booking.",
        ],
      },
      {
        heading: "9. Cookies",
        paragraphs: [
          "We use only essential cookies and similar storage to run bookings and remember language. See the cookie policy. We do not use advertising or analytics cookies.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of service",
    updated,
    intro: `These terms apply when you book an in-person reformer session with ${studio}.`,
    sections: [
      {
        heading: "1. The studio",
        paragraphs: [
          `${studio} is operated by ${operator} at ${address}. Sessions take place at the studio. They are not delivered online.`,
          `Contact: ${email}, ${phone}.`,
        ],
      },
      {
        heading: "2. Bookings",
        bullets: [
          "You may book with an account or as a guest with your email.",
          "A confirmed booking reserves one reformer place at the chosen time.",
          "Please arrive a few minutes early. Classes start on time and do not wait if you arrive late.",
          "First visits: arrive about 10 minutes early so we can set you up on the reformer.",
        ],
      },
      {
        heading: "3. Payment",
        paragraphs: [
          "Payment is made at the studio. The price is shown when you book. There is no online checkout at this time. If a booking is not cancelled at least 24 hours before the session, the session must still be paid.",
        ],
      },
      {
        heading: "4. Cancellation",
        bullets: [
          "You may cancel from the link in your confirmation email or from your account at least 24 hours before the session.",
          "Late cancellation, no-show, or arriving after the class has started does not cancel the fee — the session must still be paid.",
          "If the studio must cancel, we will contact you to rebook.",
        ],
      },
      {
        heading: "5. Right of withdrawal",
        paragraphs: [
          "EU consumer law usually gives a 14-day cooling-off period for distance contracts. That right does not apply to leisure services for a specific date or period (Directive 2011/83/EU, Art. 16(l), as implemented in Cyprus). When you book a dated class, you ask us to reserve that place. The 24-hour studio cancellation rule above still applies.",
        ],
      },
      {
        heading: "6. Conduct",
        paragraphs: [
          "Sessions take place in small groups. Follow instructor guidance so everyone can train safely. We may refuse or end a session if behaviour puts others at risk.",
        ],
      },
      {
        heading: "7. Governing law",
        paragraphs: [
          "These terms are governed by the law of the Republic of Cyprus. Mandatory consumer protections of your EU country of residence still apply.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie policy",
    updated,
    intro: `${studio} uses only what is needed to run the booking site. We do not use third-party tracking, advertising, or analytics cookies.`,
    cookieListTitle: "Cookies we use",
    storageListTitle: "Other storage on your device",
    manageHeading: "How to manage them",
    manageParagraphs: [
      "You can reject or delete cookies in your browser. If you reject them, you may need to sign in again and guest confirmation in the browser may not work. You can still cancel from the link in your confirmation email.",
    ],
    sections: [
      {
        heading: "What cookies are",
        paragraphs: [
          "Cookies are small text files stored in your browser. Similar storage (localStorage) can keep a preference on your device. Essential cookies do not require a consent banner under EU ePrivacy rules.",
        ],
      },
    ],
    rows: [
      {
        name: "Authentication session",
        key: "better-auth.session_token",
        desc: "Keeps you signed in after you log in or complete a guest booking. HttpOnly. Removed when you sign out or the session expires.",
      },
      {
        name: "Secure authentication session",
        key: "__Secure-better-auth.session_token",
        desc: "Same session on HTTPS. Used together with the cookie above.",
      },
      {
        name: "Language",
        key: "meti-lang",
        desc: "Remembers whether you chose Greek or English. Lasts one year. SameSite=Lax.",
      },
    ],
    storageRows: [
      {
        name: "Language (copy)",
        key: "meti-lang",
        desc: "Same language choice, stored in localStorage if cookies are limited.",
      },
      {
        name: "Pending booking",
        key: "meti-pending-booking",
        desc: "Keeps the date and time you picked if you leave checkout to sign in. Cleared after you book.",
      },
      {
        name: "Colour theme",
        key: "theme",
        desc: "Remembers light or dark appearance.",
      },
      {
        name: "Cookie notice",
        key: "meti-cookie-notice",
        desc: "Remembers that you dismissed the short cookie notice.",
      },
    ],
  },
  refunds: {
    title: "Cancellations",
    updated,
    sections: [
      {
        heading: "Cancelling a session",
        bullets: [
          "You can cancel a confirmed booking from your account or confirmation email if there are at least 24 hours before the session.",
          "If you do not cancel at least 24 hours before, the session must still be paid at the studio — including no-shows.",
          "Payment is made at the studio, so there is no online refund.",
        ],
      },
      {
        heading: "Studio cancellations",
        bullets: [
          "If the studio needs to cancel, we will contact you to rebook.",
        ],
      },
      {
        heading: "Dated leisure services",
        paragraphs: [
          "A class booked for a specific date is a leisure service. The 14-day online cooling-off right does not apply. The 24-hour studio rule above is the cancellation policy that applies.",
        ],
      },
    ],
  },
  licenses: {
    title: "Software notices",
    updated,
    intro: `The ${studio} booking website is released under the MIT License. Third-party libraries keep their own licenses. The main ones are listed below.`,
    sections: [
      {
        heading: "Application",
        bullets: [
          "This website: MIT License. See the LICENSE file in the public source repository.",
        ],
      },
      {
        heading: "Main open-source components",
        bullets: [
          "Next.js, React, and related tools — MIT.",
          "Prisma — Apache License 2.0.",
          "better-auth — MIT.",
          "Fonts (Noto Sans, DM Sans, Cormorant Garamond, EB Garamond, JetBrains Mono) — SIL Open Font License, loaded and hosted by the site at build time.",
          "Default photographs — Pexels license (free to use).",
        ],
      },
      {
        heading: "No extra charge",
        paragraphs: [
          "Using the booking site does not require you to accept those software licenses. They apply to the software itself, not to your pilates session.",
        ],
      },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "How do I book a session?",
        a: "Open Book, pick a date and time with an open reformer place, and confirm with your email. You do not need an account.",
      },
      {
        q: "How do I pay?",
        a: `Payment is at the studio. Reformer sessions start from €${siteConfig.sessionTypes[0].priceFrom}. There is no online payment on this site. If you book and do not cancel at least 24 hours before, the session must still be paid.`,
      },
      {
        q: "How do I cancel?",
        a: "Use the link in your confirmation email or sign in to your account. Free cancellation needs at least 24 hours’ notice. Later than that, or if you do not come, the session must still be paid.",
      },
      {
        q: "What if I arrive late?",
        a: "Classes start on time and do not wait. Join quietly if you can; the session will not be delayed or extended.",
      },
      {
        q: "Where is the studio?",
        a: `${address}.`,
      },
      {
        q: "What should I bring?",
        a: "Wear comfortable movement clothing. Arrive a few minutes early so you are ready when the class starts. First visits: come about 10 minutes early so we can get you set up on the reformer.",
      },
      {
        q: "Who teaches?",
        a: `Sessions are with ${operator}, physiotherapist and Clinical Pilates & Reformer instructor.`,
      },
      {
        q: "How is my personal data used?",
        a: "We use your name and email to run the booking. Phone is optional. See the privacy policy. You can download or delete your data from your profile.",
      },
    ],
  },
};

export default legalEn;
