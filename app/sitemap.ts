// Dynamic Sitemap untuk SEO
import { MetadataRoute } from 'next';
import { getFlightsServer, getEducationRecordsServer } from '@/lib/services/server-data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blimbing.me';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/#about`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/#education`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/#projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/#contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  try {
    // Fetch dynamic data untuk projects (jika ada halaman detail)
    const projects = await getFlightsServer();
    
    // Jika nanti ada halaman detail project, bisa ditambahkan seperti ini:
    // const projectPages = projects.map((project: any) => ({
    //   url: `${BASE_URL}/projects/${project.id}`,
    //   lastModified: new Date(project.updatedAt || project.createdAt),
    //   changeFrequency: 'monthly' as const,
    //   priority: 0.6,
    // }));

    return [
      ...staticPages,
      // ...projectPages, // Uncomment ketika ada halaman detail
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
