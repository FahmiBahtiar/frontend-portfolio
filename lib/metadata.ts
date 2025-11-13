// Dynamic Metadata Generator untuk SEO
import { Metadata } from 'next';
import { getAllDataForSEO } from './services/server-data';

// Base URL dari environment atau default
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blimbing.dev';

// Default metadata
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Fahmi Bahtiar | Backend Developer & Aviation Enthusiast',
    template: '%s | Fahmi Bahtiar Portfolio',
  },
  description: 'Backend Developer specializing in Node.js, passionate about aviation and mountaineering. Building innovative web solutions with modern technologies.',
  keywords: [
    'backend developer',
    'fullstack developer',
    'nodejs developer',
    'aviation enthusiast',
    'web development',
    'portfolio',
    'software engineer',
    'typescript',
    'nextjs',
    'react',
  ],
  authors: [{ name: 'Fahmi Bahtiar Adi Nugroho', url: BASE_URL }],
  creator: 'Fahmi Bahtiar Adi Nugroho',
  publisher: 'Fahmi Bahtiar Adi Nugroho',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Fahmi Bahtiar Portfolio',
    title: 'Fahmi Bahtiar | Backend Developer & Aviation Enthusiast',
    description: 'Backend Developer specializing in Node.js, passionate about aviation and mountaineering.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Fahmi Bahtiar Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fahmi Bahtiar | Backend Developer & Aviation Enthusiast',
    description: 'Backend Developer specializing in Node.js, passionate about aviation and mountaineering.',
    creator: '@blimbing',
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

// Generate metadata dari API data
export async function generateDynamicMetadata(): Promise<Metadata> {
  try {
    const data = await getAllDataForSEO();
    
    if (!data.hero) {
      return defaultMetadata;
    }

    const { hero, passions, education, projects } = data;
    
    // Build title dari data
    const title = hero.name || 'Fahmi Bahtiar';
    const primaryTitle = hero.titles?.[0] || 'Backend Developer';
    const fullTitle = `${title} | ${primaryTitle}`;
    
    // Build description
    const passionsList = passions.map((p: any) => p.title).join(', ');
    const description = hero.description || 
      `${primaryTitle} specializing in modern web technologies. ${passionsList ? `Passionate about ${passionsList}` : ''}`;
    
    // Build keywords
    const skillKeywords = hero.techStack?.map((tech: any) => tech.label.toLowerCase()) || [];
    const passionKeywords = passions.map((p: any) => p.title.toLowerCase());
    const keywords = [
      ...skillKeywords,
      ...passionKeywords,
      'backend developer',
      'fullstack developer',
      'portfolio',
      'web development',
    ];

    return {
      ...defaultMetadata,
      title: {
        default: fullTitle,
        template: `%s | ${title}`,
      },
      description,
      keywords: [...new Set(keywords)], // Remove duplicates
      openGraph: {
        ...defaultMetadata.openGraph,
        title: fullTitle,
        description,
      },
      twitter: {
        ...defaultMetadata.twitter,
        title: fullTitle,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating dynamic metadata:', error);
    return defaultMetadata;
  }
}

// Generate JSON-LD structured data untuk SEO
export async function generateStructuredData() {
  try {
    const data = await getAllDataForSEO();
    
    if (!data.hero) {
      return null;
    }

    const { hero, social, education, projects } = data;

    // Person Schema
    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: hero.name || 'Fahmi Bahtiar Adi Nugroho',
      alternateName: hero.badge || 'Blimbing',
      jobTitle: hero.titles?.[0] || 'Backend Developer',
      description: hero.description,
      url: BASE_URL,
      image: hero.photo || `${BASE_URL}/profile.jpg`,
      sameAs: social.map((s: any) => s.url).filter(Boolean),
      alumniOf: education.map((edu: any) => ({
        '@type': 'EducationalOrganization',
        name: edu.institution,
        startDate: edu.startDate,
        endDate: edu.endDate,
      })),
      knowsAbout: hero.techStack?.map((tech: any) => tech.label) || [],
    };

    // Website Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: `${hero.name} Portfolio`,
      url: BASE_URL,
      description: hero.description,
      author: {
        '@type': 'Person',
        name: hero.name,
      },
    };

    // Profile Page Schema
    const profilePageSchema = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: hero.name,
        description: hero.description,
      },
    };

    // Portfolio/Creative Work Schema (untuk projects)
    const portfolioSchema = projects.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Portfolio Projects',
      description: 'Collection of projects and work',
      numberOfItems: projects.length,
      itemListElement: projects.map((project: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: project.title,
          description: project.description,
          url: project.demoUrl || project.githubUrl,
          author: {
            '@type': 'Person',
            name: hero.name,
          },
          datePublished: project.date,
          keywords: project.tags?.join(', '),
        },
      })),
    } : null;

    return {
      personSchema,
      websiteSchema,
      profilePageSchema,
      portfolioSchema: portfolioSchema || undefined,
    };
  } catch (error) {
    console.error('Error generating structured data:', error);
    return null;
  }
}
