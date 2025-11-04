'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Award,
  Activity,
  ArrowUpRight,
  Calendar,
  Eye,
  Plane,
  Heart,
  Star,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { AboutService } from '@/lib/services/about';

interface DashboardStats {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load data from various APIs
        const [passions, highlights] = await Promise.all([
          AboutService.getPassions(),
          AboutService.getHighlights(),
        ]);

        // Create dynamic stats based on real data
        const dynamicStats: DashboardStats[] = [
          {
            label: 'Passions',
            value: passions.length.toString(),
            change: '+0',
            trend: 'neutral',
            icon: Users,
            iconColor: 'text-pink-400',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/20',
          },
          {
            label: 'Highlights',
            value: highlights.length.toString(),
            change: '+0',
            trend: 'neutral',
            icon: Award,
            iconColor: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
          },
          {
            label: 'Total Projects',
            value: highlights.find(h => h.label.toLowerCase().includes('project'))?.value || '0',
            change: '+0',
            trend: 'neutral',
            icon: FileText,
            iconColor: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/20',
          },
          {
            label: 'Experience Years',
            value: highlights.find(h => h.label.toLowerCase().includes('experience') || h.label.toLowerCase().includes('year'))?.value || '0',
            change: '+0',
            trend: 'neutral',
            icon: Calendar,
            iconColor: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
          },
        ];

        setStats(dynamicStats);
      } catch (error) {
        // Error handled by UI state
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const recentActivities = [
    {
      type: 'project',
      title: 'Added new project: React Dashboard Pro',
      time: '2 hours ago',
      dotColor: 'bg-cyan-400',
    },
    {
      type: 'education',
      title: 'Updated Bachelor degree information',
      time: '5 hours ago',
      dotColor: 'bg-purple-400',
    },
    {
      type: 'achievement',
      title: 'Added AWS Cloud Practitioner certification',
      time: '1 day ago',
      dotColor: 'bg-orange-400',
    },
    {
      type: 'contact',
      title: 'Updated contact information',
      time: '2 days ago',
      dotColor: 'bg-green-400',
    },
  ];

  const quickLinks = [
    {
      title: 'Hero Profile',
      description: 'Update your main profile information',
      href: '/admin/hero/profile',
      icon: Users,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Projects',
      description: 'Manage your project portfolio',
      href: '/admin/projects/hangar',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Education',
      description: 'Update education records',
      href: '/admin/education/records',
      icon: Award,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white/70">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Header */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-white/60 text-sm mt-1">Welcome back! Here's your portfolio overview</p>
                  </div>
                </div>
              </div>
              
              {/* Live indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className={`relative bg-slate-800/50 backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center border ${stat.borderColor}`}>
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="font-semibold">{stat.change}</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{stat.value}</h3>
                    <p className="text-white/60 text-sm font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Activities</h2>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-cyan-500/20"
                  >
                    <div className={`w-2 h-2 rounded-full ${activity.dotColor} mt-2 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-white/40" />
                        <p className="text-white/40 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block group"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                              {link.title}
                            </h3>
                            <p className="text-white/60 text-xs mt-1">{link.description}</p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>

              {/* View Portfolio Button */}
              <Link
                href="/"
                target="_blank"
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <Eye className="w-4 h-4" />
                View Live Portfolio
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
