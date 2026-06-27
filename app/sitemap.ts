// Sitemap untuk SEO
import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';

const BASE_URL = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  // Only real, crawlable routes. The site is a single page; #fragment anchors
  // are NOT separate URLs (search engines drop the fragment), so they were
  // removed to avoid duplicate-of-homepage entries. Add per-detail routes here
  // once pages like /projects/[id] actually exist.
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
