'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { Crosshair, Navigation, Mountain } from 'lucide-react';

interface AviationHUDProps {
  currentIndex: number;
  totalImages: number;
  location?: string;
  altitude?: string;
  coordinates?: string;
}

export const AviationHUD = memo(function AviationHUD({ 
  currentIndex, 
  totalImages, 
  location = "Mt. Merbabu",
  altitude = "3142M MSL",
  coordinates = "7°27'S 110°26'E"
}: AviationHUDProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative px-4 md:px-8 py-4 md:py-6"
    >
      {/* Main HUD Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Top HUD Bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mission Status */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs md:text-sm font-mono">MISSION ACTIVE</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/70 text-sm font-mono">
              <Crosshair className="w-4 h-4" />
              <span>PHOTO {String(currentIndex + 1).padStart(3, '0')}/{String(totalImages).padStart(3, '0')}</span>
            </div>
          </div>

          {/* Center: Location */}
          <div className="hidden md:block">
            <div className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/20">
              <div className="flex items-center gap-2 text-white font-mono text-sm">
                <Mountain className="w-4 h-4 text-cyan-400" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          {/* Right: Altitude & Coords */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:block px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20">
              <div className="text-xs text-slate-400 font-mono">ALT</div>
              <div className="text-cyan-400 font-mono text-sm">{altitude}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/20">
              <div className="text-xs text-slate-400 font-mono hidden md:block">GPS</div>
              <div className="text-cyan-400 font-mono text-xs md:text-sm">{coordinates}</div>
            </div>
          </div>
        </div>

        {/* Mobile Mission Counter */}
        <div className="md:hidden mt-2 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white/70 text-xs font-mono">
            <Crosshair className="w-3 h-3" />
            <span>PHOTO {String(currentIndex + 1).padStart(3, '0')}/{String(totalImages).padStart(3, '0')}</span>
          </div>
        </div>

        {/* Corner Reticles */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400/40" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400/40" />
      </div>
    </motion.div>
  );
});
