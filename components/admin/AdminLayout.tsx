'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '@/components/ui/logo';
import {
  Home,
  User,
  GraduationCap,
  Briefcase,
  Radio,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  Code2,
  Image as ImageIcon,
  Users,
  Shield,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
  ChevronRight,
  FileText,
  Share2,
  CreditCard,
  Flame,
  Sparkles,
  Layers,
  BookOpen,
  Trophy,
  Plane,
  FolderGit2,
  type LucideIcon,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface SubItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  subItems?: SubItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
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
    if (pathname?.startsWith('/admin/about')) expanded.push('About & Portfolio');
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

  const navSections: NavSection[] = [
    {
      title: 'MENU UTAMA',
      items: [
        {
          label: 'Dashboard',
          href: '/admin',
          icon: Home,
        },
      ],
    },
    {
      title: 'MASTER & KONTEN',
      items: [
        {
          label: 'Hero Section',
          href: '/admin/hero',
          icon: User,
          subItems: [
            { label: 'Profile Hero', href: '/admin/hero/profile', icon: FileText },
            { label: 'Social Links', href: '/admin/hero/social', icon: Share2 },
          ],
        },
        {
          label: 'About & Portfolio',
          href: '/admin/about',
          icon: Code2,
          subItems: [
            { label: 'Lanyard Card', href: '/admin/about/lanyard', icon: CreditCard },
            { label: 'Passions', href: '/admin/about/passions', icon: Flame },
            { label: 'Highlights', href: '/admin/about/highlights', icon: Sparkles },
            { label: 'Skills Hangar', href: '/admin/about/skills', icon: Layers },
          ],
        },
        {
          label: 'Education',
          href: '/admin/education',
          icon: GraduationCap,
          subItems: [
            { label: 'Education Records', href: '/admin/education/records', icon: BookOpen },
            { label: 'Achievements', href: '/admin/education/achievements', icon: Trophy },
          ],
        },
        {
          label: 'Experience & Projects',
          href: '/admin/projects',
          icon: Briefcase,
          subItems: [
            { label: 'Flight Logbook', href: '/admin/projects/logbook', icon: Plane },
            { label: 'Aircraft Hangar', href: '/admin/projects/hangar', icon: FolderGit2 },
          ],
        },
        {
          label: 'Mission Gallery',
          href: '/admin/gallery',
          icon: ImageIcon,
        },
      ],
    },
    {
      title: 'KOMUNIKASI & PESAN',
      items: [
        {
          label: 'Contact Channels',
          href: '/admin/contact',
          icon: Radio,
        },
        {
          label: 'Visitor Messages',
          href: '/admin/communication',
          icon: MessageSquare,
        },
      ],
    },
    {
      title: 'SISTEM & PENGATURAN',
      items: [
        {
          label: 'User Management',
          href: '/admin/users',
          icon: Users,
        },
        {
          label: 'System Settings',
          href: '/admin/settings',
          icon: Settings,
        },
      ],
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

  const isCollapsed = !isSidebarOpen && isDesktop;

  // Hover handlers for collapsed sidebar mode
  const handleItemMouseEnter = (item: NavItem, e: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsed) return;
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
    if (!isCollapsed) return;
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
  const sidebarWidth = isDesktop ? (isSidebarOpen ? 260 : 72) : 260;

  return (
    <div className="min-h-screen h-screen bg-[#E2F4F3] text-[#0c282d] overflow-hidden overscroll-behavior-contain">
      {/* Sidebar - Smooth synchronized transition without spring conflict */}
      <aside
        className="fixed left-0 top-0 h-full bg-white border-r border-[#B9E7E6] shadow-sm flex flex-col flex-shrink-0 z-30 transition-[width,transform] duration-250 ease-in-out"
        style={{
          width: `${sidebarWidth}px`,
          transform: !isDesktop && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
        onMouseEnter={() => setHoveredArea('sidebar')}
        onMouseLeave={() => setHoveredArea(null)}
      >
        {/* Logo & Header Section - Single clean logo area (NO duplicate toggle button!) */}
        <div className="h-16 px-4 border-b border-[#B9E7E6] flex items-center flex-shrink-0 bg-white">
          <Link
            href="/admin"
            className="flex items-center gap-3 w-full overflow-hidden"
          >
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
              <Logo size={34} />
            </div>
            <div
              className={`min-w-0 transition-all duration-200 overflow-hidden ${
                isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
              }`}
            >
              <h1 className="text-[#0c282d] font-bold text-base leading-tight truncate whitespace-nowrap">
                Admin Panel
              </h1>
              <p className="text-[#527d85] text-xs font-semibold truncate whitespace-nowrap">
                Portfolio CMS
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation - Scrollable */}
        <nav
          className={`flex-1 py-3 space-y-3 overflow-x-hidden scrollbar-thin scrollbar-thumb-[#B9E7E6] scrollbar-track-transparent ${
            isCollapsed ? 'px-2' : 'px-3'
          } ${
            hoveredArea === 'sidebar' ? 'overflow-y-auto' : 'overflow-y-hidden'
          }`}
        >
          {navSections.map((section, sIndex) => (
            <div key={section.title} className="space-y-1">
              {/* Category / Section Header */}
              <div
                className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${
                  isCollapsed
                    ? 'opacity-0 h-0 my-0 py-0'
                    : 'opacity-100 px-3 pt-2 pb-1 text-[11px] font-bold font-mono tracking-wider text-[#527d85] uppercase'
                }`}
              >
                {section.title}
              </div>
              {isCollapsed && sIndex > 0 && (
                <div className="my-2 border-t border-[#B9E7E6]/60 w-8 mx-auto" />
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                  const isExpanded = expandedItems.includes(item.label);

                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={(e) => handleItemMouseEnter(item, e)}
                      onMouseLeave={handleItemMouseLeave}
                    >
                      {hasSubItems ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (isCollapsed) {
                              setIsSidebarOpen(true);
                              if (!expandedItems.includes(item.label)) {
                                toggleExpanded(item.label);
                              }
                            } else {
                              toggleExpanded(item.label);
                            }
                          }}
                          className={`w-full flex items-center rounded-xl transition-all ${
                            isCollapsed
                              ? 'justify-center p-2.5 h-11'
                              : 'justify-between px-3 py-2 h-10'
                          } ${
                            !isCollapsed && isExpanded
                              ? 'bg-[#E2F4F3]/80 border border-[#B9E7E6]/70 text-[#0c282d] font-bold shadow-xs'
                              : active
                              ? isCollapsed
                                ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                                : 'bg-[#E2F4F3]/40 text-[#0891b2] font-semibold hover:bg-[#E2F4F3]'
                              : 'text-[#1e4a52] hover:bg-[#E2F4F3]/60 hover:text-[#0c282d]'
                          }`}
                          aria-label={item.label}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                isCollapsed && active
                                  ? 'text-[#0c282d]'
                                  : isExpanded
                                  ? 'text-[#0891b2]'
                                  : 'text-[#527d85]'
                              }`}
                            />
                            <span
                              className={`font-semibold text-sm truncate whitespace-nowrap transition-all duration-200 ${
                                isCollapsed
                                  ? 'opacity-0 max-w-0 overflow-hidden'
                                  : 'opacity-100 max-w-[150px]'
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>

                          <div
                            className={`text-[#527d85] transition-all duration-200 flex-shrink-0 ${
                              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                            }`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-0' : '-rotate-90'
                              }`}
                            />
                          </div>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`w-full flex items-center rounded-xl transition-all ${
                            isCollapsed
                              ? 'justify-center p-2.5 h-11'
                              : 'justify-between px-3 py-2 h-10'
                          } ${
                            active
                              ? isCollapsed
                                ? 'bg-[#6FD4E1] text-[#0c282d] font-bold shadow-sm'
                                : 'bg-[#0c282d] text-white font-bold shadow-md shadow-[#0c282d]/10'
                              : 'text-[#1e4a52] hover:bg-[#E2F4F3]/70 hover:text-[#0c282d]'
                          }`}
                          aria-label={item.label}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                active
                                  ? isCollapsed
                                    ? 'text-[#0c282d]'
                                    : 'text-white'
                                  : 'text-[#527d85]'
                              }`}
                            />
                            <span
                              className={`font-semibold text-sm truncate whitespace-nowrap transition-all duration-200 ${
                                isCollapsed
                                  ? 'opacity-0 max-w-0 overflow-hidden'
                                  : 'opacity-100 max-w-[150px]'
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                          {item.badge && !isCollapsed && (
                            <span className="bg-[#6FD4E1] text-[#0c282d] font-bold text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}

                      {/* Sub-items with Curved L-shape Tree Connector Lines */}
                      <AnimatePresence>
                        {!isCollapsed && hasSubItems && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative pl-6 ml-3 mt-1 space-y-1 overflow-hidden"
                          >
                            {/* Continuous vertical trunk line ending at center of last item */}
                            <div
                              className="absolute left-[5px] top-0 w-[1.5px] bg-[#B9E7E6]"
                              style={{ bottom: '18px' }}
                            />

                            {item.subItems?.map((subItem) => {
                              const subActive = pathname === subItem.href;
                              const SubIcon = subItem.icon;

                              return (
                                <div
                                  key={subItem.href}
                                  className="relative flex items-center min-h-[36px]"
                                >
                                  {/* Curved L branch connector: (╰─) */}
                                  <span className="absolute -left-[19px] top-1/2 -translate-y-full w-3.5 h-3.5 border-b-[1.5px] border-l-[1.5px] border-[#B9E7E6] rounded-bl-lg pointer-events-none" />

                                  <Link
                                    href={subItem.href}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                      subActive
                                        ? 'bg-[#0c282d] text-white font-bold shadow-md shadow-[#0c282d]/10'
                                        : 'text-[#527d85] hover:bg-[#E2F4F3]/80 hover:text-[#0c282d] font-medium'
                                    }`}
                                  >
                                    <SubIcon
                                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                                        subActive ? 'text-white' : 'text-[#527d85]'
                                      }`}
                                    />
                                    <span className="truncate">{subItem.label}</span>
                                  </Link>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section - Bottom */}
        <div className="flex-shrink-0 p-3 border-t border-[#B9E7E6] bg-[#E2F4F3]/30">
          {status === 'loading' ? (
            <div className="animate-pulse flex items-center justify-center p-2">
              <div className="w-9 h-9 rounded-full bg-[#B9E7E6]" />
            </div>
          ) : session?.user ? (
            <div className="flex flex-col gap-2">
              <div
                className={`flex items-center gap-2.5 px-1 ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover border border-[#B9E7E6] flex-shrink-0"
                    title={isCollapsed ? `${session.user.name} (${session.user.role})` : undefined}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full bg-[#6FD4E1] flex items-center justify-center text-[#0c282d] font-bold shadow-sm text-sm flex-shrink-0"
                    title={isCollapsed ? `${session.user.name} (${session.user.role})` : undefined}
                  >
                    {session.user.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'U'}
                  </div>
                )}
                <div
                  className={`min-w-0 transition-all duration-200 overflow-hidden ${
                    isCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[140px]'
                  }`}
                >
                  <p className="text-[#0c282d] text-xs font-bold truncate whitespace-nowrap">
                    {session.user.name || 'User'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[#527d85] text-[11px] truncate capitalize font-medium whitespace-nowrap">
                      {session.user.role || 'user'}
                    </p>
                    {session.user.role === 'admin' && (
                      <Shield className="w-3 h-3 text-[#0891b2] flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className={`flex items-center justify-center rounded-xl text-red-600 hover:bg-red-500/10 font-bold transition-all ${
                  isCollapsed ? 'w-9 h-9 mx-auto' : 'w-full gap-2 px-3 py-2 text-xs'
                }`}
                title={isCollapsed ? 'Logout' : undefined}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span
                  className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${
                    isCollapsed ? 'opacity-0 max-w-0' : 'opacity-100'
                  }`}
                >
                  Logout
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center text-[#527d85] text-xs font-medium py-1">
              {isCollapsed ? '—' : 'Not logged in'}
            </div>
          )}
        </div>
      </aside>

      {/* Floating Popout Submenu & Tooltips for Collapsed Mode */}
      <AnimatePresence>
        {isCollapsed && popoutItem && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: '78px',
              top: Math.max(
                12,
                Math.min(
                  popoutItem.top - 6,
                  (typeof window !== 'undefined' ? window.innerHeight : 800) - 280
                )
              ),
              zIndex: 9999,
            }}
            onMouseEnter={handlePopoutMouseEnter}
            onMouseLeave={handlePopoutMouseLeave}
            className="pointer-events-auto"
          >
            {popoutItem.item.subItems && popoutItem.item.subItems.length > 0 ? (
              // Floating Submenu Card
              <div className="w-60 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#B9E7E6] shadow-2xl p-2.5 text-[#0c282d]">
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
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setPopoutItem(null)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          subActive
                            ? 'bg-[#0c282d] text-white font-bold shadow-md shadow-[#0c282d]/10'
                            : 'text-[#1e4a52] hover:bg-[#E2F4F3] hover:text-[#0c282d]'
                        }`}
                      >
                        <SubIcon
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            subActive ? 'text-white' : 'text-[#527d85]'
                          }`}
                        />
                        <span className="truncate">{sub.label}</span>
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

      {/* Main Content Wrapper - Exactly Synchronized with Sidebar Width Transition */}
      <div
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-[margin-left] duration-250 ease-in-out bg-[#E2F4F3]"
        style={{
          marginLeft: isDesktop ? `${sidebarWidth}px` : '0',
        }}
      >
        {/* Header with single Toggle Button next to Breadcrumbs */}
        <header className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-[#B9E7E6] shadow-sm">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-[#0c282d] hover:bg-[#E2F4F3] border border-transparent hover:border-[#B9E7E6] transition-all"
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-[#0891b2]" />
                ) : (
                  <PanelLeft className="w-5 h-5 text-[#0c282d]" />
                )}
              </button>

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