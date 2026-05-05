'use client';

import { motion, useInView } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [lastModified, setLastModified] = useState<string>('2025.11.04');
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.5 });

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
      className="relative z-[2]"
      style={{ background: '#060612' }}
      aria-label="Site footer"
    >
      {/* Top divider */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.15), rgba(148,163,184,0.1), rgba(34,211,238,0.15), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        {/* Copyright + last modified */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4">
          <p
            className="text-[12px] font-medium"
            style={{ color: '#475569' }}
          >
            © {currentYear} Blimbing. All rights reserved.
          </p>
          <span
            className="hidden sm:block w-1 h-1 rounded-full"
            style={{ background: '#1e293b' }}
          />
          <p
            className="text-[11px]"
            style={{ color: '#334155' }}
          >
            Last modified {lastModified}
          </p>
        </div>

        {/* Credits */}
        <div
          className="flex items-center gap-1.5 text-[12px] font-medium"
          style={{ color: '#475569' }}
        >
          <span>Designed & built with</span>
          <motion.span
            className="inline-flex"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart
              className="w-3 h-3"
              fill="#f472b6"
              style={{ color: '#f472b6' }}
            />
          </motion.span>
          <span>by</span>
          <span style={{ color: '#22d3ee' }}>
            Fahmi Bahtiar
          </span>
        </div>
      </motion.div>
    </footer>
  );
}
