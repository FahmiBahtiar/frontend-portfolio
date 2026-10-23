'use client';

import { motion, useInView } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useIsLiteGraphics } from '@/components/providers/GraphicsModeProvider';
import { useIsMobile } from '@/components/ui/use-mobile';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [lastModified, setLastModified] = useState<string>('2025.11.04');
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.5 });
  // Skip the infinite heart pulse on weak/mobile CPUs.
  const lite = useIsLiteGraphics();
  const isMobile = useIsMobile();
  const calm = lite || isMobile;

  useEffect(() => {
    fetchLastModified();
  }, []);

  const fetchLastModified = async () => {
    try {
      const response = await fetch('/api/last-modified');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.formattedDate) {
          // Convert MM/DD/YYYY to YYYY.MM.DD format
          const [month, day, year] = data.formattedDate.split('/');
          setLastModified(`${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch last modified date:', err);
      // Keep default date
    }
  };

  return (
    <footer
      ref={footerRef}
      className="w-full mt-auto relative z-[2] bg-white border-t border-[#B9E7E6]"
      aria-label="Site footer"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        {/* Copyright + last modified */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4">
          <p className="text-[12px] font-medium text-[#527d85]">
            © {currentYear} Blimbing. All rights reserved.
          </p>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-[#B9E7E6]" />
          <p className="text-[11px] text-[#527d85] font-mono">
            Last modified {lastModified}
          </p>
        </div>

        {/* Credits */}
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#527d85]">
          <span>Designed & built with</span>
          <motion.span
            className="inline-flex"
            animate={calm ? undefined : { scale: [1, 1.15, 1] }}
            transition={calm ? undefined : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart
              className="w-3 h-3 text-[#6FD4E1] fill-[#6FD4E1]"
            />
          </motion.span>
          <span>by</span>
          <span className="text-[#0c282d] font-bold">
            Fahmi Bahtiar
          </span>
        </div>
      </motion.div>
    </footer>
  );
}
