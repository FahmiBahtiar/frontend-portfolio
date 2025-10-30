'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AviationHUD } from '@/components/features/AviationHUD';
import { CockpitCarousel } from '@/components/features/CockpitCarousel';
import { FlightDataCard } from '@/components/features/FlightDataCard';

interface MissionPhoto {
  id: number;
  image: string;
  location: string;
  coordinates: string;
  altitude: string;
  date: string;
  camera: string;
  heading: string;
}

export function PageGallery() {
  const missionPhotos: MissionPhoto[] = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      location: "Mt. Merbabu Summit",
      coordinates: "7°27'S 110°26'E",
      altitude: "3142M MSL",
      date: "2024-08-15",
      camera: "Sony A7III",
      heading: "045°"
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1623622863859-2931a6c3bc80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtlciUyMG1vdW50YWluJTIwdHJhaWx8ZW58MXx8fHwxNzYxNjQxMzU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      location: "Mt. Semeru Trail",
      coordinates: "8°06'S 112°55'E",
      altitude: "2800M MSL",
      date: "2024-07-22",
      camera: "Canon EOS R5",
      heading: "180°"
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1640119947640-c88936e3b8da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHN1bW1pdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjE2NDIyMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      location: "Mt. Rinjani Peak",
      coordinates: "8°25'S 116°28'E",
      altitude: "3726M MSL",
      date: "2024-06-10",
      camera: "Sony A7III",
      heading: "270°"
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1671540225462-43b2eff8622f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGdyZWVufGVufDF8fHx8MTc2MTY0MjIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      location: "Mt. Bromo Valley",
      coordinates: "7°56'S 112°57'E",
      altitude: "2329M MSL",
      date: "2024-09-05",
      camera: "Nikon Z6II",
      heading: "090°"
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1630698515584-e419eaddc93c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMHN1bW1pdHxlbnwxfHx8fDE3NjE2NDE4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      location: "Mt. Lawu Summit",
      coordinates: "7°37'S 111°11'E",
      altitude: "3265M MSL",
      date: "2024-05-18",
      camera: "Sony A7III",
      heading: "315°"
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePaginate = (direction: number) => {
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + direction;
      if (nextIndex < 0) nextIndex = missionPhotos.length - 1;
      if (nextIndex >= missionPhotos.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const currentBackground = missionPhotos[currentIndex].image;
  const currentPhotoData = missionPhotos[currentIndex];

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
            backgroundAttachment: 'fixed',
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
          location={currentPhotoData.location}
          altitude={currentPhotoData.altitude}
          coordinates={currentPhotoData.coordinates}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 px-2 md:px-4 py-4 md:py-8">
          {/* Cockpit Carousel */}
          <CockpitCarousel items={missionPhotos} currentIndex={currentIndex} />

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

        {/* Status Indicator - Bottom Right */}
        <div className="hidden md:block absolute bottom-8 right-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-mono">SYSTEM NOMINAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
