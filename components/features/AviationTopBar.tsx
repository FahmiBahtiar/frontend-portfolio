'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  Plane, 
  Camera, 
  Activity,
  Radio,
  Gauge,
  Compass
} from 'lucide-react';

interface AviationTopBarProps {
  activeSection: number;
  onNavigate: (index: number) => void;
  onGalleryToggle: () => void;
  totalSections: number;
}

export function AviationTopBar({ 
  activeSection, 
  onNavigate, 
  onGalleryToggle,
  totalSections 
}: AviationTopBarProps) {
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollYProgress } = useScroll();

  const sections = [
    { id: 0, name: 'HERO', frequency: '118.5', heading: '000°' },
    { id: 1, name: 'ABOUT', frequency: '121.5', heading: '090°' },
    { id: 2, name: 'EDUCATION', frequency: '124.2', heading: '180°' },
    { id: 3, name: 'EXPERIENCE', frequency: '128.8', heading: '270°' },
    { id: 4, name: 'CONTACT', frequency: '132.4', heading: '360°' },
  ];

  // Calculate altitude based on scroll (0-5000ft)
  const altitude = useTransform(scrollYProgress, [0, 1], [0, 5000]);
  
  // Calculate scroll velocity
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = Math.abs(currentScrollY - lastScrollY);
      setScrollVelocity(Math.min(velocity * 10, 999)); // Cap at 999 knots
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Decay velocity over time
  useEffect(() => {
    const timer = setTimeout(() => {
      setScrollVelocity(prev => Math.max(0, prev * 0.9));
    }, 50);
    return () => clearTimeout(timer);
  }, [scrollVelocity]);

  const currentSection = sections[activeSection];

  return (
    <>
      {/* Desktop HUD Top Bar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        className="hidden lg:block fixed top-0 left-0 right-0 z-50"
      >
        {/* Main HUD Container */}
        <div className="relative">
          {/* Background blur bar */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-transparent backdrop-blur-xl" />
          
          {/* Border line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          
          {/* Content */}
          <div className="relative px-8 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
              
              {/* LEFT: Altimeter & Compass */}
              <div className="flex items-center gap-6">
                {/* Altimeter */}
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative w-12 h-12">
                    {/* Circular gauge background */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="rgba(34, 211, 238, 0.2)"
                        strokeWidth="2"
                        fill="none"
                      />
                      <motion.circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="rgb(34, 211, 238)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        style={{
                          strokeDashoffset: useTransform(
                            scrollYProgress,
                            [0, 1],
                            [2 * Math.PI * 20, 0]
                          ),
                        }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 font-mono uppercase tracking-wider">Altitude</div>
                    <motion.div className="text-lg text-cyan-400 font-mono tabular-nums">
                      {altitude.get().toFixed(0)} ft
                    </motion.div>
                  </div>
                </motion.div>

                {/* Divider */}
                <div className="w-[1px] h-12 bg-white/10" />

                {/* Compass/Heading */}
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-orange-400/30 bg-orange-500/10 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: parseInt(currentSection.heading) }}
                        transition={{ type: 'spring', stiffness: 100 }}
                      >
                        <Compass className="w-5 h-5 text-orange-400" />
                      </motion.div>
                    </div>
                    {/* Cardinal points */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-orange-400 font-mono">N</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 font-mono uppercase tracking-wider">Heading</div>
                    <div className="text-lg text-orange-400 font-mono tabular-nums">
                      {currentSection.heading}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* CENTER: Active Section Radio Display */}
              <motion.div 
                className="flex-1 max-w-md"
                layout
              >
                <div className="relative group cursor-pointer">
                  {/* Radio frequency display */}
                  <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/90 to-slate-800/80 border border-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Radio className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-0.5">
                            Active Frequency
                          </div>
                          <div className="text-sm text-green-400 font-mono tracking-wider">
                            {currentSection.frequency} MHz
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center">
                        <div className="text-white font-mono tracking-widest">
                          {currentSection.name}
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          SECTION {activeSection + 1}/{totalSections}
                        </div>
                      </div>

                      {/* Signal indicator */}
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all ${
                              i < 4 ? 'bg-green-400 h-3' : 'bg-white/20 h-2'
                            }`}
                            style={{ height: `${(i + 1) * 3}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown section selector */}
                  <motion.div
                    initial={false}
                    className="absolute top-full left-0 right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                  >
                    <div className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-lg p-2 shadow-2xl">
                      {sections.map((section, index) => (
                        <motion.button
                          key={section.id}
                          onClick={() => onNavigate(index)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all font-mono text-sm ${
                            activeSection === index
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <span>{section.name}</span>
                          <span className="text-xs opacity-60">{section.frequency}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* RIGHT: Speed & Mission Control */}
              <div className="flex items-center gap-6">
                {/* Speed Indicator */}
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 bg-purple-500/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50 font-mono uppercase tracking-wider">Speed</div>
                    <motion.div 
                      className="text-lg text-purple-400 font-mono tabular-nums"
                      animate={{ 
                        color: scrollVelocity > 100 ? '#f97316' : '#c084fc' 
                      }}
                    >
                      {Math.round(scrollVelocity)} kt
                    </motion.div>
                  </div>
                </motion.div>

                {/* Divider */}
                <div className="w-[1px] h-12 bg-white/10" />

                {/* Mission Control (Gallery) Button */}
                <motion.button
                  onClick={onGalleryToggle}
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative flex items-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-400/30 hover:border-orange-400/60 transition-all overflow-hidden">
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                    
                    <div className="relative flex items-center gap-3">
                      <Camera className="w-5 h-5 text-orange-400" />
                      <div className="text-left">
                        <div className="text-xs text-orange-400/80 font-mono uppercase tracking-wider">
                          Mission
                        </div>
                        <div className="text-sm text-white font-mono">
                          Gallery
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400"
              style={{
                width: useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Mobile Top Bar (Simplified) */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        className="lg:hidden fixed top-0 left-0 right-0 z-50"
      >
        <div className="relative">
          {/* Background */}
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          
          {/* Content */}
          <div className="relative px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Mini altimeter */}
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="rgba(34, 211, 238, 0.2)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <motion.circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="rgb(34, 211, 238)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      style={{
                        strokeDashoffset: useTransform(
                          scrollYProgress,
                          [0, 1],
                          [2 * Math.PI * 14, 0]
                        ),
                      }}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="text-xs text-cyan-400 font-mono">
                  {Math.round(altitude.get() / 100) * 100}ft
                </div>
              </div>

              {/* Center: Section name */}
              <div className="flex-1 text-center">
                <div className="text-sm text-white font-mono tracking-wider">
                  {currentSection.name}
                </div>
                <div className="text-[9px] text-white/40 font-mono">
                  {currentSection.frequency} MHz
                </div>
              </div>

              {/* Right: Gallery button */}
              <motion.button
                onClick={onGalleryToggle}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-pink-500/30 border border-orange-400/40 flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
              >
                <Camera className="w-5 h-5 text-orange-400" />
              </motion.button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400"
              style={{
                width: useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
              }}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
