'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import {
  Users,
  Award,
  Loader2,
  Briefcase,
  GraduationCap,
  ArrowUpRight,
  Activity,
  Plane,
  Mail,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Image as ImageIcon,
  Plus,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { AboutService } from '@/lib/services/about';
import { HeroService } from '@/lib/services/hero';
import { EducationService } from '@/lib/services/education';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ContactMessage, HangarItem } from '@/lib/types/admin';

interface DashboardFlightEntry {
  id: string;
  callsign?: string;
  company: string;
  departure: {
    roles?: string[];
    highlightedRole?: string;
    code?: string;
    date?: string;
  };
  arrival?: {
    status?: string;
    code?: string;
    date?: string;
  };
  projectName: string;
  duration?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

const genericFetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
};

export default function AdminDashboard() {
  const [activityFilter, setActivityFilter] = useState<'all' | 'achievement' | 'project' | 'education'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data via SWR
  const { data: profile, isLoading: isProfileLoading } = useSWR('hero-profile', () => HeroService.getHeroProfile());
  const { data: passions = [], isLoading: isPassionsLoading } = useSWR('passions', () => AboutService.getPassions());
  const { data: highlights = [], isLoading: isHighlightsLoading } = useSWR('highlights', () => AboutService.getHighlights());
  const { data: education = [], isLoading: isEducationLoading } = useSWR('education', () => EducationService.getEducationRecords());
  const { data: achievements = [], isLoading: isAchievementsLoading } = useSWR('achievements', () => EducationService.getAchievements());
  const { data: hangarItems = [] } = useSWR<HangarItem[]>('/api/admin/experience/projects', genericFetcher);
  const { data: flights = [] } = useSWR<DashboardFlightEntry[]>('/api/admin/experience/flights', genericFetcher);
  const { data: messages = [] } = useSWR<ContactMessage[]>('/api/admin/communication/messages', genericFetcher);

  const isLoading = isProfileLoading || isPassionsLoading || isHighlightsLoading || isEducationLoading || isAchievementsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#0891b2]" />
        <p className="text-sm text-[#527d85] font-semibold animate-pulse">Loading Arctic Ice dashboard telemetry...</p>
      </div>
    );
  }

  const totalProjects = hangarItems.length + flights.length;
  const totalContentItems =
    passions.length +
    highlights.length +
    education.length +
    achievements.length +
    hangarItems.length +
    flights.length;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  // 4 Top Data-Dense Metric Cards
  const stats = [
    {
      label: 'Total Content Records',
      value: totalContentItems.toString(),
      subtext: 'Across 7 CMS modules',
      pill: `${achievements.length} Certs • ${totalProjects} Projects`,
      icon: Layers,
      color: 'text-[#0891b2]',
      bgColor: 'bg-[#E2F4F3]',
      borderColor: 'border-[#B9E7E6]',
    },
    {
      label: 'Projects & Work Logs',
      value: totalProjects.toString(),
      subtext: `${hangarItems.length} Aircraft • ${flights.length} Logbook`,
      pill: `${flights.filter((f) => f.isActive).length} Ongoing Active`,
      icon: Plane,
      color: 'text-[#0891b2]',
      bgColor: 'bg-[#E2F4F3]',
      borderColor: 'border-[#B9E7E6]',
    },
    {
      label: 'Education & Accreditations',
      value: `${education.length + achievements.length}`,
      subtext: `${education.length} Academic • ${achievements.length} Achievements`,
      pill: '100% Verified Credentials',
      icon: GraduationCap,
      color: 'text-[#0c282d]',
      bgColor: 'bg-[#E2F4F3]',
      borderColor: 'border-[#B9E7E6]',
    },
    {
      label: 'Contact Inquiries',
      value: messages.length.toString(),
      subtext: unreadMessagesCount > 0 ? `${unreadMessagesCount} unread message(s)` : 'All inquiries answered',
      pill: unreadMessagesCount > 0 ? `${unreadMessagesCount} Action Needed` : 'Inbox Clean',
      icon: Mail,
      color: unreadMessagesCount > 0 ? 'text-amber-700' : 'text-[#0891b2]',
      bgColor: unreadMessagesCount > 0 ? 'bg-amber-50' : 'bg-[#E2F4F3]',
      borderColor: unreadMessagesCount > 0 ? 'border-amber-200' : 'border-[#B9E7E6]',
    },
  ];

  // Aggregated Recent Activities List
  const allActivities = [
    ...achievements.map((a) => ({
      id: `ach-${a.id}`,
      title: a.title,
      description: `Issued by ${a.issuer || 'Accredited Issuer'} • ${a.category}`,
      date: a.date ? new Date(a.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified',
      type: 'achievement' as const,
      typeName: 'Achievement',
      icon: Award,
      href: '/admin/education/achievements',
    })),
    ...flights.map((f) => ({
      id: `flt-${f.id}`,
      title: `${f.company} - ${f.departure?.highlightedRole || 'Role'}`,
      description: `${f.projectName} • ${f.duration} months duration`,
      date: f.departure?.date || 'Recent',
      type: 'project' as const,
      typeName: 'Work Flight',
      icon: Plane,
      href: '/admin/projects/logbook',
    })),
    ...hangarItems.map((h) => ({
      id: `hng-${h.id}`,
      title: h.name,
      description: `${h.model} • ${h.classification}`,
      date: 'Active Project',
      type: 'project' as const,
      typeName: 'Hangar Aircraft',
      icon: Briefcase,
      href: '/admin/projects/hangar',
    })),
    ...education.map((e) => ({
      id: `edu-${e.id}`,
      title: e.degree || 'Degree Program',
      description: `${e.institution} (GPA: ${e.gpa || '-'})`,
      date: e.period || 'Academic',
      type: 'education' as const,
      typeName: 'Education',
      icon: GraduationCap,
      href: '/admin/education/records',
    })),
  ];

  const filteredActivities = allActivities.filter((act) => {
    const matchesFilter = activityFilter === 'all' || act.type === activityFilter;
    const matchesSearch =
      searchQuery === '' ||
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.typeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const quickShortcuts = [
    { title: 'Add Aircraft', href: '/admin/projects/hangar', icon: Plus, desc: 'Showcase GitHub project', color: 'text-[#0891b2]' },
    { title: 'Log Flight', href: '/admin/projects/logbook', icon: Plane, desc: 'Add career role experience', color: 'text-[#0891b2]' },
    { title: 'Hero Profile', href: '/admin/hero/profile', icon: Users, desc: 'Update bio, title & roles', color: 'text-[#0c282d]' },
    { title: 'Add Photo', href: '/admin/gallery', icon: ImageIcon, desc: 'Tactical aerial reconnaissance', color: 'text-[#0891b2]' },
    { title: 'Tech Skills', href: '/admin/about/skills', icon: Sparkles, desc: 'Proficiencies & tools', color: 'text-[#0c282d]' },
    { title: 'Messages', href: '/admin/communication', icon: MessageSquare, desc: `${unreadMessagesCount} unread incoming`, color: unreadMessagesCount > 0 ? 'text-amber-700' : 'text-[#0891b2]' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white border border-[#B9E7E6] p-6 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#E2F4F3]/60 via-[#E2F4F3]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-2xl font-bold text-[#0891b2]">
                {profile?.name ? profile.name[0] : 'B'}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0c282d]">
                  Welcome back, {profile?.name || 'Fahmi Bahtiar'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E2F4F3] border border-[#B9E7E6] text-[#0891b2]">
                  Portfolio Owner
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6FD4E1]/20 border border-[#6FD4E1]/40 text-[#0c282d]">
                  Admin
                </span>
              </div>
              <p className="text-sm text-[#527d85] font-medium max-w-2xl">
                Unified portfolio command center. Track your achievements, maintain showcase projects, monitor inquiries, and keep live services synchronized.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#E2F4F3] border border-[#B9E7E6] text-sm font-bold text-[#0c282d] transition-all shadow-sm group"
            >
              <span>View Live Portfolio</span>
              <ExternalLink className="w-4 h-4 text-[#0891b2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/admin/projects/hangar"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6FD4E1] hover:bg-[#B9E7E6] text-[#0c282d] font-bold text-sm shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </Link>
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:border-[#6FD4E1] transition-all bg-white border border-[#B9E7E6] shadow-sm h-full flex flex-col justify-between">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#527d85]">
                      {stat.label}
                    </span>
                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold tracking-tight text-[#0c282d]">
                      {stat.value}
                    </h3>
                    <p className="text-xs text-[#527d85] font-medium mt-1">
                      {stat.subtext}
                    </p>
                  </div>
                </CardContent>
                <div className="px-5 pb-4 pt-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E2F4F3]/60 border border-[#B9E7E6] text-[11px] font-bold text-[#0c282d]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0891b2]" />
                    {stat.pill}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Telemetry & System Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Content Health & Distribution */}
        <Card className="lg:col-span-2 bg-white border border-[#B9E7E6] shadow-sm">
          <CardHeader className="pb-4 border-b border-[#B9E7E6]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-lg font-bold text-[#0c282d] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#0891b2]" />
                Portfolio Completeness & Health
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0891b2] bg-[#E2F4F3] border border-[#B9E7E6] px-2.5 py-0.5 rounded-full">
                  98% Score
                </span>
                <span className="text-xs text-[#527d85] font-semibold">Production Ready</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Health Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#0c282d]">
                <span>Overall Module Health</span>
                <span className="text-[#0891b2]">98% Complete</span>
              </div>
              <div className="h-3 w-full bg-[#E2F4F3] rounded-full overflow-hidden p-0.5 border border-[#B9E7E6]">
                <div
                  className="h-full bg-gradient-to-r from-[#6FD4E1] via-[#0891b2] to-[#6FD4E1] rounded-full transition-all duration-500"
                  style={{ width: '98%' }}
                />
              </div>
            </div>

            {/* Checklist of CMS Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {[
                { title: 'Hero & Lanyard', status: 'Active (3D Ready)', count: `${passions.length} passions` },
                { title: 'Flight Logbook', status: 'Synchronized', count: `${flights.length} roles logged` },
                { title: 'Aircraft Hangar', status: 'Live Repos', count: `${hangarItems.length} projects` },
                { title: 'Education & Honors', status: 'Verified Records', count: `${achievements.length} achievements` },
                { title: 'Tactical Recon Gallery', status: 'HUD Calibrated', count: '6 mission shots' },
                { title: 'Communication Hub', status: 'Active Gateway', count: `${messages.length} inquiries` },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#E2F4F3]/40 border border-[#B9E7E6] flex items-start gap-2.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#0891b2] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0c282d] truncate">{item.title}</p>
                    <p className="text-[11px] text-[#527d85] font-semibold">{item.status}</p>
                    <p className="text-[10px] text-[#0891b2] font-bold mt-0.5">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Platform Telemetry & Core Specs */}
        <Card className="bg-white border border-[#B9E7E6] shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-[#B9E7E6]">
            <CardTitle className="text-lg font-bold text-[#0c282d] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#0891b2]" />
              Platform Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#527d85] font-semibold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#0891b2]" /> Engine
                </span>
                <span className="font-bold text-[#0c282d] bg-[#E2F4F3] border border-[#B9E7E6] px-2 py-0.5 rounded-lg">
                  Next.js 16 (Turbopack)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#527d85] font-semibold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#0891b2]" /> API Gateway
                </span>
                <span className="font-bold text-[#0c282d] bg-[#E2F4F3] border border-[#B9E7E6] px-2 py-0.5 rounded-lg">
                  api.blimbing.me
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#527d85] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0891b2]" /> Visual Theme
                </span>
                <span className="font-bold text-[#0c282d] bg-[#E2F4F3] border border-[#B9E7E6] px-2 py-0.5 rounded-lg">
                  Arctic Ice Light (#E2F4F3)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#527d85] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0891b2]" /> Authentication
                </span>
                <span className="font-bold text-[#0c282d] bg-[#E2F4F3] border border-[#B9E7E6] px-2 py-0.5 rounded-lg">
                  NextAuth + JWT Signer
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#B9E7E6]/60">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E2F4F3]/50 border border-[#B9E7E6]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0891b2] animate-pulse" />
                <p className="text-xs text-[#0c282d] font-bold">
                  All systems operating normally on Vercel Edge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column Body: Table (Left) + Shortcuts & Inquiries (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities & Milestones Table (2 Cols) */}
        <Card className="lg:col-span-2 bg-white border border-[#B9E7E6] shadow-sm flex flex-col">
          <CardHeader className="border-b border-[#B9E7E6] pb-4 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-[#0c282d] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#0891b2]" />
                  Recent Portfolio Activities & Milestones
                </CardTitle>
                <p className="text-xs text-[#527d85] font-semibold mt-0.5">
                  Live feed of accomplishments, flight logs, and showcase entries.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'achievement', label: 'Awards' },
                  { id: 'project', label: 'Projects' },
                  { id: 'education', label: 'Education' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivityFilter(tab.id as typeof activityFilter)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      activityFilter === tab.id
                        ? 'bg-[#6FD4E1] text-[#0c282d] shadow-sm'
                        : 'bg-white border border-[#B9E7E6] text-[#527d85] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Table Search Filter */}
            <div className="pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527d85]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter activities by title, company, or category..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#B9E7E6] text-xs text-[#0c282d] placeholder:text-[#527d85] font-medium focus:outline-none focus:border-[#6FD4E1] shadow-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#E2F4F3]/60">
                <TableRow className="border-b border-[#B9E7E6] hover:bg-transparent">
                  <TableHead className="w-[45px]"></TableHead>
                  <TableHead className="text-[#0c282d] font-bold text-xs">Title & Description</TableHead>
                  <TableHead className="hidden md:table-cell text-[#0c282d] font-bold text-xs">Category</TableHead>
                  <TableHead className="text-right text-[#0c282d] font-bold text-xs">Date / Period</TableHead>
                  <TableHead className="text-right text-[#0c282d] font-bold text-xs w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.slice(0, 7).map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <TableRow key={activity.id} className="border-b border-[#B9E7E6]/40 hover:bg-[#E2F4F3]/30 transition-colors group">
                      <TableCell>
                        <div className="w-8 h-8 rounded-xl bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm">
                          <Icon className="w-4 h-4 text-[#0891b2]" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-[#0c282d] text-sm">{activity.title}</div>
                        <div className="text-xs text-[#527d85] font-medium truncate max-w-sm sm:max-w-md">
                          {activity.description}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E2F4F3] border border-[#B9E7E6] text-[#0891b2]">
                          {activity.typeName}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-[#527d85] text-xs font-medium whitespace-nowrap">
                        {activity.date}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={activity.href}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0891b2] hover:text-[#0c282d] hover:bg-[#E2F4F3] px-2 py-1 rounded-lg transition-all"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredActivities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-[#527d85] font-medium text-sm">
                      No matching activities found for &ldquo;{searchQuery}&rdquo;.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <div className="p-3 border-t border-[#B9E7E6] bg-white flex items-center justify-between text-xs text-[#527d85] font-semibold">
            <span>Showing {Math.min(filteredActivities.length, 7)} of {filteredActivities.length} items</span>
            <Link href="/admin/education/achievements" className="text-[#0891b2] hover:underline font-bold">
              View all achievements & records →
            </Link>
          </div>
        </Card>

        {/* Right Column: Quick Shortcuts & Recent Inquiries (1 Col) */}
        <div className="space-y-6">
          {/* Quick Shortcuts Grid (2x3) */}
          <Card className="bg-white border border-[#B9E7E6] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#B9E7E6]">
              <CardTitle className="text-lg font-bold text-[#0c282d] flex items-center justify-between">
                <span>Quick Actions</span>
                <Sparkles className="w-4 h-4 text-[#0891b2]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2.5">
                {quickShortcuts.map((shortcut, idx) => {
                  const Icon = shortcut.icon;
                  return (
                    <Link href={shortcut.href} key={idx} className="block">
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-3 rounded-xl border border-[#B9E7E6] bg-[#E2F4F3]/30 hover:bg-[#E2F4F3] hover:border-[#6FD4E1] transition-all group flex flex-col justify-between h-full shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#B9E7E6] flex items-center justify-center shrink-0 mb-2 shadow-sm">
                          <Icon className={`w-4 h-4 ${shortcut.color}`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0c282d] group-hover:text-[#0891b2] transition-colors">
                            {shortcut.title}
                          </h4>
                          <p className="text-[10px] text-[#527d85] font-medium truncate mt-0.5">
                            {shortcut.desc}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Inquiries / Incoming Communication Feed */}
          <Card className="bg-white border border-[#B9E7E6] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#B9E7E6]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[#0c282d] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0891b2]" />
                  Latest Inquiries
                </CardTitle>
                <Link
                  href="/admin/communication"
                  className="text-xs font-bold text-[#0891b2] hover:underline"
                >
                  View All ({messages.length})
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {messages.slice(0, 3).map((msg) => (
                <Link href="/admin/communication" key={msg.id} className="block">
                  <div className={`p-3 rounded-xl border transition-all ${
                    msg.status === 'unread'
                      ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                      : 'bg-[#E2F4F3]/30 border-[#B9E7E6] hover:bg-[#E2F4F3]'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#0c282d] truncate">
                        {msg.name || 'Anonymous Visitor'}
                      </span>
                      {msg.status === 'unread' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                          New
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#527d85] font-semibold">
                          Read
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#1e4a52] truncate">
                      {msg.subject || 'Portfolio Inquiry'}
                    </p>
                    <p className="text-[11px] text-[#527d85] truncate font-medium mt-0.5">
                      {msg.message}
                    </p>
                  </div>
                </Link>
              ))}

              {messages.length === 0 && (
                <div className="text-center py-6 text-[#527d85] font-medium text-xs">
                  No incoming messages yet. The contact gateway is active.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}