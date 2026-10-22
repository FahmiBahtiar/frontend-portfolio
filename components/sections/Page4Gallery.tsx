'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AviationHUD } from '@/components/features/AviationHUD';
import { CockpitCarousel } from '@/components/features/CockpitCarousel';
import { FlightDataCard } from '@/components/features/FlightDataCard';
import { useGallery } from '@/lib/hooks/useGallery';
import { cld } from '@/lib/cloudinary';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';

export function PageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use optimized gallery hook with automatic caching
  const { photos: missionPhotos, isLoading, isError } = useGallery();

  // Memoize current data to prevent unnecessary recalculations. The full-bleed
  // background is a raw Cloudinary URL, so route it through cld() for an
  // optimized (WebP/AVIF, width-capped) delivery — it's not a next/image <Image>.
  const currentBackground = useMemo(() => {
    const src = missionPhotos[currentIndex]?.image;
    return src ? cld(src, { width: 1920 }) : src;
  }, [missionPhotos, currentIndex]);
  const currentPhotoData = useMemo(() => missionPhotos[currentIndex], [missionPhotos, currentIndex]);

  // Adapter for CockpitCarousel - memoized
  const carouselItems = useMemo(() => 
    missionPhotos.map((photo, index) => ({
      id: photo.id || index,
      image: photo.image,
    })),
    [missionPhotos]
  );

  const handlePaginate = useCallback((direction: number) => {
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + direction;
      if (nextIndex < 0) nextIndex = missionPhotos.length - 1;
      if (nextIndex >= missionPhotos.length) nextIndex = 0;
      return nextIndex;
    });
  }, [missionPhotos.length]);

  // Preload adjacent images for smoother transitions
  useEffect(() => {
    if (!missionPhotos.length) return;

    let isMounted = true;
    const preloadImage = (index: number) => {
      const src = missionPhotos[index]?.image;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    };

    const nextIndex = (currentIndex + 1) % missionPhotos.length;
    const prevIndex = (currentIndex - 1 + missionPhotos.length) % missionPhotos.length;
    
    // Defer preloading slightly to not block the main thread during animations
    const timer = setTimeout(() => {
      if (isMounted) {
        preloadImage(nextIndex);
        preloadImage(prevIndex);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentIndex, missionPhotos]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePaginate(-1);
      if (e.key === 'ArrowRight') handlePaginate(1);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePaginate]);

  // Loading state with HUD theme
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E2F4F3] flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 p-8 border border-[#B9E7E6] bg-white/95 backdrop-blur-md rounded-2xl relative shadow-xl">
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#6FD4E1]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#6FD4E1]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#6FD4E1]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#6FD4E1]" />
          
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#0891b2] animate-spin mx-auto mb-4" />
          <div className="text-[#0c282d] font-mono text-xs md:text-sm tracking-[0.25em] font-bold">ESTABLISHING LINK</div>
          <div className="text-[#527d85] font-mono text-[10px] md:text-xs mt-2 tracking-widest font-semibold">DOWNLOADING MISSION INTELLIGENCE</div>
        </div>
      </div>
    );
  }

  // Error state with HUD theme
  if (isError) {
    return (
      <div className="min-h-screen bg-[#E2F4F3] flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 p-8 border border-red-500/30 bg-white/95 backdrop-blur-md rounded-2xl relative shadow-xl">
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-red-500" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-red-500" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-red-500" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-red-500" />
          
          <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-4 opacity-80" />
          <div className="text-red-500 font-mono text-xs md:text-sm tracking-[0.25em] font-bold">SIGNAL LOST</div>
          <div className="text-[#527d85] font-mono text-[10px] md:text-xs mt-2 tracking-widest font-semibold">ERR: MISSION_DATA_UNAVAILABLE</div>
        </div>
      </div>
    );
  }

  // Empty state with HUD theme
  if (missionPhotos.length === 0) {
    return (
      <div className="min-h-screen bg-[#E2F4F3] flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 p-8 border border-[#B9E7E6] bg-white/95 backdrop-blur-md rounded-2xl relative shadow-xl">
          <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-[#0891b2] mx-auto mb-4 opacity-80" />
          <div className="text-[#0c282d] font-mono text-xs md:text-sm tracking-[0.2em] font-bold">NO TARGETS FOUND</div>
          <div className="text-[#527d85] font-mono text-[10px] md:text-xs mt-2 tracking-widest font-semibold">AWAITING NEW MISSION DATA</div>
        </div>
      </div>
    );
  }

  return (
    <section 
      className="relative min-h-screen w-full bg-[#E2F4F3] overflow-x-hidden overflow-y-auto select-none outline-none"
      aria-label="Mission Intelligence Gallery"
      tabIndex={0}
    >
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="fixed inset-0 origin-center"
          initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          animate={{ opacity: 0.35, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundImage: `url('${currentBackground}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: typeof window !== 'undefined' && window.devicePixelRatio > 1.5 ? 'scroll' : 'fixed',
          }}
          aria-hidden="true"
        />
      </AnimatePresence>

      {/* Frosted Ice Light Overlays */}
      <div className="fixed inset-0 backdrop-blur-2xl bg-[#E2F4F3]/85 z-[1] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#E2F4F3]/95 via-transparent to-[#E2F4F3]/95 z-[1] pointer-events-none" />
      
      {/* Light Scanline / Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-10 bg-[linear-gradient(transparent_50%,rgba(111,212,225,0.4)_50%)] bg-[size:100%_4px]" />

      {/* Background Scanning Sweep — subtle ice cyan shimmer */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent via-[#6FD4E1]/15 to-transparent"
          initial={false}
          animate={{ y: ['-20vh', '120vh'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
      </div>

      {/* Soft Ice Ambient Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[2] shadow-[inset_0_0_120px_rgba(111,212,225,0.15)]" />

      {/* Content */}
      <main className="relative z-[10] min-h-[100dvh] flex flex-col pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)]">
        {/* Aviation HUD Header */}
        <header className="shrink-0 w-full">
          <AviationHUD 
            currentIndex={currentIndex}
            totalImages={missionPhotos.length}
            location={currentPhotoData?.location || ''}
            altitude={currentPhotoData?.altitude || ''}
            coordinates={currentPhotoData?.coordinates || ''}
          />
        </header>

        {/* Tactical Display Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 px-2 md:px-6 w-full max-w-[1920px] mx-auto">
          {/* Cockpit Carousel - The primary visual interface */}
          <div className="w-full relative">
            <CockpitCarousel items={carouselItems} currentIndex={currentIndex} />
          </div>

          {/* Flight Data Card - The secondary info interface */}
          <div className="w-full relative z-20">
            <FlightDataCard 
              onPaginate={handlePaginate}
              photoData={currentPhotoData}
            />
          </div>
        </div>

        {/* UI Decorative Elements - HUD Borders & Safe Zones */}
        <div className="pointer-events-none absolute inset-x-4 top-4 bottom-4 border border-[#B9E7E6] rounded-3xl hidden lg:block" />
        
        {/* Bottom Left: Mission Classification */}
        <div className="hidden lg:flex absolute bottom-8 left-8 items-end gap-4 pointer-events-none z-20">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-[#6FD4E1] animate-pulse" />
              <span className="text-xs text-[#0891b2] tracking-widest font-bold border-b border-[#B9E7E6] pb-0.5">TACTICAL LOG</span>
            </div>
            <div className="text-sm text-[#0c282d] font-bold tracking-wide mt-1">AERIAL RECONNAISSANCE</div>
            <div className="text-xs text-[#527d85] font-semibold capitalize tracking-widest">
              CLASS: TOP SECRET // COMPARTMENTED
            </div>
          </div>
        </div>

        {/* Bottom Right: Timestamp & Sync */}
        <div className="hidden lg:flex absolute bottom-8 right-8 flex-col items-end gap-1 font-mono pointer-events-none z-20">
          <div className="text-xs text-[#0891b2] tracking-widest font-bold border-b border-[#B9E7E6] pb-0.5">SYS_SYNC_OK</div>
          <div className="text-sm text-[#0c282d] font-bold">{new Date(currentPhotoData?.date || Date.now()).toISOString().split('T')[0]}</div>
          <div className="text-xs text-[#527d85] font-semibold flex items-center gap-2">
            <span>UPLINK: ENCRYPTED</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </main>
    </section>
  );
}
