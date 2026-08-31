"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="font-heading text-[120px] md:text-[180px] font-bold text-[var(--primary)] opacity-20 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
          Page not found
        </h2>
        <p className="text-[var(--text-muted)] mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={() => window.history.back()} variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to home
            </Link>
          </Button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Need help? Try these options:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/services"
              className="text-[var(--primary)] hover:underline"
            >
              Browse advisors
            </Link>
            <Link
              href="/dashboard"
              className="text-[var(--primary)] hover:underline"
            >
              My dashboard
            </Link>
            <Link
              href="/login"
              className="text-[var(--primary)] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
