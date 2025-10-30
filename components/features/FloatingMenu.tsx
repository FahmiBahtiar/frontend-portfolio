'use client';

import { motion } from 'motion/react';
import { Home, User, GraduationCap, Briefcase, Mail, Camera } from 'lucide-react';

interface FloatingMenuProps {
  activeSection: number;
  onNavigate: (section: number) => void;
  onGalleryToggle: () => void;
  totalSections: number;
}

export function FloatingMenu({ activeSection, onNavigate, onGalleryToggle, totalSections }: FloatingMenuProps) {
  const menuItems = [
    { icon: Home, label: 'Home', section: 0 },
    { icon: User, label: 'About', section: 1 },
    { icon: GraduationCap, label: 'Education', section: 2 },
    { icon: Briefcase, label: 'Experience', section: 3 },
    { icon: Mail, label: 'Contact', section: 4 },
  ];

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="flex flex-col gap-3">
        {/* Main Navigation */}
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              onClick={() => onNavigate(item.section)}
              className={`w-10 h-10 rounded-full backdrop-blur-sm transition-all flex items-center justify-center border ${
                activeSection === item.section
                  ? 'bg-white/30 border-white/50'
                  : 'bg-white/20 border-white/30 hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={item.label}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.button>
          );
        })}

        {/* Separator */}
        <div className="h-px bg-white/20 mx-2 my-1" />

        {/* Gallery Button - Highlighted */}
        <motion.button
          onClick={onGalleryToggle}
          className="w-10 h-10 rounded-full backdrop-blur-sm transition-all flex items-center justify-center border border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Gallery"
        >
          <Camera className="w-5 h-5 text-cyan-400" />
        </motion.button>

        {/* Dots indicator */}
        <div className="flex flex-col items-center gap-2 py-2 mt-2">
          {Array.from({ length: totalSections }).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activeSection === index ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
