import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sileo";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flow Pilates — Book Pilates Sessions Online",
  description:
    "Book mat, reformer, and private pilates sessions online. Choose your class, pick a time slot, and pay securely.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Flow Pilates — Book Pilates Sessions Online",
    description:
      "Book mat, reformer, and private pilates sessions online. Choose your class, pick a time slot, and pay securely.",
    siteName: "Flow Pilates",
    type: "website",
    url: "https://meti.cognilab.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flow Pilates — Book Pilates Sessions Online",
    description:
      "Book mat, reformer, and private pilates sessions online. Choose your class, pick a time slot, and pay securely.",
  },
  metadataBase: new URL("https://meti.cognilab.dev"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Meti",
              description: "Professional online advisory platform. Connect with expert advisors via video call.",
              url: "https://meti.cognilab.dev",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster position="top-right" theme="system" />
        <Analytics />
      </body>
    </html>
  );
}
