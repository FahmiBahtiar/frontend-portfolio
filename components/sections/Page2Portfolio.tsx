'use client';

import { motion } from 'motion/react';
import { Code2, Plane, Mountain, GraduationCap, Briefcase, Trophy, Target, Heart } from 'lucide-react';
import { LanyardCard } from '@/components/features/LanyardCard';

interface Page2PortfolioProps {
  onNavigate?: (sectionIndex: number) => void;
}

export function Page2Portfolio({ onNavigate }: Page2PortfolioProps = {}) {
  const passions = [
    {
      icon: Code2,
      title: 'Developer',
      color: 'cyan',
      description: 'Crafting elegant solutions with modern web technologies',
      stats: { label: 'Projects', value: '25+' },
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      icon: Plane,
      title: 'Aviation',
      color: 'blue',
      description: 'Fascinated by flight systems and aerospace technology',
      stats: { label: 'Flight Hours', value: '50+' },
      gradient: 'from-blue-500/20 to-purple-500/20'
    },
    {
      icon: Mountain,
      title: 'Mountaineer',
      color: 'green',
      description: 'Exploring peaks and conquering new heights',
      stats: { label: 'Peaks Climbed', value: '12' },
      gradient: 'from-green-500/20 to-emerald-500/20'
    }
  ];

  const highlights = [
    {
      icon: GraduationCap,
      label: 'Education',
      value: 'Network & Telecom',
      color: 'purple'
    },
    {
      icon: Briefcase,
      label: 'Experience',
      value: '3+ Years',
      color: 'cyan'
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: '15 Awards',
      color: 'yellow'
    },
    {
      icon: Target,
      label: 'Focus',
      value: 'Full-Stack Dev',
      color: 'pink'
    }
  ];

  const skills = {
    developer: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Next.js', 'PostgreSQL'],
    aviation: ['Flight Dynamics', 'ATC Communications', 'Navigation Systems', 'Aircraft Systems'],
    mountaineering: ['Peak Climbing', 'Technical Trekking', 'Survival Skills', 'Map & Compass']
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
                  const Icon = item.icon;
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
                      <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/0 to-${item.color}-500/0 group-hover:from-${item.color}-500/10 group-hover:to-${item.color}-500/5 transition-all`} />
                      
                      <div className="relative">
                        <Icon className={`w-6 h-6 text-${item.color}-400 mb-2`} />
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
                  const Icon = passion.icon;
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
                      <div className={`absolute inset-0 bg-gradient-to-br ${passion.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      <div className="relative flex items-start gap-4">
                        {/* Icon */}
                        <div className="relative flex-shrink-0">
                          <motion.div
                            className={`absolute inset-0 rounded-full blur-xl bg-${passion.color}-400/40`}
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
                          <div className={`relative w-12 h-12 rounded-full bg-${passion.color}-500/20 border border-${passion.color}-400/30 flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 text-${passion.color}-400`} />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="text-white">{passion.title}</h4>
                            <div className="text-right flex-shrink-0">
                              <p className={`text-${passion.color}-400`}>{passion.stats.value}</p>
                              <p className="text-white/50 text-xs">{passion.stats.label}</p>
                            </div>
                          </div>
                          <p className="text-white/60 text-sm mb-3">{passion.description}</p>
                          
                          {/* Skills */}
                          <div className="flex flex-wrap gap-2">
                            {(passion.title === 'Developer' ? skills.developer.slice(0, 3) :
                              passion.title === 'Aviation' ? skills.aviation.slice(0, 3) :
                              skills.mountaineering.slice(0, 3)).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 rounded-md bg-white/10 text-white/70 text-xs border border-white/5"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
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
      </div>
    </div>
  );
}
