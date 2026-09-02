"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useTranslations } from "@/components/providers/locale-provider";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);

  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const invalidToken = searchParams.get("error") === "INVALID_TOKEN";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t.auth.resetPasswordInvalidLink);
      return;
    }

    if (password.length < 8) {
      setError(t.auth.passwordMin);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.resetPasswordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        setError(resetError.message || t.auth.resetPasswordError);
        setIsLoading(false);
        return;
      }

      setDone(true);
      setIsLoading(false);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError(t.auth.resetPasswordError);
      setIsLoading(false);
    }
  };

  const showInvalid = invalidToken || (!token && !done);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <Logo className="h-10 w-auto" />
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-heading">{t.auth.resetPasswordTitle}</CardTitle>
          <CardDescription>
            {done
              ? t.auth.resetPasswordSuccess
              : showInvalid
                ? t.auth.resetPasswordInvalidLink
                : t.auth.resetPasswordSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {done ? (
            <div className="rounded-lg bg-[var(--success-light,#ecfdf5)] p-3 text-center text-sm text-[var(--success,#047857)]">
              {t.auth.resetPasswordSuccessDetail}
            </div>
          ) : showInvalid ? (
            <p className="text-center text-sm text-[var(--text-muted)]">
              <Link href="/forgot-password" className="font-medium text-[var(--primary)] hover:underline">
                {t.auth.requestNewResetLink}
              </Link>
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <PasswordInput
                placeholder={t.auth.newPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11"
              />
              <PasswordInput
                placeholder={t.auth.confirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11"
              />
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? t.auth.resettingPassword : t.auth.resetPasswordBtn}
              </Button>
            </form>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm text-center">
              {error}
            </div>
          )}

          <p className="text-center text-sm text-[var(--text-muted)]">
            <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
              {t.auth.backToSignIn}
            </Link>
          </p>
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
