import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

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
              Last updated: August 15, 2026
            </p>
          </div>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                1. Information we collect
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                When you use Meti, we collect the following information:
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li><strong>Account data:</strong> name, email address, and profile image provided through Google OAuth.</li>
                <li><strong>Profile data:</strong> biography, specialty, and verification documents (for advisors).</li>
                <li><strong>Transaction data:</strong> advisory session history and payments processed through Mercado Pago.</li>
                <li><strong>Usage data:</strong> interactions with the platform, reviews, and ratings.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                2. How we use your information
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>To provide and improve our advisory services.</li>
                <li>To process payments and manage advisory sessions.</li>
                <li>To communicate with you about your account and sessions.</li>
                <li>To verify the identity and credentials of advisors.</li>
                <li>To prevent fraud and improve platform security.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                3. Data sharing
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We do not sell your personal information. We share data only with:
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li><strong>Mercado Pago:</strong> to process payments (the advisor receives payment directly).</li>
                <li><strong>LiveKit:</strong> to facilitate advisory video calls.</li>
                <li><strong>Google:</strong> for authentication through OAuth.</li>
                <li><strong>Legal authorities:</strong> when required by law.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                4. Data security
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We implement technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Payment transactions are processed through Mercado Pago with SSL/TLS encryption.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                5. Data retention
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We retain your personal information while your account is active or as needed to provide you services. If you delete your account, we will delete your personal data within 30 days, except when we must retain it for legal obligations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                6. Your rights
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Access your personal data.</li>
                <li>Rectify inaccurate data.</li>
                <li>Request deletion of your data.</li>
                <li>Object to the processing of your data.</li>
                <li>Request portability of your data.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                7. Cookies
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Meti uses essential cookies for platform operation (authentication sessions). We do not use tracking or advertising cookies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                8. Changes to this policy
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                We reserve the right to update this privacy policy. Significant changes will be communicated through the platform or by email.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                9. Contact
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                If you have questions about this privacy policy, contact us at{" "}
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
