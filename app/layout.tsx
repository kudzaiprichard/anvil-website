import type { Metadata } from "next";
import { Spline_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://anvil.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Anvil — The free, offline, honest way to master DSA",
  description:
    "Anvil is an open-source, offline-first desktop app for coding-interview & DSA practice. A guided course of original problems, judged against real test cases. No account. No AI crutch. MIT-licensed.",
  keywords: [
    "Anvil",
    "DSA practice",
    "offline coding interview",
    "open source",
    "Tauri",
    "leetcode alternative",
    "algorithms",
  ],
  authors: [{ name: "Kudzai P Matizirofa" }],
  openGraph: {
    title: "Anvil — Forge the pattern recognition that survives the interview",
    description:
      "Open-source, offline-first DSA practice. A guided course of original problems, oracle-verified judging, no AI crutch. Free & MIT-licensed.",
    url: SITE_URL,
    siteName: "Anvil",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anvil — The free, offline, honest way to master DSA",
    description:
      "Open-source, offline-first DSA practice. A guided course of original problems. No account, no AI crutch. MIT-licensed.",
  },
  icons: {
    icon: [
      { url: "/anvil-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${splineSans.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
