'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plane,
  MapPin,
  Clock,
  Gauge,
  Calendar,
  Award,
  ChevronRight,
  CloudSun,
  TrendingUp
} from 'lucide-react';

interface FlightEntry {
  id: string;
  callsign: string;
  company: string; // Main display - company/organization name
  departure: {
    role: string;
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
  flightHours: string; // displayed as years
  crew: string[]; // technologies
  responsibilities: string[]; // what you did there
  color: string;
  location: string;
  category: string;
}

export function FlightLogbook() {
  const [selectedEntry, setSelectedEntry] = useState<string | null>('flight-1');

  const flightEntries: FlightEntry[] = [
    {
      id: 'work-1',
      callsign: 'WRK-001',
      company: 'Tech Solutions Inc.',
      departure: {
        role: 'Full Stack Developer',
        code: 'FSD',
        date: '2024-01-15'
      },
      arrival: {
        status: 'Current',
        code: 'CUR',
        date: 'Present'
      },
      projectName: 'E-Commerce Platform',
      duration: '10',
      flightHours: '10 mo',
      crew: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL'],
      responsibilities: [
        'Developed and maintained e-commerce platform serving 10k+ active users',
        'Implemented real-time inventory management and order tracking system',
        'Integrated payment gateways (Stripe, Midtrans) and shipping APIs',
        'Led code reviews and mentored 3 junior developers'
      ],
      location: 'Remote',
      category: 'Development',
      color: 'purple'
    },
    {
      id: 'work-2',
      callsign: 'WRK-002',
      company: 'FinTech Solutions',
      departure: {
        role: 'Backend Engineer',
        code: 'BKE',
        date: '2023-06-01'
      },
      arrival: {
        status: 'Completed',
        code: 'CMP',
        date: '2023-12-31'
      },
      projectName: 'Banking Integration',
      duration: '7',
      flightHours: '7 mo',
      crew: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
      responsibilities: [
        'Integrated 5 major Indonesian bank APIs (BCA, Mandiri, BNI, BRI, Permata)',
        'Built real-time transaction monitoring and reconciliation system',
        'Implemented security protocols achieving SOC 2 compliance',
        'Optimized database queries handling 100k+ daily transactions'
      ],
      location: 'Jakarta',
      category: 'Development',
      color: 'cyan'
    },
    {
      id: 'work-3',
      callsign: 'WRK-003',
      company: 'Startup Indonesia',
      departure: {
        role: 'Frontend Developer',
        code: 'FED',
        date: '2022-08-01'
      },
      arrival: {
        status: 'Team Lead',
        code: 'TLD',
        date: '2023-05-31'
      },
      projectName: 'Analytics Dashboard',
      duration: '10',
      flightHours: '10 mo',
      crew: ['React', 'D3.js', 'Chart.js', 'WebSocket', 'Material-UI'],
      responsibilities: [
        'Led frontend team of 4 developers in building analytics platform',
        'Developed real-time data visualization with D3.js and Chart.js',
        'Implemented WebSocket for live data streaming (1M+ data points/day)',
        'Reduced initial load time by 65% through code splitting and lazy loading'
      ],
      location: 'Remote',
      category: 'Leadership',
      color: 'purple'
    },
    {
      id: 'work-4',
      callsign: 'WRK-004',
      company: 'Freelance Projects',
      departure: {
        role: 'Full Stack Developer',
        code: 'FSD',
        date: '2021-01-01'
      },
      arrival: {
        status: 'Multiple Clients',
        code: 'MLC',
        date: '2022-07-31'
      },
      projectName: 'Various Client Projects',
      duration: '19',
      flightHours: '1.5 yrs',
      crew: ['React', 'Vue.js', 'Laravel', 'WordPress', 'MySQL'],
      responsibilities: [
        'Delivered 15+ projects for local businesses (restaurants, retail, services)',
        'Built custom CMS and inventory management systems',
        'Developed responsive websites and e-commerce solutions',
        'Provided maintenance and technical support for ongoing projects'
      ],
      location: 'Various',
      category: 'Freelance',
      color: 'orange'
    },
    {
      id: 'work-5',
      callsign: 'WRK-005',
      company: 'Open Source Community',
      departure: {
        role: 'Contributor',
        code: 'CON',
        date: '2020-03-01'
      },
      arrival: {
        status: 'Maintainer',
        code: 'MNT',
        date: 'Ongoing'
      },
      projectName: 'React UI Library',
      duration: '56',
      flightHours: '4+ yrs',
      crew: ['React', 'TypeScript', 'Storybook', 'Jest', 'Rollup'],
      responsibilities: [
        'Core maintainer of popular React UI component library (5k+ stars)',
        'Reviewed 200+ pull requests and mentored new contributors',
        'Published 25+ releases with new components and bug fixes',
        'Library used by 100+ companies including Fortune 500'
      ],
      location: 'Remote',
      category: 'Open Source',
      color: 'cyan'
    }
  ];

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
      }
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div className="space-y-4">
      {flightEntries.map((entry, index) => {
        const colors = getColorClasses(entry.color);
        const isSelected = selectedEntry === entry.id;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative"
          >
            {/* Glow Effect */}
            {isSelected && (
              <motion.div
                layoutId="flight-glow"
                className="absolute -inset-1 rounded-2xl blur-xl opacity-40"
                style={{ background: colors.glow }}
              />
            )}

            {/* Flight Entry Card */}
            <motion.div
              layout
              className={`relative rounded-2xl bg-gradient-to-br backdrop-blur-xl border overflow-hidden transition-all ${
                isSelected ? `${colors.border} bg-white/10` : 'border-white/10 bg-white/5'
              }`}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedEntry(isSelected ? null : entry.id)}
            >
              {/* Logbook Page Header */}
              <div
                className="px-4 md:px-6 py-4 border-b cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, ${colors.main}20, ${colors.main}05)`,
                  borderBottomColor: `${colors.main}30`
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Callsign */}
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
                        <p className="text-white/50 text-sm truncate">{entry.projectName}</p>
                      </div>
                    </div>

                    {/* Flight Route */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          <span className="text-white/70 font-mono truncate">{entry.departure.code}</span>
                          <span className="text-white/50 text-xs truncate">{entry.departure.role}</span>
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
                          <span className="text-white/70 font-mono truncate">{entry.arrival.code}</span>
                          <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Time Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className="px-3 py-2 rounded-xl border text-center"
                      style={{
                        background: `linear-gradient(135deg, ${colors.main}20, ${colors.main}10)`,
                        borderColor: `${colors.main}40`
                      }}
                    >
                      <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Flight Hours</div>
                      <div className="font-mono font-bold" style={{ color: colors.main }}>
                        {entry.flightHours}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Details - Main Content */}
              <div className="p-4 md:p-6">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-white/40 text-xs">Start Date</div>
                      <div className="text-white/70 text-xs font-mono truncate">{entry.departure.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-white/40 text-xs">End Date</div>
                      <div className="text-white/70 text-xs font-mono truncate">{entry.arrival.date}</div>
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

                {/* Expandable Details */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="pt-4 mt-4 border-t space-y-4"
                        style={{ borderTopColor: `${colors.main}20` }}
                      >
                        {/* Technologies */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-1 h-4 rounded-full"
                              style={{ backgroundColor: colors.main }}
                            />
                            <span className="text-xs uppercase tracking-wider" style={{ color: colors.main }}>
                              Technologies
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pl-4">
                            {entry.crew.map((member, idx) => (
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
                          </div>
                        </div>

                        {/* Responsibilities */}
                        {entry.responsibilities && entry.responsibilities.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-1 h-4 rounded-full"
                                style={{ backgroundColor: colors.main }}
                              />
                              <span className="text-xs uppercase tracking-wider" style={{ color: colors.main }}>
                                Responsibilities
                              </span>
                            </div>
                            <ul className="space-y-2 pl-4">
                              {entry.responsibilities.map((responsibility, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="flex items-start gap-2 text-sm text-white/60"
                                >
                                  <Award className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colors.main }} />
                                  <span>{responsibility}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Runway Lines Background */}
              <div
                className="absolute bottom-0 left-0 right-0 h-20 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, ${colors.main} 0px, transparent 2px, transparent 20px, ${colors.main} 22px)`
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Total Flight Stats */}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-400/20">
            <div className="text-3xl text-purple-400 mb-1 font-mono">
              {flightEntries.reduce((sum, entry) => sum + parseInt(entry.duration), 0)}+
            </div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Total Months Experience</div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-400/20">
            <div className="text-3xl text-orange-400 mb-1 font-mono">{flightEntries.length}</div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Projects Completed</div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-400/20">
            <div className="text-3xl text-cyan-400 mb-1 font-mono">
              {flightEntries.reduce((sum, entry) => sum + entry.crew.length, 0)}
            </div>
            <div className="text-sm text-white/50 uppercase tracking-wider">Technologies Mastered</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
