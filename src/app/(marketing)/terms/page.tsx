import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

const CONTACT = siteConfig.email;

export default function TermsOfServicePage() {
  return (
    <div className="container-meti py-12 max-w-3xl">
      <Card>
        <CardContent className="p-8 md:p-12 space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
              Terms of Service
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Last updated: September 5, 2026
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              1. The studio
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              MeTi Pilates offers in-person reformer pilates sessions with Meropi Tirri at{" "}
              {siteConfig.location}. This website is for booking those sessions. Sessions
              are not delivered online.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              2. Bookings
            </h2>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>You can book with an account or as a guest using your email.</li>
              <li>A confirmed booking reserves a reformer place at the chosen time.</li>
              <li>Please arrive a few minutes early. Classes start on time and do not wait if you arrive late.</li>
              <li>First visits: arrive about 10 minutes early so we can set you up on the reformer.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              3. Payment
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Payment is made at the studio. The current session price is shown when you
              book. There is no online checkout at this time. If a booking is not cancelled
              at least 24 hours before the session, the session must still be paid.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              4. Cancellation
            </h2>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
              <li>
                You may cancel from the link in your confirmation email or from your
                account at least 24 hours before the session.
              </li>
              <li>
                Late cancellation, no-show, or arriving after the class has started does
                not cancel the fee — the session must still be paid.
              </li>
              <li>If the studio must cancel, we will contact you to rebook.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              5. Studio conduct
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Sessions take place in small groups. Follow instructor guidance so everyone
              can train safely. We may refuse or end a session if behaviour puts others at
              risk.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              6. Contact
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Questions about these terms:{" "}
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
