'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Award, Code2, Plane, Mountain, Calendar, MapPin, Trophy, Star, ChevronDown, ChevronUp, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AltitudeTimeline } from '@/components/features/AltitudeTimeline';

interface Page3EducationProps {
  onNavigate?: (sectionIndex: number) => void;
}

export function Page3Education({ onNavigate }: Page3EducationProps = {}) {
  const [selectedAchievement, setSelectedAchievement] = useState<{
    category: string;
    index: number;
  } | null>(null);

  const education = [
    {
      degree: 'Bachelor of Network Engineering',
      institution: 'University of Technology',
      period: '2020 - 2024',
      gpa: '3.85',
      color: 'cyan',
    },
    {
      degree: 'Aviation Ground School',
      institution: 'Flight Training Academy',
      period: '2022 - 2023',
      gpa: 'Honor',
      color: 'orange',
    },
    {
      degree: 'Mountain Guide Certification',
      institution: 'Alpine Training Institute',
      period: '2021 - 2022',
      gpa: 'Certified',
      color: 'green',
    },
    {
      degree: 'Advanced Web Development',
      institution: 'Tech Bootcamp',
      period: '2023',
      gpa: 'Graduate',
      color: 'blue',
    },
  ];

  const achievements = {
    developer: [
      {
        title: 'Full Stack Development Certification',
        issuer: 'Tech Academy',
        date: '2023',
        icon: Code2,
      },
      {
        title: 'React Advanced Patterns',
        issuer: 'Online Platform',
        date: '2023',
        icon: Code2,
      },
      {
        title: 'Winner - Hackathon 2023',
        issuer: 'Tech Community',
        date: '2023',
        icon: Trophy,
      },
      {
        title: 'AWS Cloud Practitioner',
        issuer: 'Amazon Web Services',
        date: '2024',
        icon: Award,
      },
      {
        title: 'Node.js Certification',
        issuer: 'OpenJS Foundation',
        date: '2024',
        icon: Code2,
      },
    ],
    aviation: [
      {
        title: 'Private Pilot License (PPL)',
        issuer: 'Civil Aviation Authority',
        date: '2023',
        icon: Plane,
      },
      {
        title: 'Radio Telephony Certificate',
        issuer: 'Aviation Authority',
        date: '2022',
        icon: Plane,
      },
      {
        title: 'Aviation Safety Course',
        issuer: 'Flight School',
        date: '2022',
        icon: Award,
      },
      {
        title: 'Instrument Rating',
        issuer: 'Flight Academy',
        date: '2024',
        icon: Plane,
      },
    ],
    mountaineering: [
      {
        title: 'Advanced Mountain Guide',
        issuer: 'Mountain Federation',
        date: '2023',
        icon: Mountain,
      },
      {
        title: 'First Aid & Rescue',
        issuer: 'Outdoor Training',
        date: '2022',
        icon: Award,
      },
      {
        title: '7 Summits Achievement',
        issuer: 'Climbing Community',
        date: '2023',
        icon: Trophy,
      },
      {
        title: 'Ice Climbing Certification',
        issuer: 'Alpine Club',
        date: '2024',
        icon: Mountain,
      },
      {
        title: 'Wilderness Survival Expert',
        issuer: 'Outdoor Federation',
        date: '2024',
        icon: Award,
      },
      {
        title: 'Rock Climbing Instructor',
        issuer: 'Climbing Association',
        date: '2023',
        icon: Mountain,
      },
    ],
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { dot: string; text: string; border: string } } = {
      cyan: { dot: 'bg-cyan-400', text: 'text-cyan-400', border: 'border-cyan-400/30' },
      orange: { dot: 'bg-orange-400', text: 'text-orange-400', border: 'border-orange-400/30' },
      green: { dot: 'bg-green-400', text: 'text-green-400', border: 'border-green-400/30' },
      blue: { dot: 'bg-blue-400', text: 'text-blue-400', border: 'border-blue-400/30' },
    };
    return colors[color] || colors.cyan;
  };

  const achievementCategories = [
    {
      id: 'developer',
      label: 'Developer',
      icon: Code2,
      color: 'cyan',
      gradient: 'from-cyan-500/10 to-blue-500/10',
      borderColor: 'border-cyan-400/30',
      textColor: 'text-cyan-400',
      achievements: achievements.developer,
    },
    {
      id: 'aviation',
      label: 'Aviation',
      icon: Plane,
      color: 'orange',
      gradient: 'from-orange-500/10 to-pink-500/10',
      borderColor: 'border-orange-400/30',
      textColor: 'text-orange-400',
      achievements: achievements.aviation,
    },
    {
      id: 'mountaineering',
      label: 'Mountaineering',
      icon: Mountain,
      color: 'green',
      gradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-400/30',
      textColor: 'text-green-400',
      achievements: achievements.mountaineering,
    },
  ];

  const getSelectedAchievementDetail = () => {
    if (!selectedAchievement) return null;
    const category = achievementCategories.find((c) => c.id === selectedAchievement.category);
    if (!category) return null;
    return {
      achievement: category.achievements[selectedAchievement.index],
      category,
    };
  };

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-12 md:py-16 pt-24 lg:pt-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 mb-6"
          >
            <GraduationCap className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <h2 className="text-white mb-4">Education & Achievement</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Academic journey and certifications across development, aviation, and mountaineering
          </p>
        </motion.div>

        {/* Altitude Chart Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-white mb-8 flex items-center gap-3">
            <Mountain className="w-6 h-6 text-green-400" />
            Journey Timeline
            <span className="text-white/40 text-sm ml-2">2020 → 2024</span>
          </h3>
          
          {/* Info banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-orange-500/10 to-green-500/10 border border-white/10 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">
                  <span className="text-white">Altitude Chart:</span> Track my educational and professional journey
                </p>
                <p className="text-white/50 text-xs">
                  🧗 Click on waypoints to explore achievements • Higher altitude = Advanced milestones
                </p>
              </div>
            </div>
          </motion.div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8">
            <AltitudeTimeline />
          </div>
        </motion.div>

        {/* Achievements Section - Accordion with Split View */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h3 className="text-white mb-8 flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-400" />
            Achievements & Certifications
          </h3>

          <Accordion type="single" collapsible className="space-y-4">
            {achievementCategories.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              
              return (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className={`rounded-2xl bg-gradient-to-br ${category.gradient} backdrop-blur-xl border ${category.borderColor} overflow-hidden transition-all hover:border-white/40`}
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <CategoryIcon className={`w-6 h-6 ${category.textColor}`} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-white mb-1">{category.label}</h4>
                          <p className="text-white/60 text-sm">
                            {category.achievements.length} certifications
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full bg-white/10 ${category.textColor} text-sm`}>
                        {category.achievements.length}
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                    >
                      {/* Left: Achievement List */}
                      <div className="lg:col-span-1 space-y-2">
                        {category.achievements.map((achievement, index) => {
                          const Icon = achievement.icon;
                          const isSelected = selectedAchievement?.category === category.id && selectedAchievement?.index === index;
                          
                          return (
                            <motion.button
                              key={achievement.title}
                              onClick={() => setSelectedAchievement({ category: category.id, index })}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`w-full p-3 rounded-xl border transition-all text-left group/item ${
                                isSelected
                                  ? `bg-white/15 ${category.borderColor} border-white/40`
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-/item-hover:scale-110 transition-transform`}>
                                  <Icon className={`w-5 h-5 ${category.textColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm mb-0.5 transition-colors ${isSelected ? 'text-white' : 'text-white/80 group-hover/item:text-white'}`}>
                                    {achievement.title}
                                  </p>
                                  <p className="text-white/40 text-xs truncate">{achievement.issuer}</p>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className={`w-5 h-5 ${category.textColor} flex-shrink-0`} />
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Right: Certificate Detail Preview */}
                      <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                          {selectedAchievement?.category === category.id ? (
                            <motion.div
                              key={`${category.id}-${selectedAchievement.index}`}
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className={`p-8 rounded-2xl bg-gradient-to-br ${category.gradient} border-2 ${category.borderColor} relative overflow-hidden`}
                            >
                              {/* Certificate-style decorative corners */}
                              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/20 rounded-tl-2xl" />
                              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-white/20 rounded-tr-2xl" />
                              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-white/20 rounded-bl-2xl" />
                              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/20 rounded-br-2xl" />

                              {/* Content */}
                              <div className="relative text-center">
                                {/* Icon */}
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                  className="mx-auto mb-6"
                                >
                                  <div className={`w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto border-2 ${category.borderColor}`}>
                                    {(() => {
                                      const detail = getSelectedAchievementDetail();
                                      if (!detail) return null;
                                      const Icon = detail.achievement.icon;
                                      return <Icon className={`w-10 h-10 ${category.textColor}`} />;
                                    })()}
                                  </div>
                                </motion.div>

                                {/* Title */}
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border ${category.borderColor} mb-4`}>
                                    <Award className={`w-4 h-4 ${category.textColor}`} />
                                    <span className={`text-sm ${category.textColor}`}>
                                      {category.label} Certification
                                    </span>
                                  </div>
                                  <h3 className="text-white text-2xl mb-3">
                                    {getSelectedAchievementDetail()?.achievement.title}
                                  </h3>
                                  <p className="text-white/70 text-lg mb-6">
                                    {getSelectedAchievementDetail()?.achievement.issuer}
                                  </p>
                                </motion.div>

                                {/* Date & Meta */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="flex items-center justify-center gap-6 mb-6 pb-6 border-b border-white/10"
                                >
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-white/60" />
                                    <span className="text-white/60 text-sm">
                                      {getSelectedAchievementDetail()?.achievement.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-400" />
                                    <span className="text-white/60 text-sm">Certified</span>
                                  </div>
                                </motion.div>

                                {/* Signature-style line */}
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: 0.3, duration: 0.5 }}
                                  className="relative"
                                >
                                  <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-2" />
                                  <p className="text-white/40 text-xs italic">Achievement verified</p>
                                </motion.div>
                              </div>

                              {/* Background pattern */}
                              <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <div className="absolute inset-0" style={{
                                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                  backgroundSize: '30px 30px',
                                }} />
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="h-full min-h-[300px] flex items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10"
                            >
                              <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                  <Award className="w-8 h-8 text-white/30" />
                                </div>
                                <p className="text-white/50 mb-2">Select an achievement</p>
                                <p className="text-white/30 text-sm">Click on any certification to view details</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}
