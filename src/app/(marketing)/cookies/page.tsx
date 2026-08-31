import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
export default function CookiesPage() {
  const cookies = [
    { name: "Authentication session", desc: "Keeps your session active so you do not have to sign in on every page. Stored when you sign in and removed when you sign out.", key: "better-auth.session_token" },
    { name: "Language preferences", desc: "Remembers your preferred language for displaying the interface.", key: "lang" },
  ];
  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">Cookie Policy</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: August 15, 2026</p>
      <div className="space-y-6">
        <Card><CardContent className="p-6">
          <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">What are cookies?</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Cookies are small text files stored in your browser when you visit a website. They allow the platform to remember your preferences and keep your session active.</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">Cookies we use</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">Meti uses only <strong>essential cookies</strong> for platform operation. We do not use third-party tracking, advertising, or analytics cookies.</p>
          <div className="bg-[var(--background)] rounded-lg p-4 text-sm space-y-3">
            {cookies.map((c) => (
              <div key={c.key} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{c.name}</p>
                  <p className="text-[var(--text-muted)]">{c.desc}</p>
                  <code className="text-xs text-[var(--text-muted)] bg-[var(--surface)] px-1.5 py-0.5 rounded mt-1 inline-block">{c.key}</code>
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">How to manage cookies</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">You can configure your browser to reject or delete cookies. Note that if you reject cookies, Meti cannot keep your session active and you will need to sign in on each visit.</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">Third-party cookies</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Meti does not install third-party tracking or advertising cookies. Embedded YouTube content on advisor profiles may set YouTube&apos;s own cookies when you play a video, but this only occurs through your direct interaction.</p>
        </CardContent></Card>
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Questions about our cookies? Contact us at <a href="mailto:edwaramayadiaz@gmail.com" className="text-[var(--primary)] hover:underline">edwaramayadiaz@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}
