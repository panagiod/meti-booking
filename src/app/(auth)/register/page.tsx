"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/redirect",
      });
    } catch (err) {
      setError("Failed to sign up with Google. Please try again.");
      setIsLoading(false);
    }
  };

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
        setError(signUpError.message || "Failed to create account. Please try again.");
        setIsLoading(false);
      } else {
        router.push("/redirect");
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <Logo className="h-10 w-auto" />
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Create your account</CardTitle>
          <CardDescription>Join Meti and connect with professional advisors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Button */}
          <Button variant="secondary" className="w-full h-12 text-base" onClick={handleGoogleRegister} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--surface)] text-[var(--text-muted)]">o</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailRegister} className="space-y-3">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-11 px-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 px-3 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
            />
            <PasswordInput
              placeholder="Password (minimum 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-11"
            />
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {error && (
            <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-[var(--text-muted)]">
        <Link href="/" className="font-medium text-[var(--text-secondary)] hover:text-[var(--primary)]">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
