import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

export default function CookiesPage() {
  const cookies = [
    {
      name: "Authentication session",
      desc: "Keeps you signed in after you log in or complete a guest booking, so you can view or cancel your session. Removed when you sign out or the session expires.",
      key: "better-auth.session_token",
    },
    {
      name: "Language preferences",
      desc: "Remembers whether you chose English or Greek.",
      key: "lang",
    },
  ];
  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">Cookie Policy</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: September 3, 2026</p>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">What are cookies?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Cookies are small text files stored in your browser when you visit a website. They let
              the site remember your preferences and keep a booking session active.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">Cookies we use</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              MeTi Pilates uses only <strong>essential cookies</strong> to run the booking site. We
              do not use third-party tracking, advertising, or analytics cookies.
            </p>
            <div className="bg-[var(--background)] rounded-lg p-4 text-sm space-y-3">
              {cookies.map((c) => (
                <div key={c.key} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{c.name}</p>
                    <p className="text-[var(--text-muted)]">{c.desc}</p>
                    <code className="text-xs text-[var(--text-muted)] bg-[var(--surface)] px-1.5 py-0.5 rounded mt-1 inline-block">
                      {c.key}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">How to manage cookies</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              You can configure your browser to reject or delete cookies. If you reject cookies, you
              may need to sign in again and guest booking confirmation in the browser may not work.
              You can still cancel from the link in your confirmation email.
            </p>
          </CardContent>
        </Card>
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">
            Questions about cookies? Contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-[var(--primary)] hover:underline">
              {siteConfig.email}
            </a>
          </p>
          <Link href="/" className="text-sm text-[var(--primary)] hover:underline inline-block mt-3">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
