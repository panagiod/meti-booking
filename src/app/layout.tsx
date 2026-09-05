import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, GFS_Didot, JetBrains_Mono, Noto_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sileo";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getSiteUrl, siteConfig } from "@/lib/site-config";
import "./globals.css";
import "@/styles/studio.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const gfsDidot = GFS_Didot({
  variable: "--font-gfs-didot",
  subsets: ["greek", "latin"],
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Meropi Tirri — Clinical Pilates & Reformer",
  description:
    "Physiotherapist and Clinical Pilates instructor. Reformer sessions in small groups — personalized care, safe movement, lasting results. Book online.",
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
    title: "Meropi Tirri — Clinical Pilates & Reformer",
    description:
      "Physiotherapist and Clinical Pilates instructor. Reformer sessions in small groups — personalized care, safe movement, lasting results.",
    siteName: "Meropi Tirri",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Meropi Tirri — Clinical Pilates & Reformer",
    description:
      "Physiotherapist and Clinical Pilates instructor. Reformer sessions in small groups — personalized care, safe movement, lasting results.",
  },
  metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdfcfa",
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
      className={`${dmSans.variable} ${notoSans.variable} ${cormorant.variable} ${gfsDidot.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["LocalBusiness", "ExerciseGym"],
              name: "Meropi Tirri",
              alternateName: "MeTi Pilates",
              description:
                "Physiotherapist and Clinical Pilates instructor. Reformer sessions in small groups in Limassol.",
              url: siteUrl,
              telephone: siteConfig.phone,
              email: siteConfig.email,
              hasMap: siteConfig.mapsUrl,
              image: `${siteUrl}/images/hero.jpg`,
              priceRange: "€10",
              currenciesAccepted: "EUR",
              address: {
                "@type": "PostalAddress",
                streetAddress: "60A Christoforou Giatrou",
                addressLocality: "Agios Ioannis Pitsilias",
                postalCode: "4071",
                addressRegion: "Limassol",
                addressCountry: "CY",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Tuesday", "Thursday"],
                  opens: "15:45",
                  closes: "18:45",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Saturday",
                  opens: "08:00",
                  closes: "13:30",
                },
              ],
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
