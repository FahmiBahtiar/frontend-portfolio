'use client';

import { motion } from 'motion/react';
import { Plane, CloudSun } from 'lucide-react';
import { FlightLogbook } from '@/components/features/FlightLogbook';
import { AircraftHangar } from '@/components/features/AircraftHangar';
import { useIsLiteGraphics } from '@/components/providers/GraphicsModeProvider';
import { useIsMobile } from '@/components/ui/use-mobile';

interface Page4ExperienceProjectsProps {
  onNavigate?: (sectionIndex: number) => void;
}

export function Page4ExperienceProjects({ onNavigate }: Page4ExperienceProjectsProps = {}) {
  // Static radar rings on weak/mobile CPUs (the infinite pulse is decorative).
  const lite = useIsLiteGraphics();
  const isMobile = useIsMobile();
  const calm = lite || isMobile;
  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-12 md:py-16 pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Header - Aviation Control Tower */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Control Tower Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-[#6FD4E1]/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-sm text-[#6FD4E1]">
            <Plane className="w-10 h-10 text-[#6FD4E1]" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-[#FFFFFF] mb-4 tracking-tight">Experience and Projects</h2>
          <p className="text-[#E2F4F3]/80 text-lg max-w-2xl mx-auto mb-6">
            Professional journey and portfolio showcase
          </p>

          {/* Aviation Status Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-slate-900/80 border border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6FD4E1]" />
              <span className="text-xs text-[#E2F4F3] font-mono uppercase tracking-wider">All Systems Go</span>
            </div>
            <div className="w-px h-3.5 bg-slate-700" />
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-[#6FD4E1]" />
              <span className="text-xs text-[#B9E7E6] font-mono">VFR Conditions</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content - Two Sections */}
        <div className="space-y-12 md:space-y-16">
          {/* Section 1: Flight Logbook */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-slate-800" />
                <div className="px-4 py-1.5 rounded-lg bg-slate-900 border border-[#6FD4E1]/30">
                  <h3 className="text-[#6FD4E1] uppercase tracking-widest text-xs font-mono font-semibold">
                    <span aria-hidden="true">📋 </span>Experience
                  </h3>
                </div>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <p className="text-center text-[#B9E7E6] text-sm">
                Professional work experience and career journey
              </p>
            </div>
            
            <FlightLogbook />
          </motion.div>

          {/* Section 2: Aircraft Hangar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px flex-1 bg-slate-800" />
                <div className="px-4 py-1.5 rounded-lg bg-slate-900 border border-[#6FD4E1]/30">
                  <h3 className="text-[#6FD4E1] uppercase tracking-widest text-xs font-mono font-semibold">
                    <span aria-hidden="true">🛩️ </span>Projects
                  </h3>
                </div>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <p className="text-center text-[#B9E7E6] text-sm">
                GitHub projects, flight awards, and mountain expeditions
              </p>
            </div>
            
            <AircraftHangar />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
