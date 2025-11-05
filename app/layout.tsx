import type { Metadata } from "next";
import { Inter, Dancing_Script } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dancing-script',
});

export const metadata: Metadata = {
  title: "Portfolio | Developer & Aviation Enthusiast",
  description: "Personal Portfolio Website - Backend Developer, Aviation, and Mountaineering",
  keywords: ['portfolio', 'developer', 'aviation', 'web development'],
  authors: [{ name: 'Blimbing' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${dancingScript.variable}`}>
      <head>
        {/* DNS Prefetch & Preconnect for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body suppressHydrationWarning className={inter.className}>
        {children}
      </body>
    </html>
  );
}
