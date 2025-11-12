import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['motion', 'lucide-react', '@radix-ui/react-accordion'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error'] }
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
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
