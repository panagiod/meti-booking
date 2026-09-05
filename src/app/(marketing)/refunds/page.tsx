import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function RefundsPage() {
  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
        Cancellations
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Last updated: September 5, 2026
      </p>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Cancelling a session
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>
                You can cancel a confirmed booking from your account or confirmation
                email if there are at least 24 hours before the session.
              </li>
              <li>
                If you do not cancel at least 24 hours before, the session must still
                be paid at the studio — including no-shows.
              </li>
              <li>Payment is made at the studio, so there is no online refund.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Studio cancellations
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>
                If the studio needs to cancel, we will contact you to rebook.
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="pt-4 border-t border-[var(--border)]">
          <Link href="/book" className="text-sm text-[var(--primary)] font-medium hover:underline">
            Book a session
          </Link>
        </div>
      </div>
    </div>
  );
}
