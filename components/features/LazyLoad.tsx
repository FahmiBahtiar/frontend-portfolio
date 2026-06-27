'use client';

import { ComponentType, lazy, Suspense, ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component wrapper untuk lazy loading dengan suspense
 * Mengurangi initial bundle size dengan code splitting
 */
export function LazyLoad({ children, fallback = <div className="min-h-screen" /> }: LazyLoadProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

/**
 * Higher-order component untuk lazy load komponen berat
 * Usage: const HeavyComponent = lazyLoadComponent(() => import('./HeavyComponent'))
 */
export function lazyLoadComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc);

  const LazyLoaded = (props: P) => (
    <Suspense fallback={fallback || <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent" /></div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
  LazyLoaded.displayName = 'LazyLoaded';
  return LazyLoaded;
}
