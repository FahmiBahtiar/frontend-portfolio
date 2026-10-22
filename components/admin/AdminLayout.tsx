'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  Mountain,
  Users,
  Shield,
  type LucideIcon
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  subItems?: {
    label: string;
    href: string;
  }[];
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // Default sidebar state: open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Track which area is being hovered for scroll control
  const [hoveredArea, setHoveredArea] = useState<'sidebar' | 'main' | null>(null);
  
  // Track if we're on desktop for responsive margin
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsSidebarOpen(desktop);
      setIsDesktop(desktop);
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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

  // Use clean Arctic Ice Light theme for admin panel
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = '#E2F4F3';
    return () => {
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
      label: 'Gallery',
      href: '/admin/gallery',
      icon: Mountain,
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
      label: 'Users',
      href: '/admin/users',
      icon: Users,
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
    <div className="min-h-screen h-screen bg-[#E2F4F3] text-[#0c282d] overflow-hidden overscroll-behavior-contain">
      {/* Sidebar - Always rendered but can be hidden */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : -256,
          width: isSidebarOpen ? 256 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-[#B9E7E6] shadow-sm flex flex-col flex-shrink-0 overflow-hidden overscroll-behavior-contain z-10 ${!isSidebarOpen ? 'pointer-events-none' : ''}`}
        style={{ minWidth: isSidebarOpen ? '256px' : '0' }}
        onMouseEnter={() => setHoveredArea('sidebar')}
        onMouseLeave={() => setHoveredArea(null)}
      >
        {/* Logo - Fixed at top */}
        <div className="p-6 border-b border-[#B9E7E6] flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-[#0c282d] font-bold text-lg whitespace-nowrap">Admin Panel</h1>
              <p className="text-[#527d85] text-xs font-semibold whitespace-nowrap">Portfolio CMS</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable in middle */}
        <nav 
          className={`flex-1 p-4 space-y-2 overflow-x-hidden scrollbar-thin scrollbar-thumb-[#B9E7E6] scrollbar-track-transparent overscroll-behavior-contain ${
            hoveredArea === 'sidebar' ? 'overflow-y-auto' : 
            hoveredArea === 'main' ? 'overflow-y-hidden' : 
            'overflow-y-auto'
          } ${hoveredArea === 'main' ? 'pointer-events-none' : ''}`}
          style={{ width: '256px' }}
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
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                            : 'text-[#1e4a52] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-semibold">{item.label}</span>
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                            : 'text-[#1e4a52] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-semibold">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-[#6FD4E1] text-[#0c282d] font-bold text-xs px-2 py-1 rounded-full">
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
                                  ? 'bg-[#E2F4F3] text-[#0891b2] font-bold border-l-2 border-[#6FD4E1]'
                                  : 'text-[#527d85] hover:bg-[#E2F4F3]/60 hover:text-[#0c282d]'
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
            <div className="flex-shrink-0 p-4 border-t border-[#B9E7E6] bg-[#E2F4F3]/40">
              {status === 'loading' ? (
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#B9E7E6]"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-[#B9E7E6] rounded mb-2"></div>
                      <div className="h-3 bg-[#B9E7E6] rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ) : session?.user ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-[#B9E7E6]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#6FD4E1] flex items-center justify-center text-[#0c282d] font-bold shadow-sm">
                        {session.user.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0c282d] text-sm font-bold truncate">
                        {session.user.name || 'User'}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[#527d85] text-xs truncate capitalize font-medium">
                          {session.user.role || 'user'}
                        </p>
                        {session.user.role === 'admin' && (
                          <Shield className="w-3 h-3 text-[#0891b2]" />
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-500/10 font-bold transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="text-center text-[#527d85] text-sm font-medium">
                  Not logged in
                </div>
              )}
            </div>
          </motion.aside>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && !isDesktop && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-9 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div 
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 bg-[#E2F4F3]"
        style={{ marginLeft: isSidebarOpen && isDesktop ? '256px' : '0' }}
      >
        {/* Header */}
        <header className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-[#B9E7E6] shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={toggleSidebar}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl text-[#0c282d] hover:bg-[#E2F4F3] transition-all"
                aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isSidebarOpen ? 0 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </motion.div>
              </motion.button>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E2F4F3] border border-[#B9E7E6] shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#6FD4E1]" />
                  <span className="text-xs text-[#0891b2] font-bold font-mono">Live</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main 
          className={`flex-1 p-6 overscroll-behavior-contain ${
            hoveredArea === 'main' ? 'overflow-y-auto' : 
            hoveredArea === 'sidebar' ? 'overflow-y-hidden' : 
            'overflow-y-auto'
          } ${hoveredArea === 'sidebar' ? 'pointer-events-none' : ''}`}
          onMouseEnter={() => setHoveredArea('main')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
