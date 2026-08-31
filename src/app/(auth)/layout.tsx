import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageSwitcher className="border-[var(--border)] [&_button]:text-[var(--text-muted)] [&_button[aria-pressed=true]]:bg-[var(--primary)]" />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
