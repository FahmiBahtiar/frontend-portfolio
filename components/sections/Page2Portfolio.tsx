'use client';

import { motion } from 'motion/react';
import useSWR from 'swr';
import { Code2, Plane, Mountain, GraduationCap, Briefcase, Trophy, Target, Heart, Code, ArrowRight, type LucideIcon } from 'lucide-react';
import { LanyardCard } from '@/components/features/LanyardCard';
import { AboutService } from '@/lib/services/about';
import { Passion, Highlight } from '@/lib/types/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FALLBACK_PASSIONS, FALLBACK_HIGHLIGHTS } from '@/lib/fallback-data';

interface Page2PortfolioProps {
  onNavigate?: (sectionIndex: number) => void;
}

// Noise grain SVG filter as data URI
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export function Page2Portfolio({ onNavigate }: Page2PortfolioProps = {}) {
  const { data: passions = [], isLoading: passionsLoading, error: passionsError } = useSWR(
    'passions',
    () => AboutService.getPassions(),
    { fallbackData: FALLBACK_PASSIONS }
  );
  const { data: highlights = [], isLoading: highlightsLoading, error: highlightsError } = useSWR(
    'highlights',
    () => AboutService.getHighlights(),
    { fallbackData: FALLBACK_HIGHLIGHTS }
  );

  const loading = (passionsLoading || highlightsLoading) && passions.length === 0;
  const error = passionsError || highlightsError ? 'Unable to load portfolio data.' : null;

  const getIcon = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      Code, Code2, Plane, Mountain, GraduationCap, Briefcase, Trophy, Target, Heart,
    };
    return iconMap[iconName] || Code;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10 hover:border-cyan-500/40',
      blue: 'text-blue-400 border-blue-500/20 bg-blue-500/10 hover:border-blue-500/40',
      green: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:border-emerald-500/40',
      purple: 'text-purple-400 border-purple-500/20 bg-purple-500/10 hover:border-purple-500/40',
      orange: 'text-orange-400 border-orange-500/20 bg-orange-500/10 hover:border-orange-500/40',
      yellow: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10 hover:border-yellow-500/40',
      pink: 'text-pink-400 border-pink-500/20 bg-pink-500/10 hover:border-pink-500/40',
    };
    return colorMap[color] || colorMap.cyan;
  };

  const getTextColor = (color: string) => {
    const colorMap: Record<string, string> = {
      cyan: 'text-cyan-400',
      blue: 'text-blue-400',
      green: 'text-emerald-400',
      purple: 'text-purple-400',
      orange: 'text-orange-400',
      yellow: 'text-yellow-400',
      pink: 'text-pink-400',
    };
    if (color.startsWith('#')) {
      const hexMap: Record<string, string> = {
        '#00ffff': 'text-cyan-400',
        '#0080ff': 'text-blue-400',
        '#00ff00': 'text-emerald-400',
        '#8458fd': 'text-purple-400',
        '#ff8000': 'text-orange-400',
        '#ffff00': 'text-yellow-400',
        '#ff00ff': 'text-pink-400',
      };
      return hexMap[color.toLowerCase()] || 'text-cyan-400';
    }
    return colorMap[color] || 'text-cyan-400';
  };

  const getStatsData = (passion: Passion) => {
    if (passion.stats) return passion.stats;
    if (passion.statsLabel && passion.statsValue) {
      return { label: passion.statsLabel, value: passion.statsValue };
    }
    return { label: 'Stats', value: 'N/A' };
  };

  return (
    <div className="relative min-h-screen w-full px-4 md:px-8 py-12 md:py-16 pt-24 lg:pt-28 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 75% 45% at 50% 35%, rgba(15, 23, 42, 0.6) 0%, transparent 70%)',
          }}
        />

        {/* Subtle ambient lighting */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, transparent 70%)',
              top: '20%',
              left: '15%',
              filter: 'blur(100px)',
            }}
          />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: GRAIN_SVG,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, rgba(6, 6, 18, 0.5) 100%)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 mb-6 text-slate-300 shadow-sm">
            <Heart className="w-6 h-6 text-slate-300" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">About Me</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            Pull the lanyard to reveal my identity card
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-mono">Loading portfolio data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <p className="text-red-400 font-mono mb-4">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && passions.length === 0 && highlights.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <div className="text-white/40 text-4xl mb-4">📄</div>
              <p className="text-slate-400 font-mono">No portfolio data available</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (passions.length > 0 || highlights.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start">
            {/* Left Side - Lanyard Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center lg:sticky lg:top-8 w-full"
            >
              <div className="relative w-full max-w-md mx-auto">
                <LanyardCard />
              </div>
            </motion.div>

            {/* Right Side - About Info */}
            <div className="space-y-10">
              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-mono font-semibold tracking-[0.2em] text-slate-400 uppercase">Highlights</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {highlights.map((item, index) => {
                    const Icon = getIcon(item.icon);
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.08 * index, duration: 0.5 }}
                        className="group relative rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-300 hover:border-slate-700 hover:-translate-y-0.5"
                      >
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300">
                          <Icon className="w-4 h-4 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <p className="text-slate-400 text-[11px] font-mono uppercase tracking-[0.15em] mb-1">{item.label}</p>
                        <p className="text-white text-base font-semibold tracking-tight">{item.value}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Three Passions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-mono font-semibold tracking-[0.2em] text-slate-400 uppercase">Core Specialties</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <div className="space-y-3.5">
                  {passions.map((passion, index) => {
                    const Icon = getIcon(passion.icon);
                    const statsData = getStatsData(passion);
                    const cleanTitle = passion.title.replace(/Developerr/g, 'Developer');
                    
                    return (
                      <motion.div
                        key={passion.title}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: index * 0.08, duration: 0.5 }}
                        className="group relative rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 transition-all duration-300 hover:border-slate-700 hover:-translate-y-0.5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-300">
                            <Icon className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
                          </div>

                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                              <h4 className="text-white font-semibold text-base leading-snug">{cleanTitle}</h4>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-xs font-semibold text-slate-200">
                                  {statsData.value}
                                </span>
                                <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">{statsData.label}</span>
                              </div>
                            </div>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{passion.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left pt-2"
              >
                <Button 
                  size="lg" 
                  className="bg-white text-slate-950 hover:bg-slate-200 font-semibold rounded-xl px-6 group transition-colors shadow-sm"
                  onClick={() => onNavigate && onNavigate(4)}
                >
                  Let&apos;s Collaborate
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
