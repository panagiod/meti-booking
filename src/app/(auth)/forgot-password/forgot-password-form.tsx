"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getClientAuthBaseURL } from "@/lib/auth-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useTranslations } from "@/components/providers/locale-provider";

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${getClientAuthBaseURL()}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || t.auth.forgotPasswordError);
        setIsLoading(false);
        return;
      }

      setSent(true);
      setIsLoading(false);
    } catch {
      setError(t.auth.forgotPasswordError);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <Logo className="h-10 w-auto" />
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-heading">{t.auth.forgotPasswordTitle}</CardTitle>
          <CardDescription>
            {sent ? t.auth.forgotPasswordSent : t.auth.forgotPasswordSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-[var(--success-light,#ecfdf5)] p-3 text-center text-sm text-[var(--success,#047857)]">
                {t.auth.forgotPasswordSentDetail}
              </div>
              <p className="text-center text-sm text-[var(--text-muted)]">
                <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
                  {t.auth.backToSignIn}
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder={t.auth.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 px-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? t.auth.sendingResetLink : t.auth.sendResetLink}
              </Button>
            </form>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm text-center">
              {error}
            </div>
          )}

          {!sent && (
            <p className="text-center text-sm text-[var(--text-muted)]">
              <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
                {t.auth.backToSignIn}
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-[var(--text-muted)]">
        <Link href="/" className="font-medium text-[var(--text-secondary)] hover:text-[var(--primary)]">
          {t.auth.backHome}
        </Link>
      </p>
    </div>
  );
}
