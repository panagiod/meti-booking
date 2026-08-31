import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

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
              Last updated: August 15, 2026
            </p>
          </div>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                1. Service description
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Meti is a platform that connects independent professionals (advisors) with clients seeking specialized advisory services. Services are delivered via video call and payments are processed through Mercado Pago.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                2. User accounts
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>You may create an account with email and password or Google sign-in (when configured).</li>
                <li>You are responsible for maintaining the confidentiality of your account.</li>
                <li>You must provide accurate and up-to-date information.</li>
                <li>You may only create one account per person.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                3. User roles
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li><strong>Client:</strong> searches for and books advisory sessions with professionals.</li>
                <li><strong>Advisor:</strong> offers professional advisory services, sets their own prices, schedules, and payment credentials.</li>
                <li><strong>Administrator:</strong> manages the platform, verifies advisors, and configures fees.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                4. Payments and fees
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Payments are processed directly through the advisor&apos;s Mercado Pago account (non-custodial model).</li>
                <li>Meti charges a service fee, visible at checkout before payment.</li>
                <li>The final price includes: advisor price + platform fee.</li>
                <li>Refunds are handled according to the advisor&apos;s cancellation policy.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                5. Cancellation and rescheduling
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li><strong>Reschedule:</strong> free with minimum advance notice configurable by the advisor.</li>
                <li><strong>Cancel without rescheduling:</strong> no payment refund.</li>
                <li><strong>No-show:</strong> no payment refund.</li>
                <li>The minimum advance notice for rescheduling is shown at the time of booking.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                6. Video calls
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Advisory sessions are conducted via video call through the platform.</li>
                <li>The video call link is sent after payment is confirmed.</li>
                <li>Meti is not responsible for user connectivity issues.</li>
                <li>Video call recordings are stored according to the advisor&apos;s configuration.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                7. Content and conduct
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Illegal, offensive, or third-party rights-violating content is not permitted.</li>
                <li>Advisors must maintain professional conduct.</li>
                <li>Meti reserves the right to suspend accounts that violate these terms.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                8. Intellectual property
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                All platform content (design, code, brand) is owned by Meti. Advisors retain rights to their professional content (biography, specialties).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                9. Limitation of liability
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Meti acts as an intermediary between advisors and clients. We are not part of the contractual relationship between advisor and client. We do not guarantee the quality of services provided by advisors.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                10. Changes to these terms
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We reserve the right to modify these terms at any time. Significant changes will be communicated through the platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                11. Contact
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                For questions about these terms, contact us at{" "}
                <a href="mailto:edwaramayadiaz@gmail.com" className="text-[var(--primary)] hover:underline">
                  edwaramayadiaz@gmail.com
                </a>.
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
