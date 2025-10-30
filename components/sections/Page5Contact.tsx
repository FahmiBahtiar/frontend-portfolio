'use client';

import { motion } from 'motion/react';
import { 
  Radio, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Instagram,
  Send,
  MapPin,
  Copy,
  Check,
  Radar
} from 'lucide-react';
import { useState } from 'react';

interface ContactFrequency {
  id: string;
  frequency: string;
  label: string;
  value: string;
  icon: any;
  type: 'primary' | 'social';
  color: string;
  link?: string;
}

interface Page5ContactProps {
  onNavigate?: (sectionIndex: number) => void;
}

export function Page5Contact({ onNavigate }: Page5ContactProps = {}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const frequencies: ContactFrequency[] = [
    // Primary Contacts (Emergency Frequencies)
    {
      id: 'email',
      frequency: '121.5',
      label: 'EMAIL',
      value: 'your.email@example.com',
      icon: Mail,
      type: 'primary',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'phone',
      frequency: '118.1',
      label: 'PHONE',
      value: '+62 812 3456 7890',
      icon: Phone,
      type: 'primary',
      color: 'from-emerald-500 to-teal-500',
    },
    // Social Media Frequencies
    {
      id: 'linkedin',
      frequency: '132.4',
      label: 'LINKEDIN',
      value: '/in/yourprofile',
      icon: Linkedin,
      type: 'social',
      color: 'from-blue-600 to-blue-400',
      link: 'https://linkedin.com/in/yourprofile',
    },
    {
      id: 'github',
      frequency: '128.8',
      label: 'GITHUB',
      value: '@yourusername',
      icon: Github,
      type: 'social',
      color: 'from-purple-600 to-pink-500',
      link: 'https://github.com/yourusername',
    },
    {
      id: 'instagram',
      frequency: '136.2',
      label: 'INSTAGRAM',
      value: '@yourhandle',
      icon: Instagram,
      type: 'social',
      color: 'from-pink-600 to-orange-500',
      link: 'https://instagram.com/yourhandle',
    },
  ];

  const handleCopy = (id: string, value: string) => {
    // Fallback method for copying text (compatible with all browsers)
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    
    document.body.removeChild(textarea);
  };

  const handleContact = (freq: ContactFrequency) => {
    if (freq.link) {
      window.open(freq.link, '_blank');
    } else if (freq.id === 'email') {
      window.location.href = `mailto:${freq.value}`;
    } else if (freq.id === 'phone') {
      window.location.href = `tel:${freq.value}`;
    }
  };

  return (
    <div className="min-h-screen w-full px-4 md:px-8 lg:px-16 py-12 md:py-16 pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Radar Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Radar Icon with Pulse */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative inline-block mb-6"
          >
            {/* Pulsing glow */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl"
            />
            
            {/* Icon container */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Radar className="w-8 h-8 text-cyan-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white mb-3 tracking-wider"
          >
            COMMUNICATION PANEL
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-cyan-400"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm md:text-base font-mono">
              7°15'S 112°45'E • ALT 667M
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 mt-4 max-w-2xl mx-auto"
          >
            Select your preferred radio frequency to establish communication
          </motion.p>
        </motion.div>

        {/* Primary Contacts - Emergency Frequencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-red-500"
              />
              <span className="text-red-400 font-mono text-sm md:text-base">EMERGENCY FREQUENCIES</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {frequencies.filter(f => f.type === 'primary').map((freq, index) => {
              const Icon = freq.icon;
              return (
                <motion.div
                  key={freq.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative"
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${freq.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
                  
                  <div className="relative p-6 md:p-8 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
                    {/* Frequency Display */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br ${freq.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl md:text-3xl text-white font-mono">{freq.frequency}</span>
                            <span className="text-slate-400 text-sm">MHz</span>
                          </div>
                          <span className="text-xs md:text-sm text-slate-400 font-mono">{freq.label}</span>
                        </div>
                      </div>
                      <Radio className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
                    </div>

                    {/* Value */}
                    <div className="flex items-center justify-between gap-4 p-3 md:p-4 rounded-lg bg-black/20 border border-white/5">
                      <span className="text-white font-mono text-sm md:text-base truncate">{freq.value}</span>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleCopy(freq.id, freq.value)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          title="Copy"
                        >
                          {copiedId === freq.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleContact(freq)}
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r ${freq.color} text-white hover:shadow-lg hover:shadow-${freq.color}/20 transition-all flex items-center gap-2`}
                        >
                          <Send className="w-4 h-4" />
                          <span className="hidden md:inline">Connect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Discord Presence - Live Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  opacity: [1, 0.3, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 rounded-full bg-purple-500"
              />
              <span className="text-purple-400 font-mono text-sm md:text-base">LIVE STATUS</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Discord Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative group h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                
                {/* Card Container */}
                <div className="relative h-full p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/30 transition-all">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-mono text-purple-400">DISCORD • LIVE</div>
                      <div className="text-xs text-slate-400">Real-time Activity</div>
                    </div>
                    <div className="ml-auto">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-purple-500"
                      />
                    </div>
                  </div>
                  
                  {/* Discord Lanyard */}
                  <div className="rounded-lg overflow-hidden border border-white/5">
                    <img 
                      src="https://lanyard.cnrad.dev/api/467600406000697354?borderRadius=8px&theme=dark" 
                      alt="Discord Status"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* IVAO Flight Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="relative group h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                
                {/* Card Container */}
                <div className="relative h-full p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 transition-all">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Radar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-sm font-mono text-cyan-400">IVAO • NETWORK</div>
                      <div className="text-xs text-slate-400">Flight Status</div>
                    </div>
                    <div className="ml-auto">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="w-2 h-2 rounded-full bg-cyan-500"
                      />
                    </div>
                  </div>
                  
                  {/* IVAO Status with Dark Mode */}
                  <div className="rounded-lg overflow-hidden border border-white/5 bg-slate-900/80 flex items-center justify-center min-h-[200px]">
                    <img 
                      src="https://status.ivao.aero/704291.png" 
                      alt="IVAO Flight Status"
                      className="w-full h-auto mix-blend-lighten opacity-90"
                      style={{
                        filter: 'invert(0.92) hue-rotate(180deg) brightness(1.1) contrast(0.9)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Social Media - Navigation Frequencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 rounded-full bg-cyan-500"
              />
              <span className="text-cyan-400 font-mono text-sm md:text-base">NAVIGATION FREQUENCIES</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {frequencies.filter(f => f.type === 'social').map((freq, index) => {
              const Icon = freq.icon;
              return (
                <motion.div
                  key={freq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group relative cursor-pointer"
                  onClick={() => handleContact(freq)}
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${freq.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`} />
                  
                  <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
                    {/* Frequency Gauge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${freq.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl md:text-2xl text-white font-mono">{freq.frequency}</span>
                          <span className="text-xs text-slate-400">MHz</span>
                        </div>
                      </div>
                    </div>

                    {/* Label & Value */}
                    <div className="space-y-2">
                      <div className="text-xs md:text-sm text-slate-400 font-mono">{freq.label}</div>
                      <div className="text-white font-mono text-sm md:text-base truncate">{freq.value}</div>
                    </div>

                    {/* Status Indicator */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-500">STATUS</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-400">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
