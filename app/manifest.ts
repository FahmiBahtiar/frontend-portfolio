// Web App Manifest untuk PWA
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fahmi Bahtiar Portfolio',
    short_name: 'Blimbing',
    description: 'Backend Developer specializing in Node.js, passionate about aviation and mountaineering',
    start_url: '/',
    display: 'standalone',
    background_color: '#E2F4F3',
    theme_color: '#E2F4F3',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['portfolio', 'developer', 'technology'],
    lang: 'en-US',
  };
}
