'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Camera, MapPin, Calendar, Compass } from 'lucide-react';

interface FlightDataCardProps {
  onPaginate: (direction: number) => void;
  photoData?: {
    location: string;
    coordinates: string;
    altitude: string;
    date: string;
    camera: string;
    heading: string;
  };
}

export const FlightDataCard = memo(function FlightDataCard({ 
  onPaginate,
  photoData = {
    location: "Mt. Merbabu Summit",
    coordinates: "7°27'S 110°26'E",
    altitude: "3142M MSL",
    date: "2024-08-15",
    camera: "Sony A7III",
    heading: "045°"
  }
}: FlightDataCardProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      {/* Main Data Panel */}
      <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 overflow-hidden shadow-2xl">
        <div className="relative p-4 md:p-6">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Left Navigation */}
            <motion.button
              onClick={() => onPaginate(-1)}
              aria-label="Misi sebelumnya"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-[#6FD4E1]/40 text-[#6FD4E1] transition-all"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-[#6FD4E1]" aria-hidden="true" />
              <span className="hidden md:inline text-[#6FD4E1] text-sm font-mono">PREV MISSION</span>
            </motion.button>

            {/* Center Title */}
            <div className="text-center">
              <div className="text-xs md:text-sm text-[#B9E7E6] font-mono uppercase tracking-wider">MISSION DATA</div>
              <div className="text-[#FFFFFF] text-sm md:text-base font-mono font-semibold">{photoData.location}</div>
            </div>

            {/* Right Navigation */}
            <motion.button
              onClick={() => onPaginate(1)}
              aria-label="Misi berikutnya"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-[#6FD4E1]/40 text-[#6FD4E1] transition-all"
            >
              <span className="hidden md:inline text-[#6FD4E1] text-sm font-mono">NEXT MISSION</span>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[#6FD4E1]" aria-hidden="true" />
            </motion.button>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* GPS Coordinates */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#6FD4E1]" />
                <span className="text-xs text-[#B9E7E6] font-mono">GPS</span>
              </div>
              <div className="text-[#FFFFFF] font-mono text-xs md:text-sm font-semibold">{photoData.coordinates}</div>
            </div>

            {/* Altitude */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#6FD4E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <span className="text-xs text-[#B9E7E6] font-mono">ALT</span>
              </div>
              <div className="text-[#FFFFFF] font-mono text-xs md:text-sm font-semibold">{photoData.altitude}</div>
            </div>

            {/* Heading */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-[#6FD4E1]" />
                <span className="text-xs text-[#B9E7E6] font-mono">HDG</span>
              </div>
              <div className="text-[#FFFFFF] font-mono text-xs md:text-sm font-semibold">{photoData.heading}</div>
            </div>

            {/* Date */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#6FD4E1]" />
                <span className="text-xs text-[#B9E7E6] font-mono">DATE</span>
              </div>
              <div className="text-[#FFFFFF] font-mono text-xs md:text-sm font-semibold">{photoData.date}</div>
            </div>
          </div>

          {/* Camera Info */}
          <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#6FD4E1]" />
              <span className="text-xs text-[#B9E7E6] font-mono">CAMERA:</span>
              <span className="text-[#E2F4F3] font-mono text-xs md:text-sm">{photoData.camera}</span>
            </div>
          </div>
        </div>

        {/* Corner Brackets */}
        <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#6FD4E1]/50" />
        <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#6FD4E1]/50" />
        <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-b-2 border-[#6FD4E1]/50" />
        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-b-2 border-[#6FD4E1]/50" />
      </div>
    </motion.div>
  );
});
