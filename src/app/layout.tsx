import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sileo";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeTi Pilates — Book Reformer Sessions Online",
  description:
    "Book reformer pilates sessions online. Pick a time, show up, move well.",
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
    title: "MeTi Pilates — Book Reformer Sessions Online",
    description:
      "Book reformer pilates sessions online. Pick a time, show up, move well.",
    siteName: "MeTi Pilates",
    type: "website",
    url: "https://meti.cognilab.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeTi Pilates — Book Reformer Sessions Online",
    description:
      "Book reformer pilates sessions online. Pick a time, show up, move well.",
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
      className={`${dmSans.variable} ${cormorant.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MeTi Pilates",
              description: "Book reformer pilates sessions online.",
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
            <LocaleProvider>
              <AuthProvider>{children}</AuthProvider>
            </LocaleProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster position="top-right" theme="system" />
        <Analytics />
      </body>
    </html>
  );
}
