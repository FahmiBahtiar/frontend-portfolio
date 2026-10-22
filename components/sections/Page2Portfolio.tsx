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

  const getColorClasses = (_color?: string) => {
    return 'text-slate-200 border-slate-700/60 bg-slate-800/80 hover:border-slate-600';
  };

  const getTextColor = (_color?: string) => {
    return 'text-white';
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-[#6FD4E1]/30 mb-8 rotate-2 hover:rotate-0 transition-transform duration-500 shadow-sm text-[#6FD4E1]">
            <Heart className="w-10 h-10 text-[#6FD4E1]" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-[#FFFFFF] mb-4 tracking-tight">About Me</h2>
          <p className="text-[#E2F4F3]/80 max-w-2xl mx-auto text-lg">
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
                <div className="relative rounded-[32px] border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl">
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
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 md:p-7">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-white font-mono font-bold tracking-wider">HIGHLIGHTS</h3>
                    <div className="flex-1 h-px bg-slate-800" />
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
                        <Card className="group relative h-full overflow-hidden border border-slate-800/80 bg-slate-950/60 transition-all hover:-translate-y-0.5 hover:border-[#6FD4E1]/40">
                          <CardContent className="p-5 flex flex-col items-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#6FD4E1]/25 bg-slate-900 text-[#6FD4E1]">
                              <Icon className="w-6 h-6 text-[#6FD4E1] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            </div>
                            <p className="text-[#B9E7E6] text-xs font-mono mb-1 uppercase tracking-wider">{item.label}</p>
                            <p className="text-[#FFFFFF] text-lg font-bold">{item.value}</p>
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
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 md:p-7">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-[#FFFFFF] font-mono font-bold tracking-wider">MY THREE PASSIONS</h3>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  <div className="space-y-4">
                  {passions.map((passion, index) => {
                    const Icon = getIcon(passion.icon);
                    const statsData = getStatsData(passion);
                    const cleanTitle = passion.title.replace(/Developerr/g, 'Developer');
                    
                    return (
                      <motion.div
                        key={passion.title}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <Card className="group relative overflow-hidden border border-slate-800/80 bg-slate-950/60 transition-all hover:-translate-y-0.5 hover:border-[#6FD4E1]/40">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-5">
                              {/* Icon */}
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[#6FD4E1]/25 bg-slate-900 text-[#6FD4E1] transition-transform group-hover:scale-105">
                                <Icon className="w-7 h-7 text-[#6FD4E1]" strokeWidth={1.5} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                  <h4 className="text-[#FFFFFF] font-bold text-lg leading-tight">{cleanTitle}</h4>
                                  <div className="text-left sm:text-right shrink-0">
                                    <p className="font-mono font-bold text-[#6FD4E1]">
                                      {statsData.value}
                                    </p>
                                    <p className="text-[#B9E7E6] text-xs font-mono uppercase tracking-wider">{statsData.label}</p>
                                  </div>
                                </div>
                                <p className="text-[#E2F4F3]/85 text-sm leading-relaxed">{passion.description}</p>
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
                  className="bg-[#6FD4E1] text-slate-950 hover:bg-[#B9E7E6] font-semibold rounded-full px-8 py-3 group transition-colors shadow-sm"
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
