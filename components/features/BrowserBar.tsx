'use client';

import { ChevronLeft, ChevronRight, Plus, Share2, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export function BrowserBar() {
  return (
    // Purely decorative fake-browser chrome: the buttons do nothing, so hide the
    // whole bar from assistive tech and keep it out of the tab order.
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3"
      aria-hidden="true"
    >
      {/* Navigation buttons - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        <button tabIndex={-1} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button tabIndex={-1} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Address bar */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
          <span className="text-white/80 text-sm md:text-base">aA</span>
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
            <Lock className="w-3 h-3 md:w-4 md:h-4 text-white flex-shrink-0" />
            <span className="text-white text-sm md:text-base truncate">merbabu.com</span>
          </div>
          <button tabIndex={-1} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/60" />
          </button>
        </div>
      </div>

      {/* Action buttons - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        <button tabIndex={-1} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </button>
        <button tabIndex={-1} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center">
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>
    </motion.div>
  );
}
