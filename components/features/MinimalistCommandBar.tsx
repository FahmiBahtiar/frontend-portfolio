'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Camera, Plane, User, GraduationCap, Briefcase, Mail } from 'lucide-react';

interface MinimalistCommandBarProps {
  activeSection: number;
  onNavigate: (index: number) => void;
  onGalleryToggle: () => void;
  totalSections: number;
}

interface SectionConfig {
  id: number;
  name: string;
  code: string;
  icon: any;
  color: string;
}

export function MinimalistCommandBar({ 
  activeSection, 
  onNavigate, 
  onGalleryToggle,
  totalSections 
}: MinimalistCommandBarProps) {
  const { scrollYProgress } = useScroll();
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);

  const sections: SectionConfig[] = [
    { id: 0, name: 'Hero', code: 'HRO', icon: Plane, color: '#22d3ee' }, // cyan
    { id: 1, name: 'About', code: 'ABT', icon: User, color: '#a78bfa' }, // purple
    { id: 2, name: 'Education', code: 'EDU', icon: GraduationCap, color: '#60a5fa' }, // blue
    { id: 3, name: 'Experience', code: 'EXP', icon: Briefcase, color: '#34d399' }, // emerald
    { id: 4, name: 'Contact', code: 'CNT', icon: Mail, color: '#fb923c' }, // orange
  ];

  // Optimized scroll velocity calculation with RAF
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const velocity = Math.abs(currentScrollY - lastScrollY);
          setScrollVelocity(Math.min(velocity * 2, 100));
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Decay velocity with RAF for smoothness
  useEffect(() => {
    if (scrollVelocity > 0) {
      const frame = requestAnimationFrame(() => {
        setScrollVelocity(prev => Math.max(0, prev * 0.9));
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [scrollVelocity]);

  const altitudeRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <>
      {/* Desktop Command Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          delay: 0.2, 
          type: 'spring', 
          stiffness: 300, 
          damping: 30,
          mass: 0.8
        }}
        className="hidden lg:block fixed top-6 left-1/2 -translate-x-1/2 z-50 will-change-transform"
      >
        <div className="relative">
          {/* Main Bar Container */}
          <div className="relative bg-slate-900/80 md:backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl px-6 py-3">
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-cyan-500/5" />
            
            <div className="relative flex items-center gap-8">
              {/* Left: Brand Name / Callsign */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {/* Aviation-style brand badge */}
                <div className="relative">
                  <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30">
                    <div className="text-sm font-mono font-semibold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                      BLIMBING
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-cyan-400/10 md:blur-md -z-10" />
                </div>
              </motion.div>

              {/* Separator */}
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

              {/* Altimeter Indicator */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  {/* Rotating outer ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                    style={{ rotate: altitudeRotation }}
                  >
                    {/* Tick marks */}
                    <div className="absolute top-0 left-1/2 w-0.5 h-1.5 bg-cyan-400 -translate-x-1/2" />
                    <div className="absolute bottom-0 left-1/2 w-0.5 h-1.5 bg-cyan-400 -translate-x-1/2" />
                    <div className="absolute left-0 top-1/2 w-1.5 h-0.5 bg-cyan-400 -translate-y-1/2" />
                    <div className="absolute right-0 top-1/2 w-1.5 h-0.5 bg-cyan-400 -translate-y-1/2" />
                  </motion.div>
                  
                  {/* Center circle */}
                  <div className="absolute inset-2 rounded-full bg-slate-800 border border-cyan-400/50 flex items-center justify-center">
                    <div className="text-[10px] font-mono text-cyan-400">
                      {Math.round(scrollYProgress.get() * 100)}
                    </div>
                  </div>

                  {/* Glow */}
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 md:blur-md -z-10" />
                </div>

                {/* Altitude Label */}
                <div className="flex flex-col">
                  <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    Progress
                  </div>
                  <div className="text-xs text-cyan-400 font-mono tabular-nums">
                    {Math.round(scrollYProgress.get() * 100)}%
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

              {/* Center: Section Navigation */}
              <div className="flex items-center gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => onNavigate(section.id)}
                      aria-label={`Navigate to ${section.name} section`}
                      aria-current={isActive ? 'page' : undefined}
                      className="relative group will-change-transform"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25
                      }}
                    >
                      <div className={`relative px-4 py-2 rounded-lg transition-all duration-200 ease-out ${
                        isActive 
                          ? 'bg-white/10' 
                          : 'hover:bg-white/5'
                      }`}>
                        {/* Icon & Code */}
                        <div className="flex items-center gap-2">
                          <Icon 
                            className="w-4 h-4 transition-colors" 
                            style={{ 
                              color: isActive ? section.color : '#94a3b8'
                            }}
                          />
                          <div className={`text-sm font-mono uppercase tracking-wider transition-colors ${
                            isActive ? 'font-semibold' : ''
                          }`}
                          style={{ 
                            color: isActive ? section.color : '#94a3b8'
                          }}
                          >
                            {section.code}
                          </div>
                        </div>

                        {/* Active indicator line */}
                        {isActive && (
                          <motion.div
                            layoutId="activeSection"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full will-change-transform"
                            style={{ backgroundColor: section.color }}
                            transition={{ 
                              type: 'spring', 
                              stiffness: 400, 
                              damping: 30,
                              mass: 0.5
                            }}
                          />
                        )}

                        {/* Glow on active */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-lg md:blur-lg -z-10"
                            style={{ backgroundColor: section.color }}
                            animate={{
                              opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: [0.45, 0, 0.55, 1]
                            }}
                          />
                        )}

                        {/* Tooltip */}
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-slate-800/95 md:backdrop-blur-md border px-3 py-1.5 rounded-lg whitespace-nowrap"
                            style={{ borderColor: `${section.color}40` }}
                          >
                            <div className="text-xs font-mono"
                              style={{ color: section.color }}
                            >
                              {section.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Separator */}
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

              {/* Right: Gallery Button */}
              <motion.button
                onClick={onGalleryToggle}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 transition-all border border-pink-500/30">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-400" />
                    <div className="text-sm font-mono uppercase tracking-wider text-pink-400">
                      GAL
                    </div>
                  </div>

                  {/* Pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-pink-400/50"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                </div>
              </motion.button>

              {/* Speed indicator bars */}
              <div className="flex items-center gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full transition-all"
                    style={{
                      height: `${(i + 1) * 4}px`,
                      backgroundColor: scrollVelocity > (i * 25) ? '#22d3ee' : '#334155'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Progress Line */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full"
              style={{
                width: useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
              }}
            />
          </div>
        </div>
      </motion.nav>

      {/* Mobile Command Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        className="lg:hidden fixed top-0 left-0 right-0 z-50"
      >
        <div className="relative">
          {/* Background */}
          <div className="bg-slate-900/95 md:backdrop-blur-xl border-b border-white/10">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left: Brand name & Progress */}
                <div className="flex items-center gap-2">
                  {/* Progress indicator */}
                  <div className="relative w-8 h-8">
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                      style={{ rotate: altitudeRotation }}
                    />
                    <div className="absolute inset-1 rounded-full bg-slate-800 border border-cyan-400/50 flex items-center justify-center">
                      <div className="text-[8px] font-mono text-cyan-400">
                        {Math.round(scrollYProgress.get() * 100)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Brand name */}
                  <div className="flex flex-col">
                    <div className="text-xs font-mono font-semibold tracking-wider text-cyan-400">
                      BLIMBING
                    </div>
                    <div className="text-[9px] text-white/50 font-mono">
                      {sections[activeSection]?.name || 'Navigation'}
                    </div>
                  </div>
                </div>

                {/* Right: Gallery button */}
                <motion.button
                  onClick={onGalleryToggle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40"
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-xs font-mono text-pink-400 uppercase">Gallery</span>
                </motion.button>
              </div>

              {/* Section Icons */}
              <div className="flex items-center justify-around mt-3 gap-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => onNavigate(section.id)}
                      className="relative flex-1"
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-all ${
                        isActive ? 'bg-white/10' : ''
                      }`}>
                        <Icon 
                          className="w-4 h-4 transition-colors" 
                          style={{ 
                            color: isActive ? section.color : '#64748b'
                          }}
                        />
                        <div className={`text-[9px] font-mono uppercase tracking-wide ${
                          isActive ? 'font-semibold' : ''
                        }`}
                        style={{ 
                          color: isActive ? section.color : '#64748b'
                        }}
                        >
                          {section.code}
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                            style={{ backgroundColor: section.color }}
                            layoutId="activeSectionMobile"
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Progress Line */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
              style={{
                width: useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
              }}
            />
          </div>
        </div>
      </motion.nav>
    </>
  );
}
