'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
// Removed unused icon imports

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [lastModified, setLastModified] = useState<string>('2025.11.04');

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

  // Removed social links as we now use BLIMBING text

  return (
    <footer 
      className="relative z-[2] bg-gradient-to-t from-slate-900/95 via-slate-900/90 to-slate-900/80 backdrop-blur-xl border-t border-white/5"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
          {/* Left Section - Copyright & Last Modified */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left order-3 md:order-1"
          >
            <div className="space-y-1 sm:space-y-2">
              <p className="text-slate-400 text-sm font-medium">
                © {currentYear} All rights reserved.
              </p>
              <p className="text-slate-500 text-xs">
                Last modified on {lastModified}
              </p>
            </div>
          </motion.div>

          {/* Center Section - BLIMBING Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center order-1 md:order-2"
          >
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="relative px-4 py-1"
            >
              <span className="text-lg md:text-xl font-medium tracking-[0.15em] text-slate-300">
                BLIMBING
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-slate-400/30 group-hover:w-full transition-all duration-300"></div>
              <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></div>
            </motion.div>
          </motion.div>

          {/* Right Section - Designed By */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center md:text-right order-2 md:order-3"
          >
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Designed & Build with</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 drop-shadow-sm" 
                    fill="#ff3366"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </motion.div>
                <span className="text-slate-400">by</span>
                <span className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-300">
                  Fahmi Bahtiar
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center"
          >

          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
