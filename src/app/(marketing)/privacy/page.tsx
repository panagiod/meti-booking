import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

const CONTACT = siteConfig.email;

export default function PrivacyPolicyPage() {
  return (
    <div className="container-meti py-12 max-w-3xl">
      <Card>
        <CardContent className="p-8 md:p-12 space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Last updated: September 3, 2026
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              1. Who we are
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              MeTi Pilates is an in-person reformer pilates studio operated by Meropi Tirri
              at {siteConfig.location}. This policy explains how we handle information when
              you book a session on {siteConfig.siteUrl.replace("https://", "")}.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              2. Information we collect
            </h2>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>
                <strong>Booking details:</strong> name and email so we can confirm your
                reformer session and contact you about changes.
              </li>
              <li>
                <strong>Account data:</strong> if you create an account or sign in with
                Google, we store your name, email, and profile image.
              </li>
              <li>
                <strong>Session history:</strong> dates, times, and status of bookings at
                the studio.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              3. How we use your information
            </h2>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>To reserve a reformer place and send confirmation or reminder emails.</li>
              <li>To let you view or cancel a booking from your email link or account.</li>
              <li>To run the studio schedule and communicate about your session.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              4. Data sharing
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We do not sell your personal information. We share data only with:
            </p>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>
                <strong>Email delivery:</strong> to send booking confirmations and reminders.
              </li>
              <li>
                <strong>Google:</strong> if you choose to sign in with Google.
              </li>
              <li>
                <strong>Legal authorities:</strong> when required by law.
              </li>
            </ul>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Payment for sessions is made at the studio. We do not process card payments
              on this website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              5. Data retention
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We keep booking records as needed to run the studio. If you ask us to delete
              your account, we will remove personal data that we no longer need to keep for
              legal or operational reasons.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              6. Your rights
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              You may ask to access, correct, or delete your personal data, or object to
              how we use it. Contact us using the address below.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              7. Cookies
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We use essential cookies to keep you signed in and remember language
              preference. See our{" "}
              <Link href="/cookies" className="text-[var(--primary)] hover:underline">
                cookie policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              8. Contact
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Questions about this policy:{" "}
              <a href={`mailto:${CONTACT}`} className="text-[var(--primary)] hover:underline">
                {CONTACT}
              </a>
              .
            </p>
          </section>

          <div className="pt-4 border-t border-[var(--border)]">
            <Link href="/" className="text-sm text-[var(--primary)] hover:underline">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
