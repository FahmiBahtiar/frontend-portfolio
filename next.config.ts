import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Offload optimization to Cloudinary via a custom loader: it resizes and
    // serves WebP/AVIF (f_auto,q_auto) straight from its CDN. The loader passes
    // non-Cloudinary URLs through unchanged. deviceSizes/imageSizes still drive
    // which widths the loader is asked for (responsive srcset).
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['motion', 'lucide-react', '@radix-ui/react-accordion'],
    optimizeCss: true,
    webpackBuildWorker: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  // Optimize JavaScript
  productionBrowserSourceMaps: false,
  
  // SEO & Performance Optimizations
  generateBuildId: async () => {
    // Generate build ID dengan timestamp untuk cache busting
    return `build-${Date.now()}`;
  },
  
  // Compression
  compress: true,
  
  // PoweredBy header removal untuk security
  poweredByHeader: false,
  
  // Strict Mode untuk better React debugging
  reactStrictMode: true,
  
  // Headers untuk SEO dan Security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Origin isolation (Lighthouse "origin isolation with COOP"). We do
            // NOT set COEP (require-corp) because that would block our external
            // images (Lanyard/IVAO/Unsplash), which don't send CORP headers.
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            // Drop access to powerful features we never use.
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Rating',
            value: 'General',
          },
          {
            key: 'X-Content-Rating',
            value: 'safe',
          },
          // Content-Security-Policy is set per-request in proxy.ts so it can
          // carry a fresh script nonce (replaces the old 'unsafe-inline').
        ],
      },
      {
        // Admin & admin APIs must never be indexed, even if a URL leaks
        // externally (robots.txt disallow only blocks crawling, not indexing).
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
