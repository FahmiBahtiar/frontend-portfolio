'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Github,
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Gauge,
  Radio,
  Shield,
  Zap,
  X,
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronUp,
  Calendar,
  MapPin,
  Award,
  Plus
} from 'lucide-react';

type CategoryType = 'github';

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
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function AircraftHangar() {
  const [selectedItem, setSelectedItem] = useState<HangarItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fetcher = async (url: string): Promise<HangarItem[]> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    const result = await res.json();
    return result.success && result.data ? result.data.sort((a: HangarItem, b: HangarItem) => a.order - b.order) : [];
  };

  const { data: hangarItems = [], error: fetchError, isLoading: loading } = useSWR(
    '/api/admin/experience/projects',
    fetcher
  );

  const error = fetchError ? 'Failed to load project data' : null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { main: string; glow: string; border: string } } = {
      cyan: { main: '#22d3ee', glow: '#22d3ee40', border: 'border-cyan-400/40' },
      green: { main: '#4ade80', glow: '#4ade8040', border: 'border-green-400/40' },
      purple: { main: '#a855f7', glow: '#a855f740', border: 'border-purple-400/40' },
      orange: { main: '#fb923c', glow: '#fb923c40', border: 'border-orange-400/40' }
    };
    return colors[color] || colors.cyan;
  };

  // Get all unique systems
  const allSystems = useMemo(() => {
    const systemSet = new Set<string>();
    hangarItems.forEach(item => {
      item.systems.forEach(system => systemSet.add(system));
    });
    return Array.from(systemSet).sort();
  }, [hangarItems]);

  // Filter items based on tab, category, search, and system filter
  const filteredItems = useMemo(() => {
    let filtered = hangarItems;

    // Search filtering
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.systems.some(system => system.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // System filtering
    if (selectedSystem) {
      filtered = filtered.filter(item => item.systems.includes(selectedSystem));
    }

    return filtered;
  }, [hangarItems, searchQuery, selectedSystem]);

  // Display items: show 3 (mobile) or 6 (desktop) or all based on showMore
  const displayedItems = showMore ? filteredItems : filteredItems.slice(0, isMobile ? 3 : 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading aircraft hangar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (hangarItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">No aircraft in hangar</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search and Filter in same row */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 focus-within:border-cyan-400/50 focus-within:bg-white/10 transition-all flex-1 md:min-w-[200px]">
              <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm placeholder-white/40 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-all flex-shrink-0 ${
                showFilters
                  ? 'bg-orange-500/20 border-orange-400/50 text-orange-400'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Filters</h4>
                <button
                  onClick={() => {
                    setSelectedSystem('');
                    setShowFilters(false);
                  }}
                  className="text-white/60 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* System Filter */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Technology</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSystem('')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      selectedSystem === ''
                        ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-400'
                        : 'bg-white/10 border border-white/20 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  {allSystems.map((system) => (
                    <button
                      key={system}
                      onClick={() => setSelectedSystem(system)}
                      className={`px-3 py-1 rounded-lg text-sm font-mono transition-all ${
                        selectedSystem === system
                          ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-400'
                          : 'bg-white/10 border border-white/20 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {system}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="text-white/60 text-sm">
        Showing {filteredItems.length} of {hangarItems.length} projects
        {(searchQuery || selectedSystem) && (
          <span className="ml-2">
            {searchQuery && `• Search: "${searchQuery}"`}
            {selectedSystem && `• Tech: ${selectedSystem}`}
          </span>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {displayedItems.map((item, index) => {
            const colors = getColorClasses(item.color);

            return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                >
                  <Card className="group cursor-pointer bg-slate-900/40 border-white/5 hover:bg-slate-900/60 hover:border-white/20 transition-all overflow-hidden h-full">
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
                            <Github className="w-6 h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-white/40 uppercase tracking-wider">
                                {item.classification}
                              </div>
                            </div>
                            <div className="text-xs font-mono text-white/70 truncate">
                              {item.model}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 space-y-4">
                      {/* Title & Description */}
                      <div>
                        <h4 className="text-white font-mono mb-2 truncate">{item.name}</h4>
                        <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Stats Panel */}
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                          <Shield className="w-3.5 h-3.5" style={{ color: colors.main }} />
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] text-white/40 uppercase">On board system</div>
                            <div className="text-xs text-white/70 font-mono truncate">
                              {item.systems.slice(0, 3).join(', ')}{item.systems.length > 3 ? '...' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show More Button */}
      {filteredItems.length > (isMobile ? 3 : 6) && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => setShowMore(!showMore)}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-mono uppercase tracking-wider text-sm"
          >
            {showMore ? 'Show Less' : `Show ${filteredItems.length - (isMobile ? 3 : 6)} More Projects`}
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
              onClick={() => setSelectedItem(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl pointer-events-auto"
            >
              {(() => {
                const colors = getColorClasses(selectedItem.color);

                return (
                  <div className="relative w-full max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
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
                            <Github className="w-6 h-6" />
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
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
