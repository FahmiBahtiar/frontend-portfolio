'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plane,
  MapPin,
  Clock,
  Gauge,
  Calendar,
  Award,
  ChevronRight,
  CloudSun,
  TrendingUp,
  Star,
  Search,
  Filter,
  X,
  Briefcase,
  Users,
  Zap,
  Grid3X3,
  List,
  ChevronUp
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface FlightEntry {
  id: string;
  callsign: string;
  company: string; // Main display - company/organization name
  departure: {
    roles: string[];
    highlightedRole: string;
    code: string;
    date: string;
  };
  arrival: {
    status: string;
    code: string;
    date: string;
  };
  projectName: string; // Secondary - project or department
  duration: string; // in months
  crew: string[]; // technologies
  responsibilities: string[]; // what you did there
  color: string;
  location: string;
  category: string;
  order: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function FlightLogbook() {
  const [selectedEntry, setSelectedEntry] = useState<FlightEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [listItemsToShow, setListItemsToShow] = useState(3); // Show 3 items initially in list view
  const [showMore, setShowMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fetcher = async (url: string): Promise<FlightEntry[]> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch data');
    const result = await res.json();
    return result.success && result.data ? result.data.sort((a: FlightEntry, b: FlightEntry) => a.order - b.order) : [];
  };

  const { data: flightEntries = [], error: fetchError, isLoading: loading } = useSWR(
    // Public read — fetch the backend's public route directly.
    `${API_BASE_URL}/api/experience/flights`,
    fetcher
  );

  const error = fetchError ? 'Failed to load flight data' : null;

  // Reset list items to show when filters change
  useEffect(() => {
    setListItemsToShow(3);
    setShowMore(false);
  }, [activeTab, searchQuery, selectedTech]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { main: string; glow: string; border: string; bg: string } } = {
      purple: {
        main: '#a855f7',
        glow: '#a855f730',
        border: 'border-purple-400/40',
        bg: 'from-purple-500/15 to-purple-500/5'
      },
      orange: {
        main: '#fb923c',
        glow: '#fb923c30',
        border: 'border-orange-400/40',
        bg: 'from-orange-500/15 to-orange-500/5'
      },
      cyan: {
        main: '#22d3ee',
        glow: '#22d3ee30',
        border: 'border-cyan-400/40',
        bg: 'from-cyan-500/15 to-cyan-500/5'
      },
      green: {
        main: '#22c55e',
        glow: '#22c55e30',
        border: 'border-green-400/40',
        bg: 'from-green-500/15 to-green-500/5'
      },
      blue: {
        main: '#3b82f6',
        glow: '#3b82f630',
        border: 'border-blue-400/40',
        bg: 'from-blue-500/15 to-blue-500/5'
      }
    };
    return colors[color] || colors.cyan;
  };

  // Get all unique technologies
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    flightEntries.forEach(entry => {
      entry.crew.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [flightEntries]);

  // Filter entries based on active tab, search, and tech filter
  const filteredEntries = useMemo(() => {
    let filtered = flightEntries;

    // Tab filtering
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(entry => entry.isActive);
        break;
      default:
        break;
    }

    // Search filtering
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.departure.highlightedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.crew.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Technology filtering
    if (selectedTech) {
      filtered = filtered.filter(entry => entry.crew.includes(selectedTech));
    }

    return filtered;
  }, [flightEntries, activeTab, searchQuery, selectedTech]);

  // Display items: show 3 (mobile) or 6 (desktop) or all based on showMore for grid view
  const displayedEntries = showMore ? filteredEntries : filteredEntries.slice(0, isMobile ? 3 : 6);

  const tabs = [
    {
      id: 'all' as const,
      label: 'All Experience',
      icon: Grid3X3,
      count: flightEntries.length,
      color: 'cyan'
    },
    {
      id: 'active' as const,
      label: 'Active Roles',
      icon: Zap,
      count: flightEntries.filter(e => e.isActive).length,
      color: 'green'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading flight log...</div>
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

  if (flightEntries.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">No flight entries found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4">
        {/* Tabs and Controls in one row on desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-all ${
                    isActive
                      ? tab.color === 'cyan'
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400'
                        : 'bg-green-500/20 border-green-400/50 text-green-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">{tab.label}</span>
                  <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-xs ${
                    isActive 
                      ? tab.color === 'cyan'
                        ? 'bg-cyan-400/20 text-cyan-400'
                        : 'bg-green-400/20 text-green-400'
                      : 'bg-white/10 text-white/40'
                  }`}>
                    {tab.count}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Controls - In one row */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 focus-within:border-cyan-400/50 focus-within:bg-white/10 transition-all w-full md:w-auto md:min-w-[200px]">
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
                aria-label="Hapus pencarian"
                className="text-white/40 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Tampilkan filter"
            aria-pressed={showFilters}
            className={`p-2 rounded-lg border transition-all flex-shrink-0 ${
              showFilters
                ? 'bg-orange-500/20 border-orange-400/50 text-orange-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
          </motion.button>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-white/10 bg-white/5 flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Tampilan grid"
              aria-pressed={viewMode === 'grid'}
              className={`p-2 rounded-l-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-400 border-r border-white/10'
                  : 'text-white/60 hover:bg-white/10'
              }`}
            >
              <Grid3X3 className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="Tampilan daftar"
              aria-pressed={viewMode === 'list'}
              className={`p-2 rounded-r-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-white/60 hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
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
                    setSelectedTech('');
                    setShowFilters(false);
                  }}
                  aria-label="Tutup filter"
                  className="text-white/60 hover:text-white p-1"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Technology Filter */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Technology</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTech('')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      selectedTech === ''
                        ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-400'
                        : 'bg-white/10 border border-white/20 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  {allTechnologies.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setSelectedTech(tech)}
                      className={`px-3 py-1 rounded-lg text-sm font-mono transition-all ${
                        selectedTech === tech
                          ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-400'
                          : 'bg-white/10 border border-white/20 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {tech}
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
        Showing {filteredEntries.length} of {flightEntries.length} experiences
        {(searchQuery || selectedTech) && (
          <span className="ml-2">
            {searchQuery && `• Search: "${searchQuery}"`}
            {selectedTech && `• Tech: ${selectedTech}`}
          </span>
        )}
      </div>

      {/* Experience Grid/List */}
      <AnimatePresence mode="wait">
        {filteredEntries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/50 mb-2">No experiences found</p>
            <p className="text-white/30 text-sm">Try adjusting your filters or search terms</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeTab}-${viewMode}-${searchQuery}-${selectedTech}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }
          >
            {/* Grid View - Show limited items */}
            {viewMode === 'grid' && displayedEntries.map((entry, index) => {
              const colors = getColorClasses(entry.color);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <Card className="group cursor-pointer bg-slate-900/40 border-white/5 hover:bg-slate-900/60 hover:border-white/20 transition-all overflow-hidden h-full">
                    <CardContent className="p-5">
                      {/* Grid Card Content */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `radial-gradient(circle, ${colors.main}30, ${colors.main}10)`,
                        border: `2px solid ${colors.main}40`
                      }}
                    >
                      <Plane className="w-5 h-5" style={{ color: colors.main }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm truncate">{entry.company}</h4>
                      <p className="text-white/60 text-xs truncate">{entry.departure.highlightedRole}</p>
                      <p className="text-white/40 text-xs truncate">{entry.projectName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-white/70">{entry.duration} mo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-white/40" />
                      <span className="text-white/70 truncate">{entry.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-xs">{entry.arrival.status}</span>
                    {entry.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/30 text-green-400 text-xs flex-shrink-0">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {entry.crew.slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-xs font-mono"
                        style={{
                          backgroundColor: `${colors.main}15`,
                          color: colors.main
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {entry.crew.length > 4 && (
                      <span className="text-white/40 text-xs">+{entry.crew.length - 4}</span>
                    )}
                  </div>

                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Show More Button for Grid View */}
            {viewMode === 'grid' && filteredEntries.length > (isMobile ? 3 : 6) && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setShowMore(!showMore)}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-mono uppercase tracking-wider text-sm"
                >
                  {showMore ? 'Show Less' : `Show ${filteredEntries.length - (isMobile ? 3 : 6)} More Experiences`}
                </Button>
              </div>
            )}

            {/* List View - Show limited items with Show More */}
            {viewMode === 'list' && (
              <>
                {filteredEntries.slice(0, listItemsToShow).map((entry, index) => {
                  const colors = getColorClasses(entry.color);

                  return (
                    <Card
                      key={entry.id}
                      className="group cursor-pointer bg-slate-900/40 border-white/5 hover:bg-slate-900/60 hover:border-white/20 transition-all overflow-hidden"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      {/* List Card Content */}
                      <div
                        className="px-4 md:px-6 py-4 border-b cursor-pointer"
                        style={{
                          background: `linear-gradient(90deg, ${colors.main}20, ${colors.main}05)`,
                          borderBottomColor: `${colors.main}30`
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center border-2"
                                style={{
                                  background: `radial-gradient(circle, ${colors.main}40, ${colors.main}10)`,
                                  borderColor: colors.main,
                                  boxShadow: `0 0 15px ${colors.glow}`
                                }}
                              >
                                <Plane className="w-5 h-5" style={{ color: colors.main }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold text-lg truncate">{entry.company}</h4>
                                <div className="flex items-center gap-2">
                                  <p className="text-white/50 text-sm truncate">{entry.projectName}</p>
                                  {entry.isActive && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex-shrink-0">
                                      <Star className="w-3 h-3 fill-yellow-400" />
                                      Active
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                  <span className="text-white/70 font-mono truncate">{entry.departure.code}</span>
                                  <span className="text-white/50 text-xs truncate">{entry.departure.highlightedRole}</span>
                                </div>
                              </div>

                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              >
                                <ChevronRight className="w-4 h-4" style={{ color: colors.main }} />
                              </motion.div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-white/50 text-xs truncate">{entry.arrival.status}</span>
                                  <span className="text-white/70 font-mono truncate">{entry.departure.code}</span>
                                  <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <div
                              className="px-3 py-2 rounded-xl border text-center"
                              style={{
                                background: `linear-gradient(135deg, ${colors.main}20, ${colors.main}10)`,
                                borderColor: `${colors.main}40`
                              }}
                            >
                              <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Duration</div>
                              <div className="font-mono font-bold" style={{ color: colors.main }}>
                                {entry.duration} mo
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 md:p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-white/40 text-xs">Start Date</div>
                              <div className="text-white/70 text-xs font-mono truncate">
                                {entry.departure.date ? new Date(entry.departure.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric'
                                }) : 'N/A'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-white/40 text-xs">End Date</div>
                              <div className="text-white/70 text-xs font-mono truncate">
                                {entry.arrival.date ? new Date(entry.arrival.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric'
                                }) : 'N/A'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-white/40 text-xs">Status</div>
                              <div className="text-white/70 text-xs font-mono truncate">{entry.arrival.status}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-white/40 text-xs">Location</div>
                              <div className="text-white/70 text-xs font-mono truncate">{entry.location}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {entry.crew.slice(0, 6).map((member, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className="px-3 py-1.5 rounded-lg border text-xs font-mono"
                              style={{
                                backgroundColor: `${colors.main}15`,
                                borderColor: `${colors.main}30`,
                                color: colors.main
                              }}
                            >
                              {member}
                            </motion.span>
                          ))}
                          {entry.crew.length > 6 && (
                            <span className="text-white/40 text-xs self-center">+{entry.crew.length - 6} more</span>
                          )}
                        </div>
                      </div>

                    </Card>
                  );
                })}

                {/* Show More/Less Button for List View */}
                {filteredEntries.length > 3 && viewMode === 'list' && (
                  <div className="flex justify-center pt-4">
                    {listItemsToShow < filteredEntries.length ? (
                      <Button
                        onClick={() => setListItemsToShow(prev => Math.min(prev + 3, filteredEntries.length))}
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Show More ({filteredEntries.length - listItemsToShow} remaining)
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setListItemsToShow(3)}
                        variant="outline"
                        className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                      >
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Show Less
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedEntry && (
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
                className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                onClick={() => setSelectedEntry(null)}
              />

              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedEntry && (
                  <div className="p-6">
                    {(() => {
                      const entry = selectedEntry;
                      const colors = getColorClasses(entry.color);

                      return (
                        <>
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start gap-4">
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center border-2"
                                style={{
                                  background: `radial-gradient(circle, ${colors.main}40, ${colors.main}10)`,
                                  borderColor: colors.main
                                }}
                              >
                                <Plane className="w-6 h-6" style={{ color: colors.main }} />
                              </div>
                              <div>
                                <h3 className="text-white text-xl font-bold">{entry.company}</h3>
                                <p className="text-white/60">{entry.departure.highlightedRole}</p>
                                <p className="text-white/40 text-sm">{entry.projectName}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedEntry(null)}
                              aria-label="Tutup detail"
                              className="text-white/60 hover:text-white p-2"
                            >
                              <span aria-hidden="true">✕</span>
                            </button>
                          </div>

                          {/* Full Details */}
                          <div className="space-y-6">
                            {/* Quick Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Duration</div>
                                <div className="text-white font-mono">{entry.duration} months</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Status</div>
                                <div className="text-white">{entry.arrival.status}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Location</div>
                                <div className="text-white">{entry.location}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Start Date</div>
                                <div className="text-white font-mono">
                                  {entry.departure.date ? new Date(entry.departure.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                  }) : 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Technologies */}
                            <div>
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: colors.main }} />
                                Technologies Used
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {entry.crew.map((tech, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 rounded-lg border text-sm font-mono"
                                    style={{
                                      backgroundColor: `${colors.main}15`,
                                      borderColor: `${colors.main}30`,
                                      color: colors.main
                                    }}
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Roles */}
                            {entry.departure.roles && entry.departure.roles.length > 0 && (
                              <div>
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor: colors.main }} />
                                  Roles & Responsibilities
                                </h4>
                                <div className="space-y-3">
                                  {entry.departure.roles.map((role, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                      <div
                                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                          role === entry.departure.highlightedRole ? 'ring-2 ring-offset-1 ring-offset-gray-900' : ''
                                        }`}
                                        style={{
                                          backgroundColor: role === entry.departure.highlightedRole ? colors.main : colors.main + '80'
                                        }}
                                      />
                                      <div className="flex-1">
                                        <span className={`font-medium ${role === entry.departure.highlightedRole ? 'text-white' : 'text-white/80'}`}>
                                          {role === entry.departure.highlightedRole && '★ '}
                                          {role}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Responsibilities */}
                            {entry.responsibilities && entry.responsibilities.length > 0 && (
                              <div>
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor: colors.main }} />
                                  Key Achievements
                                </h4>
                                <ul className="space-y-2">
                                  {entry.responsibilities.map((responsibility, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-white/80">
                                      <Award className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colors.main }} />
                                      <span>{responsibility}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      , document.body)}

      {/* Career Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h4 className="text-white">Career Summary</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-400/20">
            <div className="text-3xl text-purple-400 mb-1 font-mono">
              {flightEntries.reduce((sum, entry) => sum + parseInt(entry.duration), 0)}+
            </div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Total Months</div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-400/20">
            <div className="text-3xl text-orange-400 mb-1 font-mono">{flightEntries.length}</div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Total Roles</div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-400/20">
            <div className="text-3xl text-cyan-400 mb-1 font-mono">
              {flightEntries.reduce((sum, entry) => sum + entry.crew.length, 0)}
            </div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Tech Mastered</div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-400/20">
            <div className="text-3xl text-green-400 mb-1 font-mono">
              {flightEntries.filter(e => e.isActive).length}
            </div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Active Roles</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}