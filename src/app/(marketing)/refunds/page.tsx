import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function RefundsPage() {
  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
        Cancellations and refunds
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Last updated: August 15, 2026
      </p>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Rescheduling
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>You can reschedule your advisory session <strong>for free</strong> with at least 24 hours of advance notice before the scheduled date and time.</li>
              <li>The minimum advance notice may vary depending on the advisor&apos;s settings.</li>
              <li>When rescheduling, you lose the original time slot and must choose a new one from those available.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Cancellation without rescheduling
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>If you cancel an advisory session without rescheduling, <strong>no payment refund is issued</strong>.</li>
              <li>This applies regardless of advance notice.</li>
              <li>The advisor receives the full payment for the cancellation.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              No-show
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>If you do not attend the advisory session without canceling beforehand, <strong>no refund is issued</strong>.</li>
              <li>This is treated as a completed session for billing purposes.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Payments
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>Payments are processed through Mercado Pago when the booking is confirmed.</li>
              <li>Funds are sent directly to the advisor&apos;s Mercado Pago account.</li>
              <li>Meti charges a transparent fee shown at checkout before payment.</li>
              <li>Payment disputes are handled through Mercado Pago according to their buyer protection policy.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Cancellation by the advisor
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>If an advisor cancels a confirmed session, the client receives a <strong>full refund</strong>.</li>
              <li>Frequent cancellations by an advisor may result in account suspension.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] mb-3">
            Have questions about a specific cancellation?
          </p>
          <Link href="/services" className="text-sm text-[var(--primary)] font-medium hover:underline">
            Browse advisors
          </Link>
        </div>
      </div>
    </div>
  );
}
