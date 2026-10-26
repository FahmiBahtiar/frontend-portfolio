'use client';

import { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Code2,
  Mountain,
  Users,
  Shield,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface SubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  subItems?: SubItem[];
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Desktop default: expanded (true), mobile default: closed (false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // Floating popout state for collapsed icon-only mode
  const [popoutItem, setPopoutItem] = useState<{
    item: NavItem;
    top: number;
  } | null>(null);

  // Timeout ref for smooth popout hover transitions
  const popoutCloseTimeout = useRef<NodeJS.Timeout | null>(null);

  // Track which area is being hovered for scroll control
  const [hoveredArea, setHoveredArea] = useState<'sidebar' | 'main' | null>(null);

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

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update expanded items when pathname changes
  useEffect(() => {
    setExpandedItems(getInitialExpandedItems());
  }, [pathname]);

  // Maintain Arctic Ice theme
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
      ],
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
      ],
    },
    {
      label: 'Education',
      href: '/admin/education',
      icon: GraduationCap,
      subItems: [
        { label: 'Education Records', href: '/admin/education/records' },
        { label: 'Achievements', href: '/admin/education/achievements' },
      ],
    },
    {
      label: 'Experience & Projects',
      href: '/admin/projects',
      icon: Briefcase,
      subItems: [
        { label: 'Flight Logbook', href: '/admin/projects/logbook' },
        { label: 'Aircraft Hangar', href: '/admin/projects/hangar' },
      ],
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
      icon: MessageSquare,
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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    setPopoutItem(null);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (item: NavItem) => {
    if (item.href === '/admin') {
      return pathname === '/admin';
    }
    if (pathname?.startsWith(item.href)) {
      return true;
    }
    if (item.subItems) {
      return item.subItems.some((sub) => pathname?.startsWith(sub.href));
    }
    return false;
  };

  // Hover handlers for collapsed sidebar mode
  const handleItemMouseEnter = (item: NavItem, e: React.MouseEvent<HTMLElement>) => {
    if (isSidebarOpen || !isDesktop) return;
    if (popoutCloseTimeout.current) {
      clearTimeout(popoutCloseTimeout.current);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoutItem({
      item,
      top: rect.top,
    });
  };

  const handleItemMouseLeave = () => {
    if (isSidebarOpen || !isDesktop) return;
    popoutCloseTimeout.current = setTimeout(() => {
      setPopoutItem(null);
    }, 150);
  };

  const handlePopoutMouseEnter = () => {
    if (popoutCloseTimeout.current) {
      clearTimeout(popoutCloseTimeout.current);
    }
  };

  const handlePopoutMouseLeave = () => {
    popoutCloseTimeout.current = setTimeout(() => {
      setPopoutItem(null);
    }, 150);
  };

  // Determine sidebar width based on desktop and open state
  const sidebarWidth = isDesktop ? (isSidebarOpen ? 256 : 72) : 256;

  return (
    <div className="min-h-screen h-screen bg-[#E2F4F3] text-[#0c282d] overflow-hidden overscroll-behavior-contain">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: !isDesktop && !isSidebarOpen ? -256 : 0,
          width: sidebarWidth,
        }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-[#B9E7E6] shadow-sm flex flex-col flex-shrink-0 z-30 transition-[width] duration-200"
        style={{ width: `${sidebarWidth}px` }}
        onMouseEnter={() => setHoveredArea('sidebar')}
        onMouseLeave={() => setHoveredArea(null)}
      >
        {/* Logo & Header Section */}
        <div className="h-16 px-4 border-b border-[#B9E7E6] flex items-center justify-between flex-shrink-0 bg-white">
          <Link
            href="/admin"
            className={`flex items-center gap-3 overflow-hidden ${
              !isSidebarOpen && isDesktop ? 'justify-center w-full' : ''
            }`}
          >
            <Logo size={36} />
            {(isSidebarOpen || !isDesktop) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden min-w-0"
              >
                <h1 className="text-[#0c282d] font-bold text-base leading-tight truncate">Admin Panel</h1>
                <p className="text-[#527d85] text-xs font-semibold truncate">Portfolio CMS</p>
              </motion.div>
            )}
          </Link>

          {/* Quick toggle button on desktop inside expanded sidebar */}
          {isSidebarOpen && isDesktop && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[#527d85] hover:text-[#0c282d] hover:bg-[#E2F4F3] transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation - Scrollable */}
        <nav
          className={`flex-1 py-4 space-y-1.5 overflow-x-hidden scrollbar-thin scrollbar-thumb-[#B9E7E6] scrollbar-track-transparent ${
            isSidebarOpen || !isDesktop ? 'px-3' : 'px-2'
          } ${
            hoveredArea === 'sidebar' ? 'overflow-y-auto' : 'overflow-y-hidden'
          }`}
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
            const isExpanded = expandedItems.includes(item.label);

            // ==================== COLLAPSED MODE (ICON-ONLY) ====================
            if (!isSidebarOpen && isDesktop) {
              return (
                <div
                  key={item.label}
                  className="relative flex justify-center py-0.5"
                  onMouseEnter={(e) => handleItemMouseEnter(item, e)}
                  onMouseLeave={handleItemMouseLeave}
                >
                  {hasSubItems ? (
                    <button
                      type="button"
                      onClick={() => {
                        // Open sidebar and expand this item
                        setIsSidebarOpen(true);
                        if (!expandedItems.includes(item.label)) {
                          toggleExpanded(item.label);
                        }
                      }}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        active
                          ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                          : 'text-[#1e4a52] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                      }`}
                      aria-label={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        active
                          ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                          : 'text-[#1e4a52] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                      }`}
                      aria-label={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              );
            }

            // ==================== EXPANDED MODE (FULL SIDEBAR) ====================
            return (
              <div key={item.label} className="space-y-1">
                {hasSubItems ? (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      active
                        ? 'bg-[#6FD4E1]/20 text-[#0891b2] font-bold'
                        : 'text-[#1e4a52] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          active
                            ? 'bg-[#6FD4E1] text-[#0c282d] shadow-sm'
                            : 'bg-[#E2F4F3]/60 text-[#1e4a52]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm truncate">{item.label}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[#527d85]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      active
                        ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                        : 'text-[#1e4a52] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          active
                            ? 'bg-white text-[#0c282d] shadow-sm'
                            : 'bg-[#E2F4F3]/60 text-[#1e4a52]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#6FD4E1] text-[#0c282d] font-bold text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Sub-items with vertical tree connector line */}
                <AnimatePresence>
                  {hasSubItems && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative pl-6 ml-4 space-y-1 overflow-hidden"
                    >
                      {/* Vertical connector line */}
                      <div className="absolute left-2.5 top-0 bottom-2.5 w-[1.5px] bg-[#B9E7E6]" />

                      {item.subItems?.map((subItem) => {
                        const subActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              subActive
                                ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                                : 'text-[#527d85] hover:bg-[#E2F4F3]/80 hover:text-[#0c282d]'
                            }`}
                          >
                            {/* Branch tick */}
                            <span
                              className={`w-2.5 h-[1.5px] -ml-3.5 transition-colors ${
                                subActive ? 'bg-[#0c282d]' : 'bg-[#B9E7E6]'
                              }`}
                            />
                            <span className="truncate">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User Section - Bottom */}
        <div className="flex-shrink-0 p-3 border-t border-[#B9E7E6] bg-[#E2F4F3]/40">
          {status === 'loading' ? (
            <div className="animate-pulse flex items-center justify-center p-2">
              <div className="w-9 h-9 rounded-full bg-[#B9E7E6]" />
            </div>
          ) : session?.user ? (
            isSidebarOpen || !isDesktop ? (
              // Expanded User Profile
              <>
                <div className="flex items-center gap-3 mb-2.5 px-1">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover border border-[#B9E7E6]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#6FD4E1] flex items-center justify-center text-[#0c282d] font-bold shadow-sm text-sm">
                      {session.user.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0c282d] text-xs font-bold truncate">
                      {session.user.name || 'User'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[#527d85] text-[11px] truncate capitalize font-medium">
                        {session.user.role || 'user'}
                      </p>
                      {session.user.role === 'admin' && (
                        <Shield className="w-3 h-3 text-[#0891b2]" />
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-500/10 font-bold transition-all text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Collapsed User Profile (Icon only)
              <div className="flex flex-col items-center gap-2">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover border border-[#B9E7E6]"
                    title={`${session.user.name} (${session.user.role})`}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full bg-[#6FD4E1] flex items-center justify-center text-[#0c282d] font-bold shadow-sm text-xs"
                    title={`${session.user.name} (${session.user.role})`}
                  >
                    {session.user.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'U'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            <div className="text-center text-[#527d85] text-xs font-medium py-1">
              {isSidebarOpen ? 'Not logged in' : '—'}
            </div>
          )}
        </div>
      </motion.aside>

      {/* Floating Popout Submenu & Tooltips for Collapsed Mode (Matches User's Mockup) */}
      <AnimatePresence>
        {!isSidebarOpen && isDesktop && popoutItem && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: '78px',
              top: Math.max(12, Math.min(popoutItem.top - 6, (typeof window !== 'undefined' ? window.innerHeight : 800) - 280)),
              zIndex: 9999,
            }}
            onMouseEnter={handlePopoutMouseEnter}
            onMouseLeave={handlePopoutMouseLeave}
            className="pointer-events-auto"
          >
            {popoutItem.item.subItems && popoutItem.item.subItems.length > 0 ? (
              // Floating Submenu Card (Matching "Income" Popout in Right Panel of Mockup)
              <div className="w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#B9E7E6] shadow-2xl p-2.5 text-[#0c282d]">
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-[#B9E7E6]/60 mb-1.5">
                  <popoutItem.item.icon className="w-4 h-4 text-[#0891b2]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-[#0c282d] font-mono">
                    {popoutItem.item.label}
                  </span>
                </div>

                {/* Submenu List */}
                <div className="space-y-1">
                  {popoutItem.item.subItems.map((sub) => {
                    const subActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setPopoutItem(null)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          subActive
                            ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                            : 'text-[#1e4a52] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            subActive ? 'bg-[#0c282d]' : 'bg-[#6FD4E1]'
                          }`}
                        />
                        <span className="truncate">{subItemLabel(sub.label)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Single Item Floating Tooltip
              <div className="rounded-xl bg-[#0c282d] text-white text-xs font-bold px-3 py-2 shadow-xl whitespace-nowrap border border-[#1e4a52]">
                {popoutItem.item.label}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-[margin-left] duration-200 bg-[#E2F4F3]"
        style={{
          marginLeft: isDesktop ? `${sidebarWidth}px` : '0',
        }}
      >
        {/* Header */}
        <header className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-[#B9E7E6] shadow-sm">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={toggleSidebar}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl text-[#0c282d] hover:bg-[#E2F4F3] border border-transparent hover:border-[#B9E7E6] transition-all"
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-[#0891b2]" />
                ) : (
                  <PanelLeft className="w-5 h-5 text-[#0c282d]" />
                )}
              </motion.button>

              {/* Breadcrumbs */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#527d85]">
                <span className="hover:text-[#0c282d] transition-colors">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#B9E7E6]" />
                <span className="text-[#0c282d] font-bold capitalize">
                  {pathname === '/admin'
                    ? 'Dashboard Overview'
                    : pathname?.replace('/admin/', '').replace(/\//g, ' > ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Link */}
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#E2F4F3] border border-[#B9E7E6] text-xs font-bold text-[#0c282d] transition-all shadow-sm"
              >
                <span>blimbing.me</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#0891b2]" />
              </Link>

              {/* Live API Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E2F4F3] border border-[#B9E7E6] shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#6FD4E1] animate-pulse" />
                <span className="text-xs text-[#0891b2] font-bold font-mono uppercase tracking-wider">
                  Live API
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`flex-1 p-6 overscroll-behavior-contain ${
            hoveredArea === 'main'
              ? 'overflow-y-auto'
              : hoveredArea === 'sidebar'
              ? 'overflow-y-hidden'
              : 'overflow-y-auto'
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

function subItemLabel(label: string) {
  return label;
}