// Performance monitoring utilities for Next.js

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
}

export const reportWebVitals = (metric: WebVitalsMetric) => {
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics, Vercel Analytics, etc.
    const { name, value, id } = metric;
    
    // You can send to your analytics service here
    // Example: window.gtag?.('event', name, metric_id: id });
  }
};

// Measure component render time
export const measurePerformance = (componentName: string, callback: () => void) => {
  if (typeof window === 'undefined') return callback();
  
  const start = performance.now();
  callback();
  const end = performance.now();
  
};

// Debounce helper for scroll/resize events
export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle helper for high-frequency events
export const throttle = <T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
