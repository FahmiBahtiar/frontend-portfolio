'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Plane, Mountain, Terminal } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [loadingText, setLoadingText] = useState('Initializing system...');
  const [progress, setProgress] = useState(0);

  const icons = [
    { Icon: Code2, color: 'text-cyan-400', label: 'Developer' },
    { Icon: Plane, color: 'text-blue-400', label: 'Aviation' },
    { Icon: Mountain, color: 'text-green-400', label: 'Mountaineer' },
  ];

  // Loading text sequence - OPTIMIZED
  useEffect(() => {
    const messages = [
      { text: 'Initializing system...', delay: 0 },
      { text: 'Loading modules...', delay: 600 },
      { text: 'Ready to launch!', delay: 1200 },
    ];

    messages.forEach(({ text, delay }) => {
      setTimeout(() => setLoadingText(text), delay);
    });
  }, []);

  // Progress bar animation - OPTIMIZED to 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5; // 20 steps in 2 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Auto complete after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Simple background - no blur for performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900" />

      {/* Main content - Clean loading without box */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full space-y-8"
        >
          {/* Icons row with labels - simplified animations */}
          <div className="flex items-center justify-center gap-6 md:gap-12">
            {icons.map(({ Icon, color, label }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1), duration: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                
                <span className="text-xs text-slate-500 font-mono">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Progress info */}
          <div className="space-y-4">
            {/* Loading text with simple cursor */}
            <div className="flex items-center justify-center gap-2 text-sm font-mono">
              <Terminal className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-slate-300">{loadingText}</span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-green-400"
              >
                ▋
              </motion.span>
            </div>

            {/* Progress bar with plane - simplified */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className="relative h-2 bg-slate-800 rounded-full overflow-visible border border-slate-700">
                {/* Progress fill */}
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Flying Plane - simplified animation */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${progress}%`,
                    x: '-50%'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Plane className="w-5 h-5 text-blue-400 rotate-45" />
                </motion.div>
              </div>
              
              {/* Progress percentage */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  [{Array(Math.floor(progress / 5)).fill('=').join('')}
                  {Array(20 - Math.floor(progress / 5)).fill(' ').join('')}]
                </span>
                <span className="text-cyan-400">{progress.toFixed(0)}%</span>
              </div>
            </div>

            {/* System info - static, no animations */}
            <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-600 pt-2">
              <span>⚛ React</span>
              <span>⚡ Tailwind</span>
              <span>🎨 Motion</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
