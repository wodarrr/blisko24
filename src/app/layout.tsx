import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://blisko24.com.pl";
const siteTitle =
  "BLISKO24 – Praca, pomoc i lokalne możliwości";
const siteDescription =
  "Znajdź pracę, pracownika, fachowca lub lokalną pomoc. BLISKO24 łączy ludzi, firmy i możliwości w całej Polsce.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "BLISKO24",

  title: {
    default: siteTitle,
    template: "%s | BLISKO24",
  },

  description: siteDescription,

  keywords: [
    "praca",
    "oferty pracy",
    "szukam pracy",
    "pracownicy",
    "kandydaci",
    "lokalne usługi",
    "fachowcy",
    "pomoc sąsiedzka",
    "BLISKO24",
  ],

  authors: [
    {
      name: "BLISKO24",
      url: siteUrl,
    },
  ],

  creator: "BLISKO24",
  publisher: "BLISKO24",
  category: "jobs",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/",
    siteName: "BLISKO24",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BLISKO24 – Znajdź ludzi, nie tylko ogłoszenia",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}