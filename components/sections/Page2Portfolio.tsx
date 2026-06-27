'use client';

import { motion } from 'motion/react';
import useSWR from 'swr';
import { Code2, Plane, Mountain, GraduationCap, Briefcase, Trophy, Target, Heart, Code, ArrowRight, type LucideIcon } from 'lucide-react';
import { LanyardCard } from '@/components/features/LanyardCard';
import { AboutService } from '@/lib/services/about';
import { Passion, Highlight } from '@/lib/types/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Page2PortfolioProps {
  onNavigate?: (sectionIndex: number) => void;
}

// Noise grain SVG filter as data URI
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export function Page2Portfolio({ onNavigate }: Page2PortfolioProps = {}) {
  // Use SWR for data fetching
  const { data: passions = [], isLoading: passionsLoading, error: passionsError } = useSWR('passions', () => AboutService.getPassions());
  const { data: highlights = [], isLoading: highlightsLoading, error: highlightsError } = useSWR('highlights', () => AboutService.getHighlights());

  const loading = passionsLoading || highlightsLoading;
  const error = passionsError || highlightsError ? 'Unable to load portfolio data.' : null;

  // Icon mapping function
  const getIcon = (iconName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      Code, Code2, Plane, Mountain, GraduationCap, Briefcase, Trophy, Target, Heart,
    };
    return iconMap[iconName] || Code;
  };

  // Color mapping function for Tailwind semantic colors
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

  // Convert named colors to text classes
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
    // Map hex colors if present
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

  // Helper function to get stats data
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

        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-[520px] h-[520px] rounded-full opacity-[0.06]"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.8) 0%, transparent 70%)',
              top: '12%',
              left: '10%',
              filter: 'blur(90px)',
            }}
          />
          <div
            className="absolute w-[420px] h-[420px] rounded-full opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, transparent 70%)',
              bottom: '18%',
              right: '8%',
              filter: 'blur(90px)',
            }}
          />
          <div
            className="absolute w-[360px] h-[360px] rounded-full opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.8) 0%, transparent 70%)',
              top: '45%',
              left: '60%',
              filter: 'blur(110px)',
            }}
          />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900/70 border border-purple-500/30 mb-8 rotate-2 hover:rotate-0 transition-transform duration-500 shadow-[0_12px_30px_-16px_rgba(168,85,247,0.6)]">
            <Heart className="w-10 h-10 text-purple-400" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">About Me</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
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
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center lg:sticky lg:top-8"
            >
              <div className="relative w-full">
                <div className="absolute inset-6 rounded-[36px] bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10 blur-2xl" />
                <div className="relative rounded-[32px] border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl shadow-[0_30px_70px_-50px_rgba(15,23,42,0.9)]">
                  <LanyardCard />
                </div>
              </div>
            </motion.div>

            {/* Right Side - About Info */}
            <div className="space-y-8">
              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 md:p-7 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.9)]">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-white font-mono font-bold tracking-wider">HIGHLIGHTS</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                  {highlights.map((item, index) => {
                    const Icon = getIcon(item.icon);
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                      >
                        <Card className="group relative h-full overflow-hidden border border-slate-800/60 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 transition-all hover:-translate-y-0.5 hover:border-slate-700/80">
                          <CardContent className="p-5 flex flex-col items-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800/60 bg-slate-950/40">
                              <Icon className={`w-6 h-6 ${getTextColor(item.color)} group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-400 text-xs font-mono mb-1 uppercase tracking-wider">{item.label}</p>
                            <p className="text-white text-lg font-bold">{item.value}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                  </div>
                </div>
              </motion.div>

              {/* Three Passions */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 md:p-7 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.9)]">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-white font-mono font-bold tracking-wider">MY THREE PASSIONS</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                  </div>

                  <div className="space-y-4">
                  {passions.map((passion, index) => {
                    const Icon = getIcon(passion.icon);
                    const statsData = getStatsData(passion);
                    const colorClass = getColorClasses(passion.color);
                    const textColor = getTextColor(passion.color);
                    
                    return (
                      <motion.div
                        key={passion.title}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <Card className="group relative overflow-hidden border border-slate-800/60 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 transition-all hover:-translate-y-0.5 hover:border-slate-700/80">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-5">
                              {/* Icon */}
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${colorClass}`}>
                                <Icon className="w-7 h-7" strokeWidth={1.5} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                  <h4 className="text-white font-bold text-lg leading-tight">{passion.title}</h4>
                                  <div className="text-left sm:text-right shrink-0">
                                    <p className={`font-mono font-bold ${textColor}`}>
                                      {statsData.value}
                                    </p>
                                    <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">{statsData.label}</p>
                                  </div>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">{passion.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                  </div>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left pt-6"
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full group"
                  onClick={() => onNavigate && onNavigate(4)} // Assuming section 4 is Contact based on Page5Contact name
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
