'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import useSWR, { mutate } from 'swr';
import { GraduationCap, Award, Code2, Plane, Mountain, Calendar, MapPin, Trophy, Star, CheckCircle2, ExternalLink, Loader2, X, ChevronLeft, type LucideIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { EducationService } from '@/lib/services/education';
import { Achievement } from '@/lib/types/admin';
import { FALLBACK_EDUCATION_RECORDS, FALLBACK_ACHIEVEMENTS } from '@/lib/fallback-data';
import { JourneyScrollStory } from '@/components/features/JourneyScrollStory';
import { useIsMobile } from '@/components/ui/use-mobile';

// WebGL (three.js / R3F) interactive 3D paper flight journey
// with low-poly origami paper airplane, paper clouds, and in-sky story milestones.
const ItomPaperFlightTimeline = dynamic(
  () =>
    import('@/components/features/ItomPaperFlightTimeline').then((m) => ({
      default: m.ItomPaperFlightTimeline,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[640px] rounded-3xl border border-[#B9E7E6] bg-white/60 animate-pulse flex items-center justify-center font-mono text-xs text-[#527d85]">
        Launching 3D Sky Journey Timeline...
      </div>
    ),
  },
);

interface Page3EducationProps {
  onNavigate?: (sectionIndex: number) => void;
}

export function Page3Education({ onNavigate }: Page3EducationProps = {}) {
  const isMobile = useIsMobile();
  const [selectedAchievement, setSelectedAchievement] = useState<{
    category: string;
    achievementId: string;
  } | null>(null);

  // SWR for data fetching with instant fallback to avoid spinner block
  const { data: educationRecords = [], isLoading: isEduLoading, error: eduError } = useSWR(
    'educationRecords',
    () => EducationService.getEducationRecords(),
    { fallbackData: FALLBACK_EDUCATION_RECORDS }
  );

  const { data: achievements = [], isLoading: isAchLoading, error: achError } = useSWR(
    'achievementsData',
    () => EducationService.getAchievements(),
    { fallbackData: FALLBACK_ACHIEVEMENTS }
  );

  const loading = (isEduLoading || isAchLoading) && educationRecords.length === 0;
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
    const iconMap: Record<string, LucideIcon> = {
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-[#B9E7E6] mb-8 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-sm text-[#0891b2]">
            <GraduationCap className="w-10 h-10 text-[#0891b2]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0c282d] mb-4 tracking-tight">Education & Achievement</h2>
          <p className="text-[#2d5f68] max-w-2xl mx-auto text-lg">
            Academic journey and certifications across development, aviation, and mountaineering
          </p>
        </div>

        {/* Journey Flight Timeline (Desktop 3D Odyssey & Mobile Dark Card Scroll) */}
        <div className="mb-20 scroll-mt-36 pt-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Plane className="w-6 h-6 text-[#0891b2]" />
              <h3 className="text-[#0c282d] font-mono font-bold tracking-wider">JOURNEY FLIGHT TIMELINE</h3>
            </div>
            <div className="flex-1 h-px bg-[#B9E7E6]" />
            <span className="text-[#527d85] font-mono text-sm hidden sm:block">3D SKY ODYSSEY • 2010 → NOW</span>
          </div>

          {/* Desktop 3D Canvas Flight Odyssey */}
          <div className="hidden md:block">
            {!isMobile && <ItomPaperFlightTimeline educationRecords={educationRecords} />}
          </div>

          {/* Mobile Dark Card Scroll Story */}
          <div className="block md:hidden">
            <Card className="bg-slate-900/80 border border-slate-800/80 mb-6 overflow-hidden shadow-lg">
              <CardContent className="p-4 bg-slate-900/60">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-[#6FD4E1]/30 flex items-center justify-center shrink-0 text-[#6FD4E1]">
                    <MapPin className="w-5 h-5 text-[#6FD4E1]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold mb-0.5">
                      Scroll to explore
                    </p>
                    <p className="text-[#B9E7E6] text-xs font-mono">
                      The path draws itself as you scroll • Milestones reveal as you reach them
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-800/80 bg-slate-950/90 overflow-hidden shadow-2xl rounded-2xl">
              <CardContent className="p-5 sm:p-8">
                <JourneyScrollStory educationRecords={educationRecords} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-[#0891b2]" />
              <h3 className="text-[#0c282d] font-mono font-bold tracking-wider">CERTIFICATIONS</h3>
            </div>
            <div className="flex-1 h-px bg-[#B9E7E6]" />
          </div>

          <Accordion type="single" collapsible className="space-y-6">
            {achievementCategories.map((category) => {
              const CategoryIcon = category.icon;

              return (
                <Card key={category.id} className="overflow-hidden border border-[#B9E7E6] bg-white/90 hover:border-[#6FD4E1] shadow-sm transition-all">
                  <AccordionItem value={category.id} className="border-0">
                    <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] group-hover:scale-105 transition-transform shadow-sm">
                            <CategoryIcon className="w-7 h-7 text-[#0891b2]" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-[#0c282d] font-bold text-lg mb-1">{category.label}</h4>
                            <p className="text-[#527d85] text-sm font-mono">
                              {category.achievements.length} records found
                            </p>
                          </div>
                        </div>
                        <div className="px-3.5 py-1.5 rounded-full bg-[#B9E7E6]/40 border border-[#6FD4E1]/40 text-[#0c282d] font-mono text-sm font-bold">
                          {category.achievements.length}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6 border-t border-[#B9E7E6]">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                        {/* Left: Achievement List */}
                        <div className={`lg:col-span-1 lg:h-[600px] overflow-hidden flex-col ${selectedAchievement?.category === category.id ? 'hidden lg:flex' : 'flex'}`}>
                          {/* List */}
                          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {category.achievements.map((achievement) => {
                              const isSelected = selectedAchievement?.category === category.id && selectedAchievement?.achievementId === achievement.id;

                              return (
                                <button
                                  key={achievement.id}
                                  onClick={() => setSelectedAchievement({ category: category.id, achievementId: achievement.id })}
                                  className={`w-full p-4 rounded-xl border text-left group transition-all duration-300 ${isSelected
                                      ? 'bg-[#E2F4F3] border-[#6FD4E1] shadow-sm'
                                      : 'bg-white border-[#B9E7E6] hover:border-[#6FD4E1]'
                                    }`}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#6FD4E1]/20 text-[#0891b2]' : 'bg-[#E2F4F3] text-[#0891b2]'}`}>
                                      {(() => {
                                        const AchievementIcon = getIcon(achievement.icon);
                                        return <AchievementIcon className="w-5 h-5 text-[#0891b2]" />;
                                      })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-semibold text-sm mb-1 line-clamp-2 ${isSelected ? 'text-[#0c282d]' : 'text-[#1e4a52]'}`}>
                                        {achievement.title}
                                      </p>
                                      <p className="text-[#527d85] text-xs font-mono truncate">{achievement.issuer}</p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: Detail Preview */}
                        <div className={`lg:col-span-2 min-h-[500px] lg:h-[600px] flex-col ${selectedAchievement?.category === category.id ? 'flex' : 'hidden lg:flex'}`}>
                          <AnimatePresence mode="wait">
                            {selectedAchievement?.category === category.id ? (
                              <motion.div
                                key={`${category.id}-${selectedAchievement.achievementId}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full h-full rounded-2xl bg-white border border-[#B9E7E6] p-8 flex flex-col relative overflow-hidden shadow-md"
                              >
                                <div className="relative flex-1 flex flex-col">
                                  {/* Mobile Back Button */}
                                  <button
                                    onClick={() => setSelectedAchievement(null)}
                                    className="lg:hidden flex items-center gap-2 text-sm text-[#0c282d] hover:text-[#0891b2] mb-6 w-fit transition-colors font-bold"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-[#E2F4F3] flex items-center justify-center border border-[#B9E7E6]">
                                      <ChevronLeft className="w-4 h-4 text-[#0891b2]" />
                                    </div>
                                    Back to list
                                  </button>

                                  {getSelectedAchievementDetail()?.achievement.certificateUrl ? (
                                    <>
                                      <div className="flex-1 relative mb-6 min-h-[300px]">
                                        <Image
                                          src={getSelectedAchievementDetail()?.achievement.certificateUrl as string}
                                          alt={`Certificate: ${getSelectedAchievementDetail()?.achievement.title ?? 'achievement'}`}
                                          fill
                                          className="object-contain rounded-xl"
                                        />
                                      </div>
                                      {getSelectedAchievementDetail()?.achievement.credentialUrl && (
                                        <div className="text-center mt-auto">
                                          <Button
                                            variant="outline"
                                            className="border-[#6FD4E1] text-[#0c282d] hover:bg-[#6FD4E1]/20 font-bold"
                                            onClick={() => window.open(getSelectedAchievementDetail()?.achievement.credentialUrl, '_blank')}
                                          >
                                            <ExternalLink className="w-4 h-4 mr-2 text-[#0891b2]" />
                                            Verify Credential
                                          </Button>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                      <div className="w-24 h-24 rounded-2xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center mb-8 rotate-3 shadow-sm">
                                        <Award className="w-12 h-12 text-[#0891b2]" />
                                      </div>
                                      <h3 className="text-2xl font-bold text-[#0c282d] mb-4">
                                        {getSelectedAchievementDetail()?.achievement.title}
                                      </h3>
                                      <p className="text-[#0891b2] text-lg mb-8 font-semibold">
                                        {getSelectedAchievementDetail()?.achievement.issuer}
                                      </p>
                                      <div className="flex items-center gap-6 text-sm font-mono text-[#527d85] font-bold">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-[#0891b2]" />
                                          {getSelectedAchievementDetail()?.achievement.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Trophy className="w-4 h-4 text-[#0891b2]" />
                                          Certified
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ) : (
                              <div className="w-full h-full rounded-2xl border-2 border-dashed border-[#B9E7E6] flex flex-col items-center justify-center text-[#527d85] bg-white/50">
                                <Award className="w-12 h-12 mb-4 text-[#0891b2] opacity-70" />
                                <p className="font-mono text-sm font-bold text-[#0c282d]">SELECT RECORD TO VIEW</p>
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
