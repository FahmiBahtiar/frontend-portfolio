'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { SpotifyService } from '@/lib/services/spotify';
import { apiRequestWithRetry, API_CONFIG, ApiResponse } from '@/lib/api';
import { preloadAllSections } from '@/lib/services/prefetch';

// Eager load hero & command bar so they are pre-rendered underneath loading screen
import { Page1Hero } from '@/components/sections/Page1Hero';
import { MinimalistCommandBar } from '@/components/features/MinimalistCommandBar';
import { LoadingScreen } from '@/components/features/LoadingScreen';

// Lazy load below-the-fold components to preserve low TBT on mobile
const Page2Portfolio = dynamic(() => import('@/components/sections/Page2Portfolio').then(mod => ({ default: mod.Page2Portfolio })));
const Page3Education = dynamic(() => import('@/components/sections/Page3Education').then(mod => ({ default: mod.Page3Education })));
const Page4ExperienceProjects = dynamic(() => import('@/components/sections/Page4ExperienceProjects').then(mod => ({ default: mod.Page4ExperienceProjects })));
const Page5Contact = dynamic(() => import('@/components/sections/Page5Contact').then(mod => ({ default: mod.Page5Contact })));
const PageGallery = dynamic(() => import('@/components/sections/Page4Gallery').then(mod => ({ default: mod.PageGallery })), {
  ssr: false,
});
const Footer = dynamic(() => import('@/components/layout/Footer'));

/**
 * Mounts a section only once it scrolls near the viewport. The wrapper div
 * always renders at full height (min-h-screen) so layout is reserved (no CLS)
 * and the scroll-spy observer / nav scrollIntoView keep working — only the
 * section's children (its data fetches, JS, animations) are deferred. This
 * keeps off-screen sections out of the initial main-thread crunch, which is the
 * dominant TBT/long-tasks cost on mobile. `eager` keeps the hero immediate.
 */
