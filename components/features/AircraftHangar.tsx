'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Github,
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Gauge,
  Radio,
  Fuel,
  Shield,
  Zap,
  X,
  Trophy,
  Mountain,
  Calendar,
  MapPin,
  Award
} from 'lucide-react';

type CategoryType = 'github' | 'flight' | 'mountain';

interface HangarItem {
  id: string;
  category: CategoryType;
  name: string;
  model: string;
  classification: string;
  description: string;
  stats?: {
    stars?: number;
    forks?: number;
    watchers?: number;
    altitude?: string;
    duration?: string;
    difficulty?: string;
  };
  specifications: {
    language?: string;
    engine?: string;
    maxSpeed?: string;
    range?: string;
    location?: string;
    date?: string;
    elevation?: string;
  };
  systems: string[];
  url?: string;
  icon: string;
  color: string;
  achievements?: string[];
}

export function AircraftHangar() {
  const [selectedItem, setSelectedItem] = useState<HangarItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<CategoryType | null>('github');

  const hangarItems: HangarItem[] = [
    // ===== GITHUB PROJECTS =====
    {
      id: 'github-1',
      category: 'github',
      name: 'react-dashboard-pro',
      model: 'Boeing 787 Dreamliner',
      classification: 'Heavy Jet',
      description: 'Long-range, wide-body twin-engine jet airliner. Advanced admin dashboard with real-time analytics, interactive charts, and comprehensive data visualization capabilities.',
      stats: { stars: 245, forks: 67, watchers: 23 },
      specifications: {
        language: 'TypeScript',
        engine: 'React 18.x',
        maxSpeed: 'Mach 0.85',
        range: '8,000 nm'
      },
      systems: ['React', 'TypeScript', 'Recharts', 'TailwindCSS'],
      url: 'https://github.com',
      icon: '✈️',
      color: 'cyan'
    },
    {
      id: 'github-2',
      category: 'github',
      name: 'node-microservices',
      model: 'Airbus A350',
      classification: 'Heavy Jet',
      description: 'Ultra-modern wide-body aircraft with advanced systems. Scalable microservices architecture with containerization and orchestration support.',
      stats: { stars: 189, forks: 45, watchers: 18 },
      specifications: {
        language: 'JavaScript',
        engine: 'Node.js 20.x',
        maxSpeed: 'Mach 0.89',
        range: '7,500 nm'
      },
      systems: ['Node.js', 'Docker', 'Kubernetes', 'Redis'],
      url: 'https://github.com',
      icon: '🛩️',
      color: 'green'
    },
    {
      id: 'github-3',
      category: 'github',
      name: 'python-ml-toolkit',
      model: 'Lockheed SR-71 Blackbird',
      classification: 'Reconnaissance',
      description: 'Strategic reconnaissance aircraft known for exceptional speed. Machine learning toolkit with pre-trained models and advanced data processing.',
      stats: { stars: 312, forks: 89, watchers: 34 },
      specifications: {
        language: 'Python',
        engine: 'TensorFlow/PyTorch',
        maxSpeed: 'Mach 3.3',
        range: '3,200 nm'
      },
      systems: ['Python', 'TensorFlow', 'NumPy', 'Pandas'],
      url: 'https://github.com',
      icon: '🚀',
      color: 'purple'
    },

    // ===== FLIGHT AWARDS =====
    {
      id: 'flight-1',
      category: 'flight',
      name: 'First Solo Cross-Country',
      model: 'Commercial Pilot License',
      classification: 'Aviation Milestone',
      description: 'Successfully completed first solo cross-country flight with multiple waypoints. Demonstrated proficiency in navigation, communication, and emergency procedures.',
      stats: {
        altitude: 'FL180',
        duration: '3.5 hours',
        difficulty: 'Intermediate'
      },
      specifications: {
        location: 'Jakarta - Bandung - Yogyakarta',
        date: 'March 2023',
        elevation: '18,000 ft'
      },
      systems: ['Navigation', 'Radio Communication', 'Weather Analysis', 'Flight Planning'],
      icon: '🏆',
      color: 'orange',
      achievements: [
        'Completed 3 successful landings',
        'Perfect weather adaptation',
        'Zero navigation errors'
      ]
    },
    {
      id: 'flight-2',
      category: 'flight',
      name: 'Instrument Rating Certification',
      model: 'IFR Qualification',
      classification: 'Advanced Certification',
      description: 'Earned Instrument Flight Rules rating with exceptional scores. Mastered flying solely by reference to instruments in challenging weather conditions.',
      stats: {
        altitude: 'FL250',
        duration: '50 hours',
        difficulty: 'Advanced'
      },
      specifications: {
        location: 'Flight Training Center',
        date: 'August 2023',
        elevation: '25,000 ft'
      },
      systems: ['ILS Approach', 'VOR Navigation', 'GPS Systems', 'Autopilot'],
      icon: '🎖️',
      color: 'cyan',
      achievements: [
        'Passed on first attempt',
        '95% score on written exam',
        'Certified for IMC operations'
      ]
    },
    {
      id: 'flight-3',
      category: 'flight',
      name: 'Multi-Engine Rating',
      model: 'Twin-Engine Certification',
      classification: 'Complex Aircraft',
      description: 'Qualified to operate multi-engine aircraft. Demonstrated mastery of asymmetric thrust management and engine-out procedures.',
      stats: {
        altitude: 'FL280',
        duration: '25 hours',
        difficulty: 'Advanced'
      },
      specifications: {
        location: 'Advanced Flight Academy',
        date: 'December 2023',
        elevation: '28,000 ft'
      },
      systems: ['Twin-Engine Ops', 'Engine Failure Procedures', 'Performance Calculations'],
      icon: '🌟',
      color: 'purple',
      achievements: [
        'Zero engine-out incidents',
        'Perfect single-engine landings',
        'Advanced weather operations'
      ]
    },

    // ===== MOUNTAIN EXPEDITIONS =====
    {
      id: 'mountain-1',
      category: 'mountain',
      name: 'Mount Semeru Summit',
      model: 'Java\'s Highest Peak',
      classification: 'Volcanic Expedition',
      description: 'Successfully summited Mount Semeru (3,676m), the highest mountain in Java. Challenging volcanic terrain with active crater and steep slopes.',
      stats: {
        altitude: '3,676 m',
        duration: '3 days',
        difficulty: 'Hard'
      },
      specifications: {
        location: 'East Java, Indonesia',
        date: 'June 2024',
        elevation: '3,676 m'
      },
      systems: ['High-altitude trekking', 'Volcanic terrain', 'Night summit push', 'Cold weather'],
      icon: '⛰️',
      color: 'orange',
      achievements: [
        'Reached summit at sunrise',
        'Witnessed active crater',
        'Completed in optimal weather window'
      ]
    },
    {
      id: 'mountain-2',
      category: 'mountain',
      name: 'Mount Rinjani Traverse',
      model: 'Lombok\'s Sacred Mountain',
      classification: 'Multi-day Expedition',
      description: 'Epic 4-day traverse of Mount Rinjani (3,726m) including Segara Anak crater lake and hot springs. One of Indonesia\'s most challenging treks.',
      stats: {
        altitude: '3,726 m',
        duration: '4 days',
        difficulty: 'Very Hard'
      },
      specifications: {
        location: 'Lombok, Indonesia',
        date: 'August 2024',
        elevation: '3,726 m'
      },
      systems: ['Multi-day trekking', 'Crater lake camping', 'Extreme elevation gain', 'Technical descent'],
      icon: '🏔️',
      color: 'cyan',
      achievements: [
        'Full traverse completion',
        'Camped at crater rim (2,700m)',
        'Bathed in natural hot springs'
      ]
    },
    {
      id: 'mountain-3',
      category: 'mountain',
      name: 'Seven Summits of Java',
      model: 'Provincial Peak Collection',
      classification: 'Multi-Peak Challenge',
      description: 'Completed all seven highest peaks across Java\'s provinces. A year-long journey covering diverse terrains from volcanic craters to tropical highlands.',
      stats: {
        altitude: 'Various peaks',
        duration: '12 months',
        difficulty: 'Extreme'
      },
      specifications: {
        location: 'Across Java Island',
        date: 'Jan - Dec 2024',
        elevation: 'Up to 3,676 m'
      },
      systems: ['Multi-terrain navigation', 'Season planning', 'Endurance training', 'Logistics management'],
      icon: '🎯',
      color: 'purple',
      achievements: [
        '7 major summits completed',
        'Over 200km trekking distance',
        'Documented entire journey'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { main: string; glow: string; border: string } } = {
      cyan: { main: '#22d3ee', glow: '#22d3ee40', border: 'border-cyan-400/40' },
      green: { main: '#4ade80', glow: '#4ade8040', border: 'border-green-400/40' },
      purple: { main: '#a855f7', glow: '#a855f740', border: 'border-purple-400/40' },
      orange: { main: '#fb923c', glow: '#fb923c40', border: 'border-orange-400/40' }
    };
    return colors[color] || colors.cyan;
  };

  const filteredItems = filterCategory === null 
    ? hangarItems 
    : hangarItems.filter(item => item.category === filterCategory);

  return (
    <>
      {/* Category Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <motion.button
            onClick={() => setFilterCategory(filterCategory === 'github' ? null : 'github')}
            className={`px-3 md:px-4 py-2 rounded-xl border backdrop-blur-sm transition-all text-xs md:text-sm font-mono uppercase tracking-wider ${
              filterCategory === 'github'
                ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github className="w-3.5 h-3.5 inline mr-2" />
            GitHub Projects
          </motion.button>

          <motion.button
            onClick={() => setFilterCategory(filterCategory === 'flight' ? null : 'flight')}
            className={`px-3 md:px-4 py-2 rounded-xl border backdrop-blur-sm transition-all text-xs md:text-sm font-mono uppercase tracking-wider ${
              filterCategory === 'flight'
                ? 'bg-purple-400/20 border-purple-400/50 text-purple-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trophy className="w-3.5 h-3.5 inline mr-2" />
            Flight Awards
          </motion.button>

          <motion.button
            onClick={() => setFilterCategory(filterCategory === 'mountain' ? null : 'mountain')}
            className={`px-3 md:px-4 py-2 rounded-xl border backdrop-blur-sm transition-all text-xs md:text-sm font-mono uppercase tracking-wider ${
              filterCategory === 'mountain'
                ? 'bg-green-400/20 border-green-400/50 text-green-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mountain className="w-3.5 h-3.5 inline mr-2" />
            Mountain Expeditions
          </motion.button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const colors = getColorClasses(item.color);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                {/* Spotlight Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity -z-10"
                  style={{ background: colors.glow }}
                />

                {/* Item Card */}
                <motion.div
                  className={`relative h-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border overflow-hidden transition-all ${colors.border}`}
                  whileHover={{ y: -4, boxShadow: `0 20px 40px ${colors.glow}` }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Header */}
                  <div
                    className="px-4 py-3 border-b"
                    style={{
                      background: `linear-gradient(135deg, ${colors.main}15, ${colors.main}05)`,
                      borderBottomColor: `${colors.main}20`
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Icon */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center border-2 text-xl"
                          style={{
                            background: `radial-gradient(circle, ${colors.main}40, ${colors.main}10)`,
                            borderColor: colors.main,
                            boxShadow: `0 0 15px ${colors.glow}`
                          }}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">
                            {item.classification}
                          </div>
                          <div className="text-xs font-mono text-white/70 truncate">
                            {item.model}
                          </div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className={`px-2 py-1 rounded-lg border text-[10px] uppercase tracking-wider flex-shrink-0 ${
                        item.category === 'github' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/40' :
                        item.category === 'flight' ? 'bg-purple-400/10 text-purple-400 border-purple-400/40' :
                        'bg-green-400/10 text-green-400 border-green-400/40'
                      }`}>
                        {item.category === 'github' ? 'PROJECT' : item.category === 'flight' ? 'FLIGHT' : 'MOUNTAIN'}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Title & Description */}
                    <div>
                      <h4 className="text-white font-mono mb-2 truncate">{item.name}</h4>
                      <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Stats Panel */}
                    <div className="grid grid-cols-2 gap-2">
                      {item.category === 'github' ? (
                        <>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                            <Gauge className="w-3.5 h-3.5" style={{ color: colors.main }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] text-white/40 uppercase">Speed</div>
                              <div className="text-xs text-white/70 font-mono truncate">
                                {item.specifications.maxSpeed}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                            <Radio className="w-3.5 h-3.5" style={{ color: colors.main }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] text-white/40 uppercase">Range</div>
                              <div className="text-xs text-white/70 font-mono truncate">
                                {item.specifications.range}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                            <MapPin className="w-3.5 h-3.5" style={{ color: colors.main }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] text-white/40 uppercase">
                                {item.category === 'flight' ? 'Altitude' : 'Elevation'}
                              </div>
                              <div className="text-xs text-white/70 font-mono truncate">
                                {item.stats?.altitude}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                            <Calendar className="w-3.5 h-3.5" style={{ color: colors.main }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] text-white/40 uppercase">Duration</div>
                              <div className="text-xs text-white/70 font-mono truncate">
                                {item.stats?.duration}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bottom Stats */}
                    {item.category === 'github' && item.stats && (
                      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-sm text-white/70 font-mono">{item.stats.stars}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-sm text-white/70 font-mono">{item.stats.forks}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-sm text-white/70 font-mono">{item.stats.watchers}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Pattern */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, ${colors.main} 0px, transparent 2px, transparent 10px, ${colors.main} 12px)`
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setSelectedItem(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-8 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-3xl z-50 flex items-center justify-center"
            >
              {(() => {
                const colors = getColorClasses(selectedItem.color);

                return (
                  <div className="relative w-full h-full lg:h-auto max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div
                      className="sticky top-0 px-4 md:px-6 py-4 border-b z-10 backdrop-blur-xl"
                      style={{
                        background: `linear-gradient(135deg, ${colors.main}25, ${colors.main}10)`,
                        borderBottomColor: `${colors.main}30`
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border-2 text-lg md:text-2xl flex-shrink-0"
                            style={{
                              background: `radial-gradient(circle, ${colors.main}50, ${colors.main}15)`,
                              borderColor: colors.main,
                              boxShadow: `0 0 20px ${colors.glow}`
                            }}
                          >
                            {selectedItem.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white text-sm md:text-base mb-1 truncate">{selectedItem.name}</h3>
                            <p className="text-white/60 text-xs md:text-sm truncate">{selectedItem.model}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedItem(null)}
                          className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth p-4 md:p-6 pb-6 md:pb-8 space-y-6">
                      {/* Category Badge */}
                      <div className="flex flex-wrap gap-3">
                        <div
                          className="px-4 py-2 rounded-xl border"
                          style={{
                            background: `${colors.main}15`,
                            borderColor: `${colors.main}30`,
                            color: colors.main
                          }}
                        >
                          <div className="text-xs uppercase tracking-wider">
                            {selectedItem.category === 'github' ? '💻 GitHub Project' : 
                             selectedItem.category === 'flight' ? '✈️ Flight Award' : 
                             '⛰️ Mountain Expedition'}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4" style={{ color: colors.main }} />
                          <span className="text-sm uppercase tracking-wider" style={{ color: colors.main }}>
                            Overview
                          </span>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                          {selectedItem.description}
                        </p>
                      </div>

                      {/* Specifications */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Fuel className="w-4 h-4" style={{ color: colors.main }} />
                          <span className="text-sm uppercase tracking-wider" style={{ color: colors.main }}>
                            {selectedItem.category === 'github' ? 'Technical Specifications' : 'Details'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedItem.category === 'github' ? (
                            <>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-0">
                                <div className="text-xs text-white/40 uppercase mb-1">Language</div>
                                <div className="text-white font-mono text-sm truncate">{selectedItem.specifications.language}</div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-0">
                                <div className="text-xs text-white/40 uppercase mb-1">Engine</div>
                                <div className="text-white font-mono text-sm truncate">{selectedItem.specifications.engine}</div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-0">
                                <div className="text-xs text-white/40 uppercase mb-1">Max Speed</div>
                                <div className="text-white font-mono text-sm truncate">{selectedItem.specifications.maxSpeed}</div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-0">
                                <div className="text-xs text-white/40 uppercase mb-1">Range</div>
                                <div className="text-white font-mono text-sm truncate">{selectedItem.specifications.range}</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-0">
                                <div className="text-xs text-white/40 uppercase mb-1">Location</div>
                                <div className="text-white font-mono text-sm truncate">{selectedItem.specifications.location}</div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 min-w-0">
                                <div className="text-xs text-white/40 uppercase mb-1">Date</div>
                                <div className="text-white font-mono text-sm truncate">{selectedItem.specifications.date}</div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-xs text-white/40 uppercase mb-1">
                                  {selectedItem.category === 'flight' ? 'Altitude' : 'Elevation'}
                                </div>
                                <div className="text-white font-mono">{selectedItem.specifications.elevation}</div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-xs text-white/40 uppercase mb-1">Difficulty</div>
                                <div className="text-white font-mono">{selectedItem.stats?.difficulty}</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Systems/Skills */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4" style={{ color: colors.main }} />
                          <span className="text-sm uppercase tracking-wider" style={{ color: colors.main }}>
                            {selectedItem.category === 'github' ? 'Onboard Systems' : 'Skills & Techniques'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.systems.map((system, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-2 rounded-lg border text-sm font-mono"
                              style={{
                                backgroundColor: `${colors.main}10`,
                                borderColor: `${colors.main}30`,
                                color: colors.main
                              }}
                            >
                              {system}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Achievements (for flight & mountain) */}
                      {selectedItem.achievements && selectedItem.achievements.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-4 h-4" style={{ color: colors.main }} />
                            <span className="text-sm uppercase tracking-wider" style={{ color: colors.main }}>
                              Key Achievements
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {selectedItem.achievements.map((achievement, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-white/70">
                                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: colors.main }} />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* GitHub Stats */}
                      {selectedItem.category === 'github' && selectedItem.stats && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Github className="w-4 h-4" style={{ color: colors.main }} />
                            <span className="text-sm uppercase tracking-wider" style={{ color: colors.main }}>
                              Performance Metrics
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-400/20 text-center">
                              <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                              <div className="text-2xl text-yellow-400 font-mono mb-1">
                                {selectedItem.stats.stars}
                              </div>
                              <div className="text-xs text-white/50 uppercase">Stars</div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-400/20 text-center">
                              <GitFork className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                              <div className="text-2xl text-cyan-400 font-mono mb-1">
                                {selectedItem.stats.forks}
                              </div>
                              <div className="text-xs text-white/50 uppercase">Forks</div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-400/20 text-center">
                              <Eye className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                              <div className="text-2xl text-purple-400 font-mono mb-1">
                                {selectedItem.stats.watchers}
                              </div>
                              <div className="text-xs text-white/50 uppercase">Watchers</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Button (GitHub only) */}
                      {selectedItem.url && (
                        <a
                          href={selectedItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3 rounded-xl border transition-all text-center font-mono uppercase tracking-wider text-sm"
                          style={{
                            background: `linear-gradient(135deg, ${colors.main}20, ${colors.main}10)`,
                            borderColor: `${colors.main}40`,
                            color: colors.main
                          }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            <span>View on GitHub</span>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
