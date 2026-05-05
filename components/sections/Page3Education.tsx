'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import useSWR, { mutate } from 'swr';
import { GraduationCap, Award, Code2, Plane, Mountain, Calendar, MapPin, Trophy, Star, CheckCircle2, ExternalLink, Loader2, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AltitudeTimeline } from '@/components/features/AltitudeTimeline';
import { EducationService } from '@/lib/services/education';
import { Education, Achievement } from '@/lib/types/admin';

interface Page3EducationProps {
  onNavigate?: (sectionIndex: number) => void;
}

export function Page3Education({ onNavigate }: Page3EducationProps = {}) {
  const [selectedAchievement, setSelectedAchievement] = useState<{
    category: string;
    achievementId: string;
  } | null>(null);

  // SWR for data fetching
  const { data: educationRecords = [], isLoading: isEduLoading, error: eduError } = useSWR(
    'educationRecords',
    () => EducationService.getEducationRecords()
  );

  const { data: achievements = [], isLoading: isAchLoading, error: achError } = useSWR(
    'achievementsData',
    () => EducationService.getAchievements()
  );

  const loading = isEduLoading || isAchLoading;
  const error = eduError || achError ? 'Failed to load education data' : null;

  // Listen for data updates from admin panel via local storage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'achievements_updated') {
        mutate('achievementsData');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Group achievements by category and sort by order
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  // Sort achievements within each category by order
  Object.keys(achievementsByCategory).forEach(category => {
    achievementsByCategory[category].sort((a, b) => (a.order || 0) - (b.order || 0));
  });

  // Icon mapping function
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Code2, Plane, Mountain, Award, Trophy, Star, GraduationCap, Calendar, MapPin, CheckCircle2, ExternalLink,
    };
    return iconMap[iconName] || Award;
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
      achievements: achievementsByCategory.developer || [],
    },
    {
      id: 'aviation',
      label: 'Aviation',
      icon: Plane,
      color: 'orange',
      gradient: 'from-orange-500/10 to-pink-500/10',
      borderColor: 'border-orange-400/30',
      textColor: 'text-orange-400',
      achievements: achievementsByCategory.aviation || [],
    },
    {
      id: 'mountaineering',
      label: 'Mountaineering',
      icon: Mountain,
      color: 'green',
      gradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-400/30',
      textColor: 'text-green-400',
      achievements: achievementsByCategory.mountaineering || [],
    },
  ];

  const getSelectedAchievementDetail = () => {
    if (!selectedAchievement) return null;
    const category = achievementCategories.find((c) => c.id === selectedAchievement.category);
    if (!category) return null;
    const achievement = category.achievements.find((a) => a.id === selectedAchievement.achievementId);
    if (!achievement) return null;
    return {
      achievement,
      category,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full px-4 md:px-8 py-12 md:py-16 pt-24 lg:pt-28 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-cyan-500 mb-4" />
          <p className="text-slate-400 font-mono">Synchronizing records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full px-4 md:px-8 py-12 md:py-16 pt-24 lg:pt-28 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 mb-4 font-mono">{error}</p>
          <Button variant="outline" onClick={() => mutate('educationRecords')}>Retry Link</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-12 md:py-16 pt-24 lg:pt-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-cyan-500/30 mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
            <GraduationCap className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Education & Achievement</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Academic journey and certifications across development, aviation, and mountaineering
          </p>
        </div>

        {/* Altitude Chart Timeline */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Mountain className="w-6 h-6 text-emerald-400" />
              <h3 className="text-white font-mono font-bold tracking-wider">JOURNEY TIMELINE</h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
            <span className="text-slate-500 font-mono text-sm hidden sm:block">2010 → Now</span>
          </div>

          <Card className="bg-slate-900/60 border-emerald-500/20 mb-8 overflow-hidden">
            <CardContent className="p-4 bg-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-semibold mb-1">
                    Altitude Chart Mode
                  </p>
                  <p className="text-slate-400 text-xs font-mono">
                    Click waypoints to explore • Higher altitude indicates advanced milestones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <AltitudeTimeline educationRecords={educationRecords} />
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-mono font-bold tracking-wider">CERTIFICATIONS</h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
          </div>

          <Accordion type="single" collapsible className="space-y-6">
            {achievementCategories.map((category) => {
              const CategoryIcon = category.icon;

              return (
                <Card key={category.id} className={`overflow-hidden border-${category.color}-500/20 bg-slate-900/40 hover:border-${category.color}-500/40 transition-colors`}>
                  <AccordionItem value={category.id} className="border-0">
                    <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-${category.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <CategoryIcon className={`w-7 h-7 text-${category.color}-400`} />
                          </div>
                          <div className="text-left">
                            <h4 className="text-white font-bold text-lg mb-1">{category.label}</h4>
                            <p className="text-slate-400 text-sm font-mono">
                              {category.achievements.length} records found
                            </p>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full bg-${category.color}-500/10 border border-${category.color}-500/30 text-${category.color}-400 font-mono text-sm font-bold`}>
                          {category.achievements.length}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6 border-t border-white/5">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                        {/* Left: Achievement List */}
                        <div className="lg:col-span-1 lg:h-[600px] overflow-hidden flex flex-col">
                          {/* List */}
                          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {category.achievements.map((achievement) => {
                              const isSelected = selectedAchievement?.category === category.id && selectedAchievement?.achievementId === achievement.id;

                              return (
                                <button
                                  key={achievement.id}
                                  onClick={() => setSelectedAchievement({ category: category.id, achievementId: achievement.id })}
                                  className={`w-full p-4 rounded-xl border text-left group transition-all duration-300 ${isSelected
                                      ? `bg-${category.color}-500/10 border-${category.color}-500/50 shadow-lg shadow-${category.color}-500/10`
                                      : 'bg-white/5 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? `bg-${category.color}-500/20` : 'bg-white/10'}`}>
                                      {(() => {
                                        const AchievementIcon = getIcon(achievement.icon);
                                        return <AchievementIcon className={`w-5 h-5 ${isSelected ? `text-${category.color}-400` : 'text-slate-400'}`} />;
                                      })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-semibold text-sm mb-1 line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                        {achievement.title}
                                      </p>
                                      <p className="text-slate-500 text-xs font-mono truncate">{achievement.issuer}</p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: Detail Preview */}
                        <div className="lg:col-span-2 h-[600px] flex">
                          <AnimatePresence mode="wait">
                            {selectedAchievement?.category === category.id ? (
                              <motion.div
                                key={`${category.id}-${selectedAchievement.achievementId}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full h-full rounded-2xl bg-black/40 border border-white/10 p-8 flex flex-col relative overflow-hidden"
                              >
                                {/* Decorative background */}
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-${category.color}-500/5 rounded-full blur-3xl`} />

                                <div className="relative flex-1 flex flex-col">
                                  {getSelectedAchievementDetail()?.achievement.certificateUrl ? (
                                    <>
                                      <div className="flex-1 relative mb-6 min-h-[300px]">
                                        <Image
                                          src={getSelectedAchievementDetail()?.achievement.certificateUrl as string}
                                          alt="Certificate"
                                          fill
                                          className="object-contain rounded-xl"
                                          unoptimized
                                        />
                                      </div>
                                      {getSelectedAchievementDetail()?.achievement.credentialUrl && (
                                        <div className="text-center mt-auto">
                                          <Button
                                            variant="outline"
                                            className={`border-${category.color}-500/30 text-${category.color}-400 hover:bg-${category.color}-500/10`}
                                            onClick={() => window.open(getSelectedAchievementDetail()?.achievement.credentialUrl, '_blank')}
                                          >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Verify Credential
                                          </Button>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                      <div className={`w-24 h-24 rounded-2xl bg-${category.color}-500/10 border border-${category.color}-500/20 flex items-center justify-center mb-8 rotate-3`}>
                                        <Award className={`w-12 h-12 text-${category.color}-400`} />
                                      </div>
                                      <h3 className="text-2xl font-bold text-white mb-4">
                                        {getSelectedAchievementDetail()?.achievement.title}
                                      </h3>
                                      <p className="text-slate-400 text-lg mb-8">
                                        {getSelectedAchievementDetail()?.achievement.issuer}
                                      </p>
                                      <div className="flex items-center gap-6 text-sm font-mono text-slate-500">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
                                          {getSelectedAchievementDetail()?.achievement.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Trophy className="w-4 h-4" />
                                          Certified
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ) : (
                              <div className="w-full h-full rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-500">
                                <Award className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-mono text-sm">SELECT RECORD TO VIEW</p>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              );
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
