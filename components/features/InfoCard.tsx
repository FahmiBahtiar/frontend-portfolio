'use client';

import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface InfoCardProps {
  onPaginate: (direction: number) => void;
}

export function InfoCard({ onPaginate }: InfoCardProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-white/15 backdrop-blur-md border border-white/20 max-w-md mx-auto w-full"
    >
      {/* Left arrow */}
      <button 
        onClick={() => onPaginate(-1)}
        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center flex-shrink-0"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </button>

      {/* Avatar */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1640119947640-c88936e3b8da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHN1bW1pdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjE2NDIyMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm md:text-base">amaliacsra</div>
        <div className="text-white/70 text-xs md:text-sm">
          shoot by iphone 11
        </div>
        <div className="text-white/70 text-xs md:text-sm">Central Java</div>
      </div>

      {/* Right arrow */}
      <button 
        onClick={() => onPaginate(1)}
        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center flex-shrink-0"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </button>
    </motion.div>
  );
}
