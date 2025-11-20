'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    }

    // Send to analytics (optional - implement your analytics here)
    // Example: sendToAnalytics(metric);
    
    // You can send to your preferred analytics service:
    // - Google Analytics
    // - Vercel Analytics  
    // - Custom endpoint
    
    switch (metric.name) {
      case 'FCP': // First Contentful Paint
        // Track when first content is rendered
        break;
      case 'LCP': // Largest Contentful Paint
        // Track when largest content is rendered
        break;
      case 'CLS': // Cumulative Layout Shift
        // Track visual stability
        break;
      case 'FID': // First Input Delay
        // Track interactivity
        break;
      case 'TTFB': // Time to First Byte
        // Track server response time
        break;
      case 'INP': // Interaction to Next Paint
        // Track responsiveness
        break;
    }
  });

  return null;
}
