'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Code2, Plane, Mountain, GraduationCap, Briefcase, Trophy, Target, Heart, Code } from 'lucide-react';
import { LanyardCard } from '@/components/features/LanyardCard';
import { AboutService } from '@/lib/services/about';
import { Passion, Highlight } from '@/lib/types/admin';

interface Page2PortfolioProps {
  onNavigate?: (sectionIndex: number) => void;
}

export function Page2Portfolio({ onNavigate }: Page2PortfolioProps = {}) {
  const [passions, setPassions] = useState<Passion[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [passionsData, highlightsData] = await Promise.all([
          AboutService.getPassions(),
          AboutService.getHighlights(),
        ]);
        setPassions(passionsData);
        setHighlights(highlightsData);
      } catch (err) {
        console.error('❌ Failed to fetch about data:', err);
        setError('Unable to load portfolio data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Icon mapping function
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Code,
      Code2,
      Plane,
      Mountain,
      GraduationCap,
      Briefcase,
      Trophy,
      Target,
      Heart,
    };
    return iconMap[iconName] || Code;
  };

  // Color mapping function
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      cyan: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10',
      blue: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
      green: 'text-green-400 border-green-400/20 bg-green-400/10',
      purple: 'text-purple-400 border-purple-400/20 bg-purple-400/10',
      orange: 'text-orange-400 border-orange-400/20 bg-orange-400/10',
      yellow: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
      pink: 'text-pink-400 border-pink-400/20 bg-pink-400/10',
    };
    return colorMap[color] || colorMap.cyan;
  };

  // Color mapping function for hex colors (text only, no background)
  const getColorFromHex = (hexColor: string) => {
    // Map hex colors to appropriate text colors only
    const colorMap: Record<string, string> = {
      '#00ffff': 'text-cyan-400', // cyan
      '#0080ff': 'text-blue-400', // blue
      '#00ff00': 'text-green-400', // green
      '#8458fd': 'text-purple-400', // purple
      '#ff8000': 'text-orange-400', // orange
      '#ffff00': 'text-yellow-400', // yellow
      '#ff00ff': 'text-pink-400', // pink
    };
    return colorMap[hexColor.toLowerCase()] || 'text-cyan-400';
  };

  // Convert named colors to RGB values for inline styles
  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      cyan: '6, 182, 212',    // cyan-400
      blue: '59, 130, 246',   // blue-400  
      green: '34, 197, 94',   // green-400
      purple: '147, 51, 234', // purple-400
      orange: '251, 146, 60', // orange-400
      yellow: '250, 204, 21', // yellow-400
      pink: '236, 72, 153',   // pink-400
    };
    return colorMap[color] || colorMap.cyan;
  };

  // Handle gradient backgrounds
  const getGradientColors = (gradient: string) => {
    // For gradients like "from-cyan-500/20 to-blue-500/20"
    if (gradient.includes('from-') && gradient.includes('to-')) {
      // This is already a Tailwind gradient, convert to CSS
      const fromMatch = gradient.match(/from-(\w+)-(\d+)/);
      const toMatch = gradient.match(/to-(\w+)-(\d+)/);
      
      if (fromMatch && toMatch) {
        const fromColor = getColorValue(fromMatch[1]);
        const toColor = getColorValue(toMatch[1]);
        const fromOpacity = parseInt(fromMatch[2]) / 100;
        const toOpacity = parseInt(toMatch[2]) / 100;
        
        return `rgba(${fromColor}, ${fromOpacity}) 0%, rgba(${toColor}, ${toOpacity}) 100%`;
      }
    }
    return `rgba(${getColorValue('cyan')}, 0.2) 0%, rgba(${getColorValue('blue')}, 0.2) 100%`;
  };

  const getSolidColor = (color: string) => {
    return `rgba(${getColorValue(color)}, 0.2) 0%, rgba(${getColorValue(color)}, 0.1) 100%`;
  };

  const getGlowStyle = (hexColor: string) => {
    return {
      background: `linear-gradient(135deg, ${hexColor}00 0%, ${hexColor}00 100%)`,
    };
  };

  const getHoverGlowStyle = (hexColor: string) => {
    return {
      background: `linear-gradient(135deg, ${hexColor}1a 0%, ${hexColor}0d 100%)`,
    };
  };

  // Helper function to get stats data
  const getStatsData = (passion: Passion) => {
    if (passion.stats) {
      return passion.stats;
    }
    if (passion.statsLabel && passion.statsValue) {
      return {
        label: passion.statsLabel,
        value: passion.statsValue,
      };
    }
    return { label: 'Stats', value: 'N/A' };
  };

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-12 md:py-16 pt-24 lg:pt-28 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Icon Container */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 mb-6"
          >
            <Heart className="w-8 h-8 text-purple-400" />
          </motion.div>

          <h2 className="text-white mb-3">About Me</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Pull the lanyard to reveal my identity card
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white/70">Loading portfolio data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <p className="text-red-400 font-medium mb-2">Connection Error</p>
              <p className="text-white/60 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && passions.length === 0 && highlights.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <div className="text-white/40 text-4xl mb-4">📄</div>
              <p className="text-white/60">No portfolio data available</p>
              <p className="text-white/40 text-sm mt-2">Data will be loaded when available</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (passions.length > 0 || highlights.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Side - Lanyard Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center lg:sticky lg:top-8"
            >
              <LanyardCard />
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
                <h3 className="text-white mb-4">Highlights</h3>
                <div className="grid grid-cols-2 gap-4">
                  {highlights.map((item, index) => {
                    const Icon = getIcon(item.icon);
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="relative p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group overflow-hidden"
                      >
                        {/* Glow effect */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${item.color}1a 0%, ${item.color}0d 100%)`
                          }}
                        />
                        
                        <div className="relative">
                          <Icon className={`w-6 h-6 ${getColorFromHex(item.color)} mb-2`} strokeWidth={2} />
                          <p className="text-white/50 text-xs mb-1">{item.label}</p>
                          <p className="text-white">{item.value}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Three Passions */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-white mb-4">My Three Passions</h3>
                <div className="space-y-4">
                  {passions.map((passion, index) => {
                    const Icon = getIcon(passion.icon);
                    const statsData = getStatsData(passion);
                    return (
                      <motion.div
                        key={passion.title}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        whileHover={{ x: 5 }}
                        className="relative p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group overflow-hidden"
                      >
                        {/* Background gradient */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: (passion.gradient && passion.gradient.startsWith('from-'))
                              ? `linear-gradient(135deg, ${getGradientColors(passion.gradient)})`
                              : `linear-gradient(135deg, ${getSolidColor(passion.gradient || '')})`
                          }}
                        />
                        
                        <div className="relative flex items-start gap-4">
                          {/* Icon */}
                          <div className="relative flex-shrink-0">
                            <motion.div
                              className="absolute inset-0 rounded-full blur-xl"
                              style={{
                                backgroundColor: `rgba(${getColorValue(passion.color)}, 0.4)`,
                              }}
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut'
                              }}
                            />
                            <div 
                              className="relative w-12 h-12 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: `rgba(${getColorValue(passion.color)}, 0.2)`,
                                border: `1px solid rgba(${getColorValue(passion.color)}, 0.3)`,
                              }}
                            >
                              <Icon 
                                className={`w-6 h-6`}
                                style={{ color: `rgb(${getColorValue(passion.color)})` }}
                                strokeWidth={2}
                              />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className="text-white">{passion.title}</h4>
                              <div className="text-right flex-shrink-0">
                                <p 
                                  className="font-medium"
                                  style={{ color: `rgb(${getColorValue(passion.color)})` }}
                                >
                                  {getStatsData(passion).value}
                                </p>
                                <p className="text-white/50 text-xs">{getStatsData(passion).label}</p>
                              </div>
                            </div>
                            <p className="text-white/60 text-sm mb-3">{passion.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all inline-flex items-center gap-2"
                >
                  <span>Let's Collaborate</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
