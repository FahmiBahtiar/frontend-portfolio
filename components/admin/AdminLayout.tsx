'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '@/components/ui/logo';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Briefcase,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Plane,
  Award,
  Code2,
  Mountain
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
  subItems?: {
    label: string;
    href: string;
  }[];
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auto-expand menu items based on current path
  const getInitialExpandedItems = () => {
    const expanded: string[] = [];
    if (pathname?.startsWith('/admin/hero')) expanded.push('Hero Section');
    if (pathname?.startsWith('/admin/about')) expanded.push('About/Portfolio');
    if (pathname?.startsWith('/admin/education')) expanded.push('Education');
    if (pathname?.startsWith('/admin/projects')) expanded.push('Experience & Projects');
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpandedItems());

  // Update expanded items when pathname changes
  useEffect(() => {
    setExpandedItems(getInitialExpandedItems());
  }, [pathname]);

  // Force dark mode for admin panel
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#0f172a';
    return () => {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
    };
  }, []);

  const navigation: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Hero Section',
      href: '/admin/hero',
      icon: User,
      subItems: [
        { label: 'Profile', href: '/admin/hero/profile' },
        { label: 'Social Links', href: '/admin/hero/social' },
      ]
    },
    {
      label: 'About/Portfolio',
      href: '/admin/about',
      icon: Code2,
      subItems: [
        { label: 'Lanyard Card', href: '/admin/about/lanyard' },
        { label: 'Passions', href: '/admin/about/passions' },
        { label: 'Highlights', href: '/admin/about/highlights' },
        { label: 'Skills', href: '/admin/about/skills' },
      ]
    },
    {
      label: 'Education',
      href: '/admin/education',
      icon: GraduationCap,
      subItems: [
        { label: 'Education Records', href: '/admin/education/records' },
        { label: 'Achievements', href: '/admin/education/achievements' },
      ]
    },
    {
      label: 'Experience & Projects',
      href: '/admin/projects',
      icon: Briefcase,
      subItems: [
        { label: 'Flight Logbook', href: '/admin/projects/logbook' },
        { label: 'Aircraft Hangar', href: '/admin/projects/hangar' },
      ]
    },
    {
      label: 'Contact',
      href: '/admin/contact',
      icon: Mail,
    },
    {
      label: 'Communication',
      href: '/admin/communication',
      icon: Mail,
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed lg:sticky left-0 top-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col lg:z-auto"
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Logo size={40} />
                <div>
                  <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                  <p className="text-white/50 text-xs">Portfolio CMS</p>
                </div>
              </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav 
              className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedItems.includes(item.label);

                return (
                  <div key={item.label}>
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                          active
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          active
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Sub Items */}
                    <AnimatePresence>
                      {hasSubItems && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.subItems?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`block px-4 py-2 rounded-lg text-sm transition-all ${
                                pathname === subItem.href
                                  ? 'bg-cyan-500/10 text-cyan-400'
                                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* User Section - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-white/10 bg-slate-900/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  FB
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">Fahmi Bahtiar</p>
                  <p className="text-white/50 text-xs truncate">Admin</p>
                </div>
              </div>
              <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-all"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              
              {/* Breadcrumb or page title can go here */}
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs text-cyan-400 font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
