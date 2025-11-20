'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { HeroService } from '@/lib/services/hero';
import { SpotifyService } from '@/lib/services/spotify';

// Lazy load components untuk mengurangi initial bundle
const LoadingScreen = dynamic(() => import('@/components/features/LoadingScreen').then(mod => ({ default: mod.LoadingScreen })), {
  ssr: false,
});

const MinimalistCommandBar = dynamic(() => import('@/components/features/MinimalistCommandBar').then(mod => ({ default: mod.MinimalistCommandBar })), {
  ssr: false,
});

const Page1Hero = dynamic(() => import('@/components/sections/Page1Hero').then(mod => ({ default: mod.Page1Hero })), {
  loading: () => <div className="min-h-screen bg-slate-900" />
});
const Page2Portfolio = dynamic(() => import('@/components/sections/Page2Portfolio').then(mod => ({ default: mod.Page2Portfolio })));
const Page3Education = dynamic(() => import('@/components/sections/Page3Education').then(mod => ({ default: mod.Page3Education })));
const Page4ExperienceProjects = dynamic(() => import('@/components/sections/Page4ExperienceProjects').then(mod => ({ default: mod.Page4ExperienceProjects })));
const Page5Contact = dynamic(() => import('@/components/sections/Page5Contact').then(mod => ({ default: mod.Page5Contact })));
const PageGallery = dynamic(() => import('@/components/sections/Page4Gallery').then(mod => ({ default: mod.PageGallery })), {
  ssr: false,
});
const Footer = dynamic(() => import('@/components/layout/Footer'));

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const sections = [
    { id: 'hero', name: 'Hero', component: Page1Hero },
    { id: 'about', name: 'About', component: Page2Portfolio },
    { id: 'education', name: 'Education', component: Page3Education },
    { id: 'experience', name: 'Experience', component: Page4ExperienceProjects },
    { id: 'contact', name: 'Contact', component: Page5Contact },
  ];

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Skip to main content for accessibility
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    mainContent?.focus();
  };

  // Prefetch hero data early to avoid loading issues
  useEffect(() => {
    const prefetchData = async () => {
      try {
        setApiError(null);
        // Prefetch all required API data
        await Promise.all([
          HeroService.getHeroProfile(),
          HeroService.getSocialLinks(),
          SpotifyService.getNowPlaying(),
        ]);
        setIsApiLoaded(true);
      } catch (error) {
        console.error('Failed to prefetch API data:', error);
        setApiError('Failed to connect to API server. Please check your connection and try again.');
        setIsApiLoaded(false);
      }
    };

    prefetchData();

    // Listen for retry events from LoadingScreen
    const retryHandler = () => {
      prefetchData();
    };
    window.addEventListener('loading-screen-retry', retryHandler as EventListener);

    return () => {
      window.removeEventListener('loading-screen-retry', retryHandler as EventListener);
    };
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Preload sections after loading screen
    setTimeout(() => setSectionsLoaded(true), 100);
  };

  const handleNavigate = (sectionIndex: number) => {
    const targetSection = sectionRefs.current[sectionIndex];
    if (targetSection) {
      targetSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const handleGalleryToggle = () => {
    setShowGallery(!showGallery);
  };

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

      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen
            onComplete={handleLoadingComplete}
            isApiLoaded={isApiLoaded}
            apiError={apiError}
          />
        )}
      </AnimatePresence>

      {/* Main App - Only render after loading is complete */}
      {!isLoading && (
        <div className="relative w-full overflow-x-hidden bg-slate-900">
          {/* Background gradient */}
          <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 pointer-events-none" aria-hidden="true" />
          
          {/* Animated background overlay */}
          <div className="fixed inset-0 md:backdrop-blur-sm bg-black/10 pointer-events-none z-[1]" aria-hidden="true" />

          {/* Main Content - All sections stacked vertically */}
          <main id="main-content" tabIndex={-1} className="relative z-[2] focus:outline-none">
            {sections.map((section, index) => {
              const SectionComponent = section.component;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    sectionRefs.current[index] = el;
                  }}
                  className="min-h-screen"
                  style={{
                    contentVisibility: index > 1 ? 'auto' : 'visible',
                    containIntrinsicSize: index > 1 ? '0 800px' : 'none',
                  }}
                >
                  {index === 0 ? (
                    <SectionComponent onNavigate={handleNavigate} />
                  ) : (
                    <SectionComponent onNavigate={handleNavigate} />
                  )}
                </div>
              );
            })}
          </main>

          {/* Footer */}
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
                  className="fixed top-6 right-6 z-[101] w-12 h-12 rounded-xl bg-slate-900/90 md:backdrop-blur-xl border border-white/10 hover:bg-slate-800/90 hover:border-pink-400/50 transition-all duration-300 flex items-center justify-center shadow-xl group will-change-transform"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <span className="text-white/60 group-hover:text-pink-400 text-2xl font-light transition-colors duration-300" aria-hidden="true">✕</span>
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
      )}
    </>
  );
}
