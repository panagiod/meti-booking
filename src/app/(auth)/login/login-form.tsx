"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useTranslations } from "@/components/providers/locale-provider";

interface LoginFormProps {
  googleOAuthEnabled: boolean;
}

export function LoginForm({ googleOAuthEnabled }: LoginFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data) router.push("/redirect");
      } catch {
        // ignore
      }
    };
    checkSession();
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/redirect",
      });
      if (signInError) {
        setError(signInError.message || t.auth.emailError);
        setIsLoading(false);
      } else {
        router.push("/redirect");
      }
    } catch {
      setError(t.auth.signInError);
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
          <CardTitle className="text-xl font-heading">{t.auth.welcomeBack}</CardTitle>
          <CardDescription>{t.auth.signInSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleOAuthEnabled && (
            <>
              <GoogleSignInButton
                isLoading={isLoading}
                onLoadingChange={setIsLoading}
                onError={setError}
                errorMessage={t.auth.googleError}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[var(--surface)] text-[var(--text-muted)]">
                    {t.auth.orDivider}
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <input
              type="email"
              placeholder={t.auth.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
            />
            <div className="space-y-2">
              <PasswordInput
                placeholder={t.auth.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
              <Link
                href="/forgot-password"
                className="inline-block text-sm font-medium text-[var(--primary)] underline underline-offset-2 hover:opacity-80"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>

          {error && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm text-center">
                {error}
              </div>
              <p className="text-center text-sm text-[var(--text-muted)]">
                <Link
                  href="/forgot-password"
                  className="font-medium text-[var(--primary)] underline underline-offset-2 hover:opacity-80"
                >
                  {t.auth.forgotPassword}
                </Link>
              </p>
            </div>
          )}

          <p className="text-center text-sm text-[var(--text-muted)]">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="font-medium text-[var(--primary)] hover:underline">
              {t.auth.signUpFree}
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
