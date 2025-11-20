'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AviationHUD } from '@/components/features/AviationHUD';
import { CockpitCarousel } from '@/components/features/CockpitCarousel';
import { FlightDataCard } from '@/components/features/FlightDataCard';
import { useGallery } from '@/lib/hooks/useGallery';

export function PageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use optimized gallery hook with automatic caching
  const { photos: missionPhotos, isLoading, isError } = useGallery();

  // Memoize current data to prevent unnecessary recalculations - BEFORE conditionals
  const currentBackground = useMemo(() => missionPhotos[currentIndex]?.image, [missionPhotos, currentIndex]);
  const currentPhotoData = useMemo(() => missionPhotos[currentIndex], [missionPhotos, currentIndex]);

  // Adapter for CockpitCarousel - memoized - BEFORE conditionals
  const carouselItems = useMemo(() => 
    missionPhotos.map((photo, index) => ({
      id: index,
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
    if (missionPhotos.length > 0) {
      const preloadImage = (index: number) => {
        if (missionPhotos[index]?.image) {
          const img = new Image();
          img.src = missionPhotos[index].image;
        }
      };

      // Preload next and previous images
      const nextIndex = (currentIndex + 1) % missionPhotos.length;
      const prevIndex = (currentIndex - 1 + missionPhotos.length) % missionPhotos.length;
      preloadImage(nextIndex);
      preloadImage(prevIndex);
    }
  }, [currentIndex, missionPhotos]);

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent mb-4"></div>
          <div className="text-cyan-400 font-mono text-sm">Loading mission photos...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">⚠️ Failed to load mission photos</div>
          <div className="text-white/60 text-sm">Please try again later</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (missionPhotos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-white font-mono">No mission photos available</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{
            backgroundImage: `url('${currentBackground}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: window.devicePixelRatio > 1.5 ? 'scroll' : 'fixed',
          }}
        />
      </AnimatePresence>

      {/* Background overlay with blur effect */}
      <div className="absolute inset-0 backdrop-blur-lg bg-black/40 z-[1]" />

      {/* Gradient overlay for aviation aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-[1]" />

      {/* Content */}
      <div className="relative z-[2] min-h-screen flex flex-col">
        {/* Aviation HUD Header */}
        <AviationHUD 
          currentIndex={currentIndex}
          totalImages={missionPhotos.length}
          location={currentPhotoData?.location || ''}
          altitude={currentPhotoData?.altitude || ''}
          coordinates={currentPhotoData?.coordinates || ''}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 px-2 md:px-4 py-4 md:py-8">
          {/* Cockpit Carousel */}
          <CockpitCarousel items={carouselItems} currentIndex={currentIndex} />

          {/* Flight Data Card */}
          <FlightDataCard 
            onPaginate={handlePaginate}
            photoData={currentPhotoData}
          />
        </div>

        {/* Mission Label - Bottom Left */}
        <div className="hidden md:block absolute bottom-8 left-8">
          <div className="space-y-1 font-mono">
            <div className="text-xs text-cyan-400/70">MISSION LOG</div>
            <div className="text-sm text-white/80">MOUNTAIN RECON</div>
            <div className="text-xs text-slate-400">PHOTOGRAPHY OPS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
