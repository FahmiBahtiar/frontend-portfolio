'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Camera } from 'lucide-react';

interface CockpitInstrumentPanelProps {
  activeSection: number;
  onNavigate: (index: number) => void;
  onGalleryToggle: () => void;
  totalSections: number;
}

interface GaugeConfig {
  id: number;
  label: string;
  shortLabel: string;
  color: string;
  glowColor: string;
  unit: string;
  maxValue: number;
  icon?: string;
}

export function CockpitInstrumentPanel({ 
  activeSection, 
  onNavigate, 
  onGalleryToggle,
  totalSections 
}: CockpitInstrumentPanelProps) {
  const { scrollYProgress } = useScroll();
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);

  const gauges: GaugeConfig[] = [
    { 
      id: 0, 
      label: 'HERO', 
      shortLabel: 'HRO',
      color: '#22d3ee', // cyan
      glowColor: 'cyan',
      unit: 'ALT',
      maxValue: 1000,
      icon: '✈'
    },
    { 
      id: 1, 
      label: 'ABOUT', 
      shortLabel: 'ABT',
      color: '#a78bfa', // purple
      glowColor: 'purple',
      unit: 'SPD',
      maxValue: 250,
      icon: '👤'
    },
    { 
      id: 2, 
      label: 'EDUCATION', 
      shortLabel: 'EDU',
      color: '#60a5fa', // blue
      glowColor: 'blue',
      unit: 'HDG',
      maxValue: 360,
      icon: '🎓'
    },
    { 
      id: 3, 
      label: 'EXPERIENCE', 
      shortLabel: 'EXP',
      color: '#34d399', // green
      glowColor: 'emerald',
      unit: 'RPM',
      maxValue: 3000,
      icon: '💼'
    },
    { 
      id: 4, 
      label: 'CONTACT', 
      shortLabel: 'CNT',
      color: '#fb923c', // orange
      glowColor: 'orange',
      unit: 'PWR',
      maxValue: 100,
      icon: '📬'
    },
  ];

  // Calculate scroll velocity
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = Math.abs(currentScrollY - lastScrollY);
      setScrollVelocity(Math.min(velocity * 5, 100));
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Decay velocity
  useEffect(() => {
    const timer = setTimeout(() => {
      setScrollVelocity(prev => Math.max(0, prev * 0.92));
    }, 50);
    return () => clearTimeout(timer);
  }, [scrollVelocity]);

  const getGaugeValue = (gaugeId: number) => {
    const gauge = gauges[gaugeId];
    const progress = scrollYProgress.get();
    const sectionProgress = Math.max(0, Math.min(1, (progress * totalSections) - gaugeId));
    return sectionProgress * gauge.maxValue;
  };

  const getNeedleRotation = (gaugeId: number) => {
    // Needle rotates from -135deg to +135deg (270deg total)
    const value = getGaugeValue(gaugeId);
    const gauge = gauges[gaugeId];
    const percentage = value / gauge.maxValue;
    return -135 + (percentage * 270);
  };

  return (
    <>
      {/* Desktop Cockpit Instrument Panel */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 80 }}
        className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-50"
      >
        {/* Main Instrument Panel */}
        <div className="relative">
          {/* Panel Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border-2 border-amber-900/40 shadow-2xl" />
          
          {/* Decorative screws */}
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 shadow-inner" />
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 shadow-inner" />
          <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 shadow-inner" />
          <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 shadow-inner" />

          {/* Inner panel shadow */}
          <div className="absolute inset-4 rounded-2xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]" />
          
          {/* Content */}
          <div className="relative px-6 py-8">
            {/* Panel Title */}
            <div className="mb-6 text-center">
              <div className="text-xs text-amber-500/80 font-mono uppercase tracking-[0.2em] mb-1">
                Flight Control
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
            </div>

            {/* Gauges */}
            <div className="flex flex-col gap-4">
              {gauges.map((gauge, index) => (
                <motion.div
                  key={gauge.id}
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Gauge Button */}
                  <button
                    onClick={() => onNavigate(gauge.id)}
                    className="relative w-full focus:outline-none"
                  >
                    {/* Gauge Container */}
                    <div className="relative w-24 h-24 mx-auto">
                      {/* Outer Ring - Vintage brass look */}
                      <div 
                        className={`absolute inset-0 rounded-full bg-gradient-to-br from-amber-900/60 via-amber-800/40 to-amber-950/60 shadow-lg ${
                          activeSection === gauge.id ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''
                        }`} 
                        style={activeSection === gauge.id ? { 
                          '--tw-ring-color': gauge.color 
                        } as React.CSSProperties : {}}
                      />

                      {/* Glass face */}
                      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-amber-900/30 overflow-hidden">
                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 opacity-5"
                          style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '8px 8px'
                          }}
                        />
                        
                        {/* Active glow */}
                        {activeSection === gauge.id && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ 
                              backgroundColor: gauge.color,
                              opacity: 0.1
                            }}
                            animate={{
                              opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                        )}

                        {/* Tick marks */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                          {/* Major ticks */}
                          {[...Array(12)].map((_, i) => {
                            const angle = (i * 30) - 90;
                            const isInActiveZone = angle >= -135 && angle <= 135;
                            const x1 = 50 + 38 * Math.cos(angle * Math.PI / 180);
                            const y1 = 50 + 38 * Math.sin(angle * Math.PI / 180);
                            const x2 = 50 + 42 * Math.cos(angle * Math.PI / 180);
                            const y2 = 50 + 42 * Math.sin(angle * Math.PI / 180);
                            
                            return isInActiveZone ? (
                              <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={gauge.color}
                                strokeWidth="1.5"
                                opacity="0.4"
                              />
                            ) : null;
                          })}
                          
                          {/* Value arc */}
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke={`${gauge.color}40`}
                            strokeWidth="2"
                            strokeDasharray="164.93 54.98"
                            strokeDashoffset="27.49"
                            transform="rotate(-135 50 50)"
                          />
                        </svg>

                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center pt-2">
                          <span className="text-xl opacity-30">
                            {gauge.icon}
                          </span>
                        </div>

                        {/* Needle */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            rotate: useTransform(
                              scrollYProgress,
                              [gauge.id / totalSections, (gauge.id + 1) / totalSections],
                              [-135, 135]
                            )
                          }}
                        >
                          <div className="absolute w-[2px] h-8 origin-bottom"
                            style={{
                              background: `linear-gradient(to top, ${gauge.color}, ${gauge.color}dd)`,
                              boxShadow: activeSection === gauge.id 
                                ? `0 0 8px ${gauge.color}` 
                                : 'none',
                              filter: activeSection === gauge.id 
                                ? `drop-shadow(0 0 4px ${gauge.color})` 
                                : 'none'
                            }}
                          />
                          {/* Needle tip */}
                          <div className="absolute -top-[2px] w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: gauge.color }}
                          />
                        </motion.div>

                        {/* Center rivet */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 shadow-lg" />
                        </div>

                        {/* Digital readout */}
                        <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-0.5">
                          <div 
                            className="text-[8px] font-mono tabular-nums px-2 py-0.5 rounded bg-black/60"
                            style={{ color: gauge.color }}
                          >
                            {Math.round(getGaugeValue(gauge.id))}
                          </div>
                          <div className="text-[6px] text-amber-500/50 font-mono uppercase tracking-wider">
                            {gauge.unit}
                          </div>
                        </div>
                      </div>

                      {/* Glow effect when active */}
                      {activeSection === gauge.id && (
                        <motion.div
                          className="absolute inset-0 rounded-full blur-xl -z-10"
                          style={{ backgroundColor: gauge.color }}
                          animate={{
                            opacity: [0.2, 0.4, 0.2],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-center">
                      <div 
                        className={`text-[10px] font-mono uppercase tracking-wider transition-all ${
                          activeSection === gauge.id 
                            ? 'opacity-100 font-bold' 
                            : 'opacity-50'
                        }`}
                        style={{ 
                          color: activeSection === gauge.id ? gauge.color : '#94a3b8'
                        }}
                      >
                        {gauge.shortLabel}
                      </div>
                    </div>
                  </button>

                  {/* Tooltip on hover */}
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="bg-slate-800/95 backdrop-blur-md border px-3 py-2 rounded-lg shadow-xl"
                      style={{ borderColor: `${gauge.color}40` }}
                    >
                      <div className="text-xs font-mono uppercase tracking-wider"
                        style={{ color: gauge.color }}
                      >
                        {gauge.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />

            {/* Gallery Mission Control Button */}
            <motion.button
              onClick={onGalleryToggle}
              className="relative w-full group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-24 h-24 mx-auto">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-900/60 via-amber-800/40 to-amber-950/60 shadow-lg" />
                
                {/* Glass face */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-amber-900/30 flex items-center justify-center overflow-hidden">
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                  
                  {/* Camera icon */}
                  <Camera className="w-8 h-8 text-pink-400 relative z-10" />
                  
                  {/* Pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-pink-400"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                </div>

                {/* Glow */}
                <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <div className="text-[10px] text-pink-400 font-mono uppercase tracking-wider">
                  GALLERY
                </div>
              </div>
            </motion.button>

            {/* Scroll speed indicator */}
            <div className="mt-6 text-center">
              <div className="text-[8px] text-amber-500/50 font-mono uppercase tracking-widest mb-1">
                Velocity
              </div>
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full transition-all"
                    style={{
                      height: `${(i + 1) * 2}px`,
                      backgroundColor: scrollVelocity > (i * 20) ? '#f59e0b' : '#1e293b'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Version - Bottom Panel */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 80 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="relative">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/98 via-slate-900/95 to-transparent backdrop-blur-xl" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
          
          {/* Content */}
          <div className="relative px-4 py-4">
            <div className="flex items-center justify-around gap-2">
              {/* Mini gauges */}
              {gauges.map((gauge) => (
                <button
                  key={gauge.id}
                  onClick={() => onNavigate(gauge.id)}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <div className="relative w-12 h-12">
                    {/* Simplified gauge */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border ${
                      activeSection === gauge.id ? 'border-2' : 'border'
                    }`}
                    style={{
                      borderColor: activeSection === gauge.id ? gauge.color : '#44403c'
                    }}
                    >
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center text-lg opacity-60">
                        {gauge.icon}
                      </div>
                      
                      {/* Progress arc */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke={`${gauge.color}30`}
                          strokeWidth="2"
                        />
                        <motion.circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke={gauge.color}
                          strokeWidth="2"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          style={{
                            strokeDashoffset: useTransform(
                              scrollYProgress,
                              [gauge.id / totalSections, (gauge.id + 1) / totalSections],
                              [2 * Math.PI * 20, 0]
                            ),
                          }}
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Active glow */}
                      {activeSection === gauge.id && (
                        <div className="absolute inset-0 rounded-full blur-md -z-10"
                          style={{ backgroundColor: gauge.color, opacity: 0.3 }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <div className={`text-[8px] font-mono uppercase tracking-wider ${
                    activeSection === gauge.id ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{ color: activeSection === gauge.id ? gauge.color : '#94a3b8' }}
                  >
                    {gauge.shortLabel}
                  </div>
                </button>
              ))}

              {/* Gallery button */}
              <button
                onClick={onGalleryToggle}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-900/40 to-slate-900 border border-pink-500/40 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-pink-400" />
                  </div>
                </div>
                <div className="text-[8px] text-pink-400 font-mono uppercase tracking-wider">
                  GAL
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
