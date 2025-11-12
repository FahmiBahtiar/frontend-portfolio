import type { Metadata } from "next";
import { Inter, Dancing_Script } from 'next/font/google';
import "./globals.css";
import { generateDynamicMetadata, generateStructuredData } from '@/lib/metadata';

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

// Generate dynamic metadata dari API
export async function generateMetadata(): Promise<Metadata> {
  return await generateDynamicMetadata();
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate JSON-LD structured data untuk SEO
  const structuredData = await generateStructuredData();

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${dancingScript.variable}`}>
      <head>
        {/* DNS Prefetch & Preconnect for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* JSON-LD Structured Data untuk SEO */}
        {structuredData && (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData.personSchema),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData.websiteSchema),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData.profilePageSchema),
              }}
            />
            {structuredData.portfolioSchema && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(structuredData.portfolioSchema),
                }}
              />
            )}
          </>
        )}
      </head>
      <body suppressHydrationWarning className={inter.className}>
        {children}
      </body>
    </html>
  );
}
