'use client';

import { motion } from 'motion/react';
import { Plane, CloudSun } from 'lucide-react';
import { FlightLogbook } from '@/components/features/FlightLogbook';
import { AircraftHangar } from '@/components/features/AircraftHangar';

interface Page4ExperienceProjectsProps {
  onNavigate?: (sectionIndex: number) => void;
}

export function Page4ExperienceProjects({ onNavigate }: Page4ExperienceProjectsProps = {}) {
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
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="relative inline-flex items-center justify-center w-20 h-20 mb-6"
          >
            {/* Radar Circle */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-orange-400/30"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-cyan-400/30"
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5
              }}
            />
            
            {/* Center Icon */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/30 to-cyan-500/30 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
              <Plane className="w-8 h-8 text-orange-400" />
            </div>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Experience and Projects</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
            Professional journey and portfolio showcase
          </p>

          {/* Aviation Status Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/10 via-cyan-500/10 to-orange-500/10 border border-white/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-mono uppercase tracking-wider">All Systems Go</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white/60 font-mono">VFR Conditions</span>
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
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-400/30">
                  <span className="text-orange-400 uppercase tracking-widest text-sm font-mono">
                    📋 Experience
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
              </div>
              <p className="text-center text-white/50 text-sm">
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
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-400/30">
                  <span className="text-cyan-400 uppercase tracking-widest text-sm font-mono">
                    🛩️ Projects
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              </div>
              <p className="text-center text-white/50 text-sm">
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