function LazySection({
  id,
  index,
  eager,
  registerRef,
  children,
}: {
  id: string;
  index: number;
  eager: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '400px' });
  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      ref.current = el;
      registerRef(el);
    },
    [registerRef],
  );
  return (
    <div
      id={id}
      ref={setRefs}
      className="min-h-screen"
      style={{
        contentVisibility: index > 1 && !eager ? 'auto' : 'visible',
        containIntrinsicSize: index > 1 && !eager ? 'auto 1000px' : 'none',
      }}
    >
      {(eager || inView) && children}
    </div>
  );
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const sectionsLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sections = [
    { id: 'hero', name: 'Hero', component: Page1Hero },
    { id: 'about', name: 'About', component: Page2Portfolio },
    { id: 'education', name: 'Education', component: Page3Education },
    { id: 'experience', name: 'Experience', component: Page4ExperienceProjects },
    { id: 'contact', name: 'Contact', component: Page5Contact },
  ];

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Prefetch hero data early to avoid loading issues
  useEffect(() => {
    const prefetchData = async () => {
      setApiError(null);
      setIsWarmingUp(false);

      // Non-critical: warm Spotify in the background — do NOT block content.
      SpotifyService.getNowPlaying().catch(() => null);

      // Defer preloading below-the-fold sections to idle time so Hero gets 100% network & CPU priority
      if (typeof window !== 'undefined') {
        const deferPreload = () => preloadAllSections();
        const win = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
        if (typeof win.requestIdleCallback === 'function') {
          win.requestIdleCallback(deferPreload, { timeout: 3500 });
        } else {
          setTimeout(deferPreload, 1500);
        }
      }

      try {
        // Only the hero data gates the loading->content transition.
        await Promise.all([
          apiRequestWithRetry<ApiResponse<unknown>>(
            API_CONFIG.PUBLIC_ENDPOINTS.HERO_PROFILE,
            {},
            4,
            {
              onWarmingUp: () => setIsWarmingUp(true),
              onSuccess: () => setIsWarmingUp(false),
            },
          ),
          apiRequestWithRetry<ApiResponse<unknown>>(
            API_CONFIG.PUBLIC_ENDPOINTS.HERO_SOCIAL,
            {},
            4,
          ),
        ]);

        setIsApiLoaded(true);
        setIsWarmingUp(false);
      } catch (error) {
        console.error('Failed to prefetch API data:', error);
        setIsWarmingUp(false);
        setApiError('Unable to connect to server. Please try again later.');
        setIsApiLoaded(false);
      }
    };

    prefetchData();
  }, []);


  useEffect(() => {
    return () => {
      if (sectionsLoadTimeoutRef.current) {
        clearTimeout(sectionsLoadTimeoutRef.current);
      }
    };
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    if (sectionsLoadTimeoutRef.current) {
      clearTimeout(sectionsLoadTimeoutRef.current);
    }
  };

  const handleNavigate = (sectionIndex: number) => {
    // 1. Ensure all sections are mounted in DOM when user navigates via menu
    setSectionsLoaded(true);

    const targetSection = sectionRefs.current[sectionIndex];
    if (!targetSection) return;

    // Use requestAnimationFrame to ensure smooth coordinate calculation
    requestAnimationFrame(() => {
      const navOffset = sectionIndex === 0 ? 0 : 50; // Offset for floating command bar
      const targetRect = targetSection.getBoundingClientRect();
      const targetY = Math.max(0, targetRect.top + window.scrollY - navOffset);
      const startY = window.scrollY;
      const distance = targetY - startY;

      if (Math.abs(distance) < 5) return;

      // Dynamic duration based on travel distance (between 450ms and 950ms)
      const duration = Math.min(950, Math.max(450, Math.abs(distance) * 0.35));
      let startTime: number | null = null;

      // Silky-smooth cubic bezier easing
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      let isCancelled = false;

      const onUserInterrupt = () => {
        isCancelled = true;
        window.removeEventListener('wheel', onUserInterrupt);
        window.removeEventListener('touchstart', onUserInterrupt);
      };

      window.addEventListener('wheel', onUserInterrupt, { passive: true });
      window.addEventListener('touchstart', onUserInterrupt, { passive: true });

      const step = (currentTime: number) => {
        if (isCancelled) return;
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const ease = easeInOutCubic(progress);

        window.scrollTo(0, startY + distance * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          window.removeEventListener('wheel', onUserInterrupt);
          window.removeEventListener('touchstart', onUserInterrupt);
        }
      };

      requestAnimationFrame(step);
    });
  };

  const handleGalleryToggle = () => {
    setShowGallery(prev => !prev);
  };

  // Lock body scroll while loading screen is active to prevent scroll jumps
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  // Optimized scroll spy with Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.current.findIndex(ref => ref === entry.target);
          if (index !== -1) {
            setActiveSection(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [sectionsLoaded]);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        Skip to main content
      </a>

      {/* Loading Screen Overlay */}
      {isLoading && (
        <LoadingScreen
          onComplete={handleLoadingComplete}
          isApiLoaded={isApiLoaded}
          isWarmingUp={isWarmingUp}
          apiError={apiError}
        />
      )}

      {/* Main App - Pre-rendered underneath loading screen for seamless zero-flicker reveal */}
      <div 
        className={`relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#E2F4F3] text-[#0c282d] transition-opacity duration-500 ${
          isLoading ? 'pointer-events-none select-none max-h-screen overflow-hidden' : ''
        }`}
        style={{
          visibility: isLoading ? 'hidden' : 'visible',
          opacity: isLoading ? 0 : 1,
        }}
      >
        {/* Main Content - All sections stacked vertically */}
        <main id="main-content" tabIndex={-1} className="flex-1 relative z-[2] focus:outline-none">
          {sections.map((section, index) => {
            const SectionComponent = section.component;
            return (
              <LazySection
                key={section.id}
                id={section.id}
                index={index}
                eager={index === 0 || sectionsLoaded}
                registerRef={(el) => {
                  sectionRefs.current[index] = el;
                }}
              >
                <SectionComponent 
                  onNavigate={handleNavigate} 
                  isReady={section.id === 'hero' ? !isLoading : true}
                />
              </LazySection>
            );
          })}
        </main>

        {/* Footer sits flush at the very bottom */}
        <Footer />

        {/* Gallery Modal/Overlay */}
        <AnimatePresence mode="wait">
          {showGallery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-0 z-[100]"
            >
              <PageGallery />
              
              {/* Close button */}
              <motion.button
                onClick={handleGalleryToggle}
                aria-label="Close gallery"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed top-6 right-6 z-[101] w-12 h-12 rounded-xl bg-white/95 border border-[#B9E7E6] hover:border-[#6FD4E1] transition-all duration-300 flex items-center justify-center shadow-lg group will-change-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="text-[#0c282d] group-hover:text-[#0891b2] text-2xl font-light transition-colors duration-300" aria-hidden="true">✕</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimalist Command Bar - All devices */}
        <MinimalistCommandBar 
          activeSection={activeSection} 
          onNavigate={handleNavigate} 
          onGalleryToggle={handleGalleryToggle}
          totalSections={sections.length} 
        />
      </div>
    </>
  );
}
