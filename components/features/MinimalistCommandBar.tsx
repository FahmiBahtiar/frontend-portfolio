'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { Camera, User, GraduationCap, Briefcase, Mail, Compass, Menu, X } from 'lucide-react';

interface MinimalistCommandBarProps {
  activeSection: number;
  onNavigate: (index: number) => void;
  onGalleryToggle: () => void;
  totalSections: number;
}

interface SectionConfig {
  id: number;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SectionConfig[] = [
  { id: 0, name: 'Home', icon: Compass },
  { id: 1, name: 'About', icon: User },
  { id: 2, name: 'Education', icon: GraduationCap },
  { id: 3, name: 'Experience', icon: Briefcase },
  { id: 4, name: 'Contact', icon: Mail },
];

// Accent palette — Arctic Ice Light Palette (6FD4E1, B9E7E6, E2F4F3, FFFFFF)
const ACCENT = {
  active: '#0c282d',        // Deep Slate Cyan text for active item
  activeBg: '#6FD4E1',      // Arctic Cyan active button
  activeGlow: 'rgba(111, 212, 225, 0.35)',
  gallery: '#0c282d',
  galleryBg: '#B9E7E6',
  text: '#1e4a52',          // Deep Teal text
  textHover: '#0c282d',
  brand: '#0c282d',
  barBg: 'rgba(255, 255, 255, 0.88)',
  barBorder: '#B9E7E6',
  progressTrack: 'rgba(185, 231, 230, 0.5)',
};

export function MinimalistCommandBar({
  activeSection,
  onNavigate,
  onGalleryToggle,
}: MinimalistCommandBarProps) {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  // `isScrolling` is true only while the page is actively moving. We use it to
  // drop the navbar's backdrop-filter blur during scroll (re-blurring the whole
  // page behind a fixed bar every frame is the main scroll-jank source) and
  // restore it shortly after scrolling stops. It flips at most twice per gesture
  // — not per frame.
  const [isScrolling, setIsScrolling] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');

  // Progress indicator width, driven straight off the scroll motion value — no
  // React state, so scrolling no longer re-renders the whole navbar tree.
  const progressWidth = useTransform(scrollYProgress, (v) => `${Math.round(v * 100)}%`);
  // The "NN%" text is updated imperatively (textContent) for the same reason.
  const pctDesktopRef = useRef<HTMLSpanElement>(null);
  const pctMobileRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const t = `${Math.round(latest * 100)}%`;
    if (pctDesktopRef.current) pctDesktopRef.current.textContent = t;
    if (pctMobileRef.current) pctMobileRef.current.textContent = t;
  });

  // Seed the percent text on mount / when the mobile menu opens (the change
  // event only fires on subsequent scrolls).
  useEffect(() => {
    const t = `${Math.round(scrollYProgress.get() * 100)}%`;
    if (pctDesktopRef.current) pctDesktopRef.current.textContent = t;
    if (pctMobileRef.current) pctMobileRef.current.textContent = t;
  }, [mobileOpen, scrollYProgress]);

  // Auto-hide navbar on scroll down, show on scroll up
  useEffect(() => {
    let ticking = false;
    let scrollStopTimer: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const direction = currentY > lastScrollY.current ? 'down' : 'up';

          // Only update visibility after a meaningful scroll
          if (Math.abs(currentY - lastScrollY.current) > 8) {
            if (direction !== scrollDirection.current) {
              scrollDirection.current = direction;
              setIsVisible(direction === 'up' || currentY < 100);
            }
          }

          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }

      // Mark scrolling (idempotent — React bails out if already true), then
      // clear it ~160ms after the last scroll event.
      setIsScrolling(true);
      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => setIsScrolling(false), 160);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollStopTimer);
    };
  }, []);

  const handleNavClick = useCallback((id: number) => {
    onNavigate(id);
    setMobileOpen(false);
  }, [onNavigate]);

  const handleGalleryClick = useCallback(() => {
    onGalleryToggle();
    setMobileOpen(false);
  }, [onGalleryToggle]);

  return (
    <>
      {/* ━━━ DESKTOP NAVBAR ━━━ */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : -100, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 28,
          mass: 0.8,
        }}
        className="hidden lg:flex fixed top-5 left-0 w-full justify-center z-50 pointer-events-none"
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          className="relative flex items-center gap-1 px-2 py-2 rounded-2xl pointer-events-auto"
        >
          {/* Background Layer to prevent backdrop-filter from blurring text */}
          <div
            className="absolute inset-0 rounded-2xl -z-10"
            style={{
              background: isScrolling ? '#FFFFFF' : ACCENT.barBg,
              backdropFilter: isScrolling ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: isScrolling ? 'none' : 'blur(20px)',
              border: `1px solid ${ACCENT.barBorder}`,
              boxShadow: `
                0 4px 20px -2px rgba(111, 212, 225, 0.2),
                0 2px 6px -1px rgba(0, 0, 0, 0.05)
              `,
            }}
          />

          {/* Brand Mark */}
          <motion.button
            onClick={() => handleNavClick(0)}
            className="relative flex items-center gap-2.5 px-4 py-2 rounded-xl mr-1 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Go to home"
          >
            {/* Decorative monogram */}
            <div
              className="relative flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden"
              style={{
                background: '#E2F4F3',
                border: '1px solid #B9E7E6',
              }}
            >
              <span
                className="text-xs font-bold tracking-tight"
                style={{ color: '#0c282d', fontFamily: 'var(--font-sans)' }}
              >
                B
              </span>
              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-1.5 h-1.5"
                style={{
                  background: 'linear-gradient(135deg, transparent 50%, #6FD4E1 50%)',
                }}
              />
            </div>
            <span
              className="text-[13px] font-bold tracking-[0.08em] uppercase transition-colors duration-200"
              style={{ color: ACCENT.brand }}
            >
              Blimbing
            </span>
          </motion.button>

          {/* Separator */}
          <div
            className="w-px h-6 mx-1 flex-shrink-0"
            style={{
              background: 'linear-gradient(to bottom, transparent, #B9E7E6, transparent)',
            }}
          />

          {/* Section Links */}
          <div className="flex items-center gap-0.5 px-1">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;

              return (
                <motion.button
                  key={section.id}
                  onClick={() => handleNavClick(section.id)}
                  className="relative px-3.5 py-2 rounded-xl group"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label={`Navigate to ${section.name}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="navActiveDesktop"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: ACCENT.activeBg,
                        boxShadow: `0 0 20px -4px ${ACCENT.activeGlow}`,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                        mass: 0.6,
                      }}
                    />
                  )}

                  <div className="relative flex items-center gap-2">
                    <span
                      className="flex items-center transition-colors duration-200"
                      style={{ color: isActive ? ACCENT.active : ACCENT.text }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className="text-[13px] font-medium tracking-[0.01em] transition-colors duration-200"
                      style={{
                        color: isActive ? ACCENT.active : ACCENT.text,
                      }}
                    >
                      {section.name}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Separator */}
          <div
            className="w-px h-6 mx-1 flex-shrink-0"
            style={{
              background: 'linear-gradient(to bottom, transparent, #B9E7E6, transparent)',
            }}
          />

          {/* Gallery Button */}
          <motion.button
            onClick={handleGalleryClick}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl group"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Open gallery"
          >
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: ACCENT.galleryBg }}
            />
            <Camera
              className="relative w-3.5 h-3.5 transition-colors duration-200"
              style={{ color: ACCENT.gallery }}
            />
            <span
              className="relative text-[13px] font-medium tracking-[0.01em] transition-colors duration-200"
              style={{ color: ACCENT.gallery }}
            >
              Gallery
            </span>
          </motion.button>

          {/* Scroll Progress Indicator */}
          <div className="flex items-center gap-2.5 pl-2 pr-1 ml-1">
            <div
              className="relative w-[52px] h-1.5 rounded-full overflow-hidden"
              style={{ background: ACCENT.progressTrack }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${ACCENT.active}, rgba(34,211,238,0.5))`,
                  width: progressWidth,
                }}
              />
            </div>
            <span
              ref={pctDesktopRef}
              className="text-[10px] font-mono tabular-nums w-7 text-right"
              style={{ color: ACCENT.text, opacity: 0.6 }}
            >
              0%
            </span>
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-6 right-6 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT.activeGlow}, transparent)`,
              opacity: 0.4,
            }}
          />
        </div>
      </motion.nav>

      {/* ━━━ MOBILE NAVBAR ━━━ */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : -60,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="lg:hidden fixed top-0 left-0 right-0 z-50"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div
          className="relative px-4 py-3 flex items-center justify-between"
        >
          {/* Background Layer */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: isScrolling ? '#FFFFFF' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: isScrolling ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: isScrolling ? 'none' : 'blur(20px)',
              borderBottom: `1px solid ${ACCENT.barBorder}`,
              boxShadow: '0 2px 12px -2px rgba(111, 212, 225, 0.15)',
            }}
          />
          
          {/* Brand */}
          <button
            onClick={() => handleNavClick(0)}
            className="flex items-center gap-2.5"
            aria-label="Go to home"
          >
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg"
              style={{
                background: '#E2F4F3',
                border: '1px solid #B9E7E6',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: '#0c282d' }}
              >
                B
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="text-[13px] font-bold tracking-[0.08em] uppercase"
                style={{ color: ACCENT.brand }}
              >
                Blimbing
              </span>
              <span
                className="text-[9px] font-medium tracking-[0.08em] uppercase -mt-0.5"
                style={{ color: '#527d85' }}
              >
                {sections[activeSection]?.name || 'Home'}
              </span>
            </div>
          </button>

          {/* Right side: Gallery + Hamburger */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleGalleryClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: '#E2F4F3',
                border: `1px solid #B9E7E6`,
              }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open gallery"
            >
              <Camera className="w-3.5 h-3.5" style={{ color: ACCENT.gallery }} />
              <span
                className="text-[11px] font-medium"
                style={{ color: ACCENT.gallery }}
              >
                Gallery
              </span>
            </motion.button>

            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-xl shadow-sm"
              style={{
                background: mobileOpen ? '#E2F4F3' : '#FFFFFF',
                border: `1px solid ${ACCENT.barBorder}`,
              }}
              whileTap={{ scale: 0.9 }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-4 h-4" style={{ color: ACCENT.textHover }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-4 h-4" style={{ color: ACCENT.text }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile scroll progress bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: ACCENT.progressTrack }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${ACCENT.active}, rgba(34,211,238,0.5))`,
              width: progressWidth,
            }}
          />
        </div>
      </motion.nav>

      {/* ━━━ MOBILE DROPDOWN MENU ━━━ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
              className="lg:hidden fixed top-[52px] left-3 right-3 z-50 rounded-2xl overflow-hidden"
            >
              {/* Background Layer */}
              <div 
                className="absolute inset-0 -z-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: `1px solid ${ACCENT.barBorder}`,
                  boxShadow: '0 16px 40px -8px rgba(111, 212, 225, 0.25)',
                }}
              />
              <div className="relative p-3 space-y-0.5">
                {sections.map((section, idx) => {
                  const isActive = activeSection === section.id;
                  const Icon = section.icon;

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => handleNavClick(section.id)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.2 }}
                      className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                      style={{
                        background: isActive ? ACCENT.activeBg : 'transparent',
                      }}
                    >
                      {/* Active bar */}
                      {isActive && (
                        <motion.div
                          layoutId="mobileActiveBar"
                          className="absolute left-1 top-2.5 bottom-2.5 w-[3px] rounded-full"
                          style={{ background: ACCENT.active }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      <span
                        className="flex items-center"
                        style={{ color: isActive ? ACCENT.active : ACCENT.text }}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span
                        className="text-[14px] font-medium"
                        style={{
                          color: isActive ? ACCENT.active : ACCENT.textHover,
                        }}
                      >
                        {section.name}
                      </span>

                      {/* Current indicator */}
                      {isActive && (
                        <span
                          className="ml-auto text-[10px] font-mono tracking-wider uppercase"
                          style={{ color: ACCENT.active, opacity: 0.5 }}
                        >
                          current
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom info */}
              <div
                className="px-6 py-3 flex items-center justify-between"
                style={{ borderTop: `1px solid ${ACCENT.barBorder}` }}
              >
                <span
                  className="text-[10px] font-mono tracking-wider uppercase"
                  style={{ color: ACCENT.text, opacity: 0.4 }}
                >
                  Scroll progress
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-12 h-1 rounded-full overflow-hidden"
                    style={{ background: ACCENT.progressTrack }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: ACCENT.active,
                        width: progressWidth,
                      }}
                    />
                  </div>
                  <span
                    ref={pctMobileRef}
                    className="text-[10px] font-mono tabular-nums"
                    style={{ color: ACCENT.text, opacity: 0.5 }}
                  >
                    0%
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
