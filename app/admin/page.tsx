'use client';

import { motion } from 'motion/react';
import useSWR from 'swr';
import {
  LayoutDashboard,
  Users,
  Award,
  Eye,
  Loader2,
  Star,
  Briefcase,
  GraduationCap,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { AboutService } from '@/lib/services/about';
import { HeroService } from '@/lib/services/hero';
import { EducationService } from '@/lib/services/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminDashboard() {
  // Fetch real data via SWR
  const { data: profile, isLoading: isProfileLoading } = useSWR('hero-profile', () => HeroService.getHeroProfile());
  const { data: passions, isLoading: isPassionsLoading } = useSWR('passions', () => AboutService.getPassions());
  const { data: highlights, isLoading: isHighlightsLoading } = useSWR('highlights', () => AboutService.getHighlights());
  const { data: education, isLoading: isEducationLoading } = useSWR('education', () => EducationService.getEducationRecords());
  const { data: achievements, isLoading: isAchievementsLoading } = useSWR('achievements', () => EducationService.getAchievements());

  const isLoading = isProfileLoading || isPassionsLoading || isHighlightsLoading || isEducationLoading || isAchievementsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Passions',
      value: passions?.length?.toString() || '0',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Highlights',
      value: highlights?.length?.toString() || '0',
      icon: Star,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Education Records',
      value: education?.length?.toString() || '0',
      icon: GraduationCap,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      label: 'Achievements',
      value: achievements?.length?.toString() || '0',
      icon: Award,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  // Map to recent activities dynamically based on data
  const recentActivities = [
    ...(achievements?.slice(0, 3).map(a => ({
      title: a.title,
      description: `New achievement added in ${a.category}`,
      date: new Date(a.date).toLocaleDateString(),
      type: 'Achievement',
      icon: Award,
      color: 'text-emerald-400'
    })) || []),
    ...(education?.slice(0, 2).map(e => ({
      title: e.degree || 'Degree',
      description: `Studied at ${e.institution}`,
      date: e.period || 'Present',
      type: 'Education',
      icon: GraduationCap,
      color: 'text-cyan-400'
    })) || []),
  ].slice(0, 5);

  const quickLinks = [
    { title: 'Hero Profile', href: '/admin/hero/profile', icon: Users, desc: 'Manage intro & roles' },
    { title: 'Education', href: '/admin/education/records', icon: GraduationCap, desc: 'Update academic history' },
    { title: 'Projects', href: '/admin/projects/hangar', icon: Briefcase, desc: 'Manage portfolio items' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome back, {profile?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-sm text-muted-foreground">Here's your data-dense portfolio overview.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Live
          </Link>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Live API</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:border-blue-500/30 transition-colors bg-black/20 border-white/5">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-md ${stat.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-2xl font-semibold tracking-tight mt-0.5">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities Table */}
        <Card className="lg:col-span-2 bg-black/20 border-white/5 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Recent Activities
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <TableRow key={idx} className="border-white/5 group">
                      <TableCell>
                        <div className={`w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors ${activity.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-white/90">{activity.title}</div>
                        <div className="text-xs text-muted-foreground">{activity.description}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {activity.type}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm whitespace-nowrap">
                        {activity.date}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {recentActivities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No recent activities found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Links Column */}
        <div className="space-y-6">
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link href={link.href} key={idx} className="block">
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded bg-black/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white/90">{link.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
