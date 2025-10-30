'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Github, Linkedin, Instagram, ExternalLink, Plane, Mountain, Code2, Compass } from 'lucide-react';

interface TerminalHeroProps {
  onNavigate: (page: number) => void;
}

interface Command {
  input: string;
  output?: string[];
  delay?: number;
  color?: string;
}

export function TerminalHero({ onNavigate }: TerminalHeroProps) {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedCommands, setDisplayedCommands] = useState<Command[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [startTyping, setStartTyping] = useState(false);
  const [loginTime, setLoginTime] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  // State untuk subtitle yang sync dengan terminal output
  const [currentSubtitleLines, setCurrentSubtitleLines] = useState<string[]>(['Fahmi Bahtiar Adi N']);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  
  // Set mounted state and login time on client side only
  useEffect(() => {
    setIsMounted(true);
    setLoginTime(new Date().toLocaleString());
  }, []);
  
  // State untuk typing animation subtitle
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [subtitleCharIndex, setSubtitleCharIndex] = useState(0);
  const [isTypingSubtitle, setIsTypingSubtitle] = useState(false);
  
  // State untuk track section mana yang harus tampil di profile card
  const [visibleSections, setVisibleSections] = useState<{
    badge: boolean;
    title: boolean;
    subtitle: boolean;
    description: boolean;
    techStack: boolean;
    buttons: boolean;
    social: boolean;
  }>({
    badge: false,
    title: false,
    subtitle: false,
    description: false,
    techStack: false,
    buttons: false,
    social: false,
  });

  const commands: Command[] = [
    {
      input: 'whoami',
      output: ['Fahmi Bahtiar Adi N'],
      color: 'text-green-400',
    },
    {
      input: 'cat profile.txt',
      output: [
        'Network & Telecom Student',
        'Building innovative web solutions',
        'Backend Developer',
      ],
      color: 'text-cyan-400',
    },
    {
      input: 'cat passions.txt',
      output: [
        'Coding  •  Aviation  •  Mountaineering',
      ],
      color: 'text-purple-400',
    },
    {
      input: './explore.sh',
      output: [
        'Portfolio ready ✓',
        'Click to continue →',
      ],
      color: 'text-yellow-400',
    },
  ];

  // Delay start of typing animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartTyping(true);
    }, 500); // Start typing 500ms after component mounts

    return () => clearTimeout(timer);
  }, []);

  // Typing effect with RAF for smoother animation
  useEffect(() => {
    if (!startTyping || !isTyping || currentCommandIndex >= commands.length) {
      return;
    }

    const currentCommand = commands[currentCommandIndex];
    const currentInput = currentCommand.input;

    if (currentCharIndex < currentInput.length) {
      // Use RAF for smoother timing
      let rafId: number;
      let startTime: number | null = null;
      const typingDelay = 60; // Faster, smoother typing
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        if (elapsed >= typingDelay) {
          setCurrentCharIndex(prev => prev + 1);
        } else {
          rafId = requestAnimationFrame(animate);
        }
      };
      
      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
    } else {
      // Command fully typed, show output immediately
      const timeout = setTimeout(() => {
        setDisplayedCommands([...displayedCommands, currentCommand]);
        
        // Update visible sections immediately with RAF for smooth rendering
        requestAnimationFrame(() => {
          if (currentCommandIndex === 0) {
            // whoami - show badge and title
            setVisibleSections(prev => ({ ...prev, badge: true, title: true }));
          } else if (currentCommandIndex === 1) {
            // cat profile.txt - show subtitle and description (rotating text)
            setVisibleSections(prev => ({ ...prev, subtitle: true, description: true }));
            setCurrentSubtitleLines(['Network & Telecom Student', 'Building innovative web solutions']);
            setCurrentSubtitleIndex(0);
          } else if (currentCommandIndex === 2) {
            // cat passions.txt - show passions/tech stack
            setVisibleSections(prev => ({ ...prev, techStack: true }));
          } else if (currentCommandIndex === 3) {
            // ./explore.sh - show buttons and social
            setVisibleSections(prev => ({ ...prev, buttons: true, social: true }));
          }
        });
        
        setCurrentCommandIndex(currentCommandIndex + 1);
        setCurrentCharIndex(0);
      }, 250); // Faster transition between commands
      return () => clearTimeout(timeout);
    }
  }, [currentCharIndex, currentCommandIndex, isTyping, displayedCommands, commands, startTyping]);

  // Cursor blink effect - optimized with longer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500); // Slightly slower for better performance
    return () => clearInterval(interval);
  }, []);

  // Stop typing when all commands are done
  useEffect(() => {
    if (currentCommandIndex >= commands.length) {
      setIsTyping(false);
    }
  }, [currentCommandIndex, commands.length]);

  // Typing animation untuk subtitle with RAF
  useEffect(() => {
    if (!visibleSections.subtitle) return;
    
    const targetText = currentSubtitleLines[currentSubtitleIndex];
    
    if (subtitleCharIndex < targetText.length) {
      setIsTypingSubtitle(true);
      let rafId: number;
      let startTime: number | null = null;
      const typingDelay = 40; // Faster subtitle typing
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        if (elapsed >= typingDelay) {
          setTypedSubtitle(targetText.substring(0, subtitleCharIndex + 1));
          setSubtitleCharIndex(prev => prev + 1);
        } else {
          rafId = requestAnimationFrame(animate);
        }
      };
      
      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
    } else {
      setIsTypingSubtitle(false);
    }
  }, [subtitleCharIndex, currentSubtitleIndex, visibleSections.subtitle, currentSubtitleLines]);

  // Rotate subtitle lines setiap 3 detik
  useEffect(() => {
    if (!visibleSections.subtitle || currentSubtitleLines.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSubtitleIndex((prev) => (prev + 1) % currentSubtitleLines.length);
      setTypedSubtitle(''); // Reset typed text
      setSubtitleCharIndex(0); // Reset char index
    }, 3000);
    
    return () => clearInterval(interval);
  }, [visibleSections.subtitle, currentSubtitleLines]);

  const handleClick = () => {
    if (!isTyping) {
      onNavigate(1);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center px-4 py-8 lg:py-12 pt-24 lg:pt-28 overflow-hidden"
    >
      {/* Floating Aviation & Mountain Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Plane 1 - Top Right */}
        <motion.div
          initial={{ x: -100, y: 50, opacity: 0 }}
          animate={{ 
            x: ['-100%', '120%'],
            y: [50, 100],
            opacity: [0, 0.3, 0.3, 0] 
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatDelay: 5,
            ease: 'linear'
          }}
          className="absolute top-20 right-0"
        >
          <Plane className="w-12 h-12 text-blue-400/30 rotate-45" />
        </motion.div>

        {/* Plane 2 - Bottom Left */}
        <motion.div
          initial={{ x: '100%', y: '80%', opacity: 0 }}
          animate={{ 
            x: ['100%', '-20%'],
            y: ['80%', '70%'],
            opacity: [0, 0.2, 0.2, 0] 
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            repeatDelay: 8,
            ease: 'linear',
            delay: 10
          }}
          className="absolute bottom-32 left-0"
        >
          <Plane className="w-10 h-10 text-purple-400/20 -rotate-12" />
        </motion.div>

        {/* Mountain 1 - Left Side */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute left-10 top-1/4 hidden lg:block"
        >
          <Mountain className="w-32 h-32 text-slate-400/20" />
        </motion.div>

        {/* Mountain 2 - Right Side */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
          className="absolute right-16 bottom-1/4 hidden lg:block"
        >
          <Mountain className="w-40 h-40 text-slate-400/15" />
        </motion.div>

        {/* Small Mountain 3 - Mobile */}
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute right-5 top-20 lg:hidden"
        >
          <Mountain className="w-20 h-20 text-slate-400/20" />
        </motion.div>

        {/* Aviation Trail Effect */}
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 0],
            opacity: [0, 0.3, 0] 
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatDelay: 10,
            ease: 'easeInOut'
          }}
          className="absolute top-1/3 left-1/4 hidden lg:block"
        >
          <svg width="200" height="100" viewBox="0 0 200 100" className="text-blue-400/20">
            <motion.path
              d="M 10 50 Q 100 10, 190 50"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ 
                duration: 15,
                repeat: Infinity,
                repeatDelay: 10,
                ease: 'easeInOut'
              }}
            />
          </svg>
        </motion.div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center relative z-10">
        {/* Profile Card - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="order-1 lg:order-1"
        >
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-8 lg:p-10 border border-slate-700/50 shadow-2xl min-h-[500px] flex flex-col justify-center">
            {/* Badge */}
            {visibleSections.badge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm">Ready to Innovate</span>
              </motion.div>
            )}

            {/* Title */}
            {visibleSections.title && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mb-4"
              >
                <h1 className="text-white mb-2">
                  Hi, my name is
                </h1>
                <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Fahmi Bahtiar Adi Nugroho
                </h1>
              </motion.div>
            )}

            {/* Subtitle */}
            {visibleSections.subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mb-6"
              >
                <h3 className="text-slate-300">
                  <span>{typedSubtitle}</span>
                  <span className="text-blue-400 ml-1">|</span>
                </h3>
              </motion.div>
            )}

            {/* Description */}
            {visibleSections.description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-slate-400 mb-8 leading-relaxed"
              >
                Menciptakan Website Yang Inovatif, Fungsional, dan User-Friendly untuk Solusi Digital
              </motion.p>
            )}            {/* Aviation HUD Mini Grid */}
            {visibleSections.techStack && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid grid-cols-3 gap-2 mb-8"
              >
                {[
                  { 
                    Icon: Code2, 
                    label: 'Development',
                    callsign: 'ALPHA-01',
                    borderColor: 'border-cyan-500/30',
                    textColor: 'text-cyan-400',
                    bgColor: 'bg-cyan-500/10'
                  },
                  { 
                    Icon: Plane, 
                    label: 'Aviation',
                    callsign: 'BRAVO-02',
                    borderColor: 'border-blue-500/30',
                    textColor: 'text-blue-400',
                    bgColor: 'bg-blue-500/10'
                  },
                  { 
                    Icon: Mountain, 
                    label: 'Mountaineering',
                    callsign: 'CHARLIE-03',
                    borderColor: 'border-emerald-500/30',
                    textColor: 'text-emerald-400',
                    bgColor: 'bg-emerald-500/10'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={item.callsign}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: idx * 0.05, 
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="relative"
                  >
                    {/* Mini HUD Card */}
                    <div className={`relative bg-slate-900/40 backdrop-blur-sm border ${item.borderColor} rounded-lg p-3 overflow-hidden`}>
                      
                      {/* Corner Brackets */}
                      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${item.borderColor}`} />
                      <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${item.borderColor}`} />
                      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${item.borderColor}`} />
                      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${item.borderColor}`} />

                      <div className="relative z-10 flex flex-col items-center text-center gap-2">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded ${item.bgColor} border ${item.borderColor} flex items-center justify-center`}>
                          <item.Icon className={`w-5 h-5 ${item.textColor}`} />
                        </div>

                        {/* Callsign */}
                        <div className={`text-[9px] font-mono ${item.textColor} tracking-wider`}>
                          {item.callsign}
                        </div>

                        {/* Label */}
                        <div className="text-xs text-slate-300 leading-tight">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Aviation Status Indicators */}
            {visibleSections.buttons && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-3 mb-6"
              >
                {/* Status: Available */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
                >
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      className="absolute w-3 h-3 rounded-full bg-green-400/30"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div className="relative w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Status</div>
                    <div className="text-sm text-green-400 font-mono">Available for Collaboration</div>
                  </div>
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
                >
                  <Mountain className="w-4 h-4 text-cyan-400" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Location</div>
                    <div className="text-sm text-cyan-400 font-mono">Malang, Indonesia</div>
                  </div>
                </motion.div>

                {/* Experience Level */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.2 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
                >
                  <Plane className="w-4 h-4 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Flight Level</div>
                    <div className="text-sm text-purple-400 font-mono">FL030 • 3+ Years Experience</div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Scroll Hint */}
            {visibleSections.social && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex items-center gap-2 text-slate-500 text-sm"
              >
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ↓
                </motion.div>
                <span className="font-mono">Scroll to explore my journey</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Terminal Window - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="order-2 lg:order-2 cursor-pointer"
          onClick={handleClick}
        >
          <div className="w-full bg-slate-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-slate-700 overflow-hidden"
          >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/90 border-b border-slate-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 text-center text-slate-400 text-sm">
            user@portfolio: ~
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-6 font-mono text-sm md:text-base min-h-[400px] md:min-h-[500px] max-h-[70vh] overflow-y-auto"
          style={{ 
            willChange: 'contents',
            transform: 'translateZ(0)' 
          }}
        >
          {/* Welcome message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cyan-400 mb-6"
          >
            <div>Portfolio Terminal v1.0</div>
            <div className="text-slate-500 text-sm mt-1">Last login: {loginTime || 'Loading...'}</div>
            <div className="border-t border-slate-700 mt-3 mb-4" />
          </motion.div>

          {/* Displayed commands with output */}
          {displayedCommands.map((cmd, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
              style={{ willChange: 'opacity, transform' }}
            >
              {/* Input line */}
              <div className="flex items-start gap-2 mb-1">
                <span className="text-green-400 flex-shrink-0">➜</span>
                <span className="text-blue-400 flex-shrink-0">~</span>
                <span className="text-white">{cmd.input}</span>
              </div>
              
              {/* Output lines */}
              {cmd.output && (
                <div className={`ml-8 ${cmd.color || 'text-slate-300'} whitespace-pre-wrap`}>
                  {cmd.output.map((line, lineIdx) => (
                    <motion.div 
                      key={lineIdx} 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: lineIdx * 0.05 }}
                      className="leading-relaxed"
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {/* Current typing command */}
          {isTyping && currentCommandIndex < commands.length && (
            <div className="flex items-start gap-2" style={{ willChange: 'contents' }}>
              <span className="text-green-400 flex-shrink-0">➜</span>
              <span className="text-blue-400 flex-shrink-0">~</span>
              <span className="text-white">
                {commands[currentCommandIndex].input.slice(0, currentCharIndex)}
                <span className={`inline-block ${showCursor ? 'opacity-100' : 'opacity-0'}`}
                  style={{ 
                    transition: 'opacity 0.1s ease',
                    willChange: 'opacity'
                  }}
                >
                  ▋
                </span>
              </span>
            </div>
          )}

          {/* Completion prompt */}
          {!isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="flex items-start gap-2 animate-pulse">
                <span className="text-green-400 flex-shrink-0">➜</span>
                <span className="text-blue-400 flex-shrink-0">~</span>
                <span className="text-white">
                  Click anywhere to continue
                  <span className={`ml-1 inline-block ${showCursor ? 'opacity-100' : 'opacity-0'}`}
                    style={{ 
                      transition: 'opacity 0.1s ease',
                      willChange: 'opacity'
                    }}
                  >
                    ▋
                  </span>
                </span>
              </div>
            </motion.div>
          )}
          </div>
        </div>
      </motion.div>
      </div>

    </div>
  );
}
