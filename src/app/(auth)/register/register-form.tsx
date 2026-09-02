"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useTranslations } from "@/components/providers/locale-provider";
import type { Messages } from "@/i18n";

function mapSignUpError(
  message: string | undefined,
  code: string | undefined,
  auth: Messages["auth"]
) {
  if (code === "INVALID_ORIGIN") {
    return auth.signUpInvalidOrigin;
  }
  if (message && /database|connect|ECONNREFUSED|ENOTFOUND|prisma/i.test(message)) {
    return auth.signUpUnavailable;
  }
  return message || auth.signUpError;
}

interface RegisterFormProps {
  googleOAuthEnabled: boolean;
}

export function RegisterForm({ googleOAuthEnabled }: RegisterFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/redirect",
      });
      if (signUpError) {
        setError(mapSignUpError(signUpError.message, signUpError.code, t.auth));
        setIsLoading(false);
      } else {
        router.push("/redirect");
      }
    } catch {
      setError(t.auth.signUpError);
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
          <CardTitle className="text-2xl font-heading">{t.auth.createAccount}</CardTitle>
          <CardDescription>{t.auth.createAccountSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleOAuthEnabled && (
            <>
              <GoogleSignInButton
                isLoading={isLoading}
                onLoadingChange={setIsLoading}
                onError={setError}
                errorMessage={t.auth.googleSignUpError}
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

          <form onSubmit={handleEmailRegister} className="space-y-3">
            <input
              type="text"
              placeholder={t.auth.fullName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-11 px-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
            />
            <input
              type="email"
              placeholder={t.auth.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
            />
            <PasswordInput
              placeholder={t.auth.passwordMin}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-11"
            />
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? t.auth.creatingAccount : t.auth.createAccountBtn}
            </Button>
          </form>

          {error && (
            <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm text-center">
              {error}
            </div>
          )}

          <p className="text-center text-sm text-[var(--text-muted)]">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
              {t.auth.signIn}
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
