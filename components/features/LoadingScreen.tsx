'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Code2, Plane, Mountain, Terminal } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
  isApiLoaded?: boolean;
  apiError?: string | null;
}

export function LoadingScreen({ onComplete, isApiLoaded = false, apiError = null }: LoadingScreenProps) {
  const [loadingText, setLoadingText] = useState('Initializing system...');
  const [progress, setProgress] = useState(0);

  const icons = [
    { Icon: Code2, color: 'text-cyan-400', label: 'Developer' },
    { Icon: Plane, color: 'text-blue-400', label: 'Aviation' },
    { Icon: Mountain, color: 'text-green-400', label: 'Mountaineer' },
  ];

  // Loading text sequence - show error if API fails
  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    if (apiError) {
      setLoadingText('API Connection Failed');
      return;
    }

    const messages = [
      { text: 'Initializing system...', delay: 0 },
      { text: 'Loading modules...', delay: 600 },
      { text: 'Ready to launch!', delay: 1200 },
    ];

    timeouts = messages.map(({ text, delay }) =>
      setTimeout(() => setLoadingText(text), delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [apiError]);

  // Progress bar animation - sync with API loading
  useEffect(() => {
    if (apiError) {
      // Stop progress if there's an error
      return;
    }

    // While waiting for API, advance slowly up to 90%
    if (!isApiLoaded) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 2; // Slower progress while waiting
        });
      }, 200);

      return () => clearInterval(interval);
    }

    // When API becomes ready, show "API Ready" and animate remaining progress to 100%
    let intervalId: number | null = null;
    setLoadingText('API Ready');

    intervalId = window.setInterval(() => {
      setProgress(prev => {
        // larger delta and faster ticks to finish quicker
        const delta = Math.max(2, Math.round((100 - prev) / 4));
        const next = Math.min(100, prev + delta);
        if (next === 100 && intervalId) {
          clearInterval(intervalId);
          // much shorter pause so user sees 100% but app proceeds promptly
          setTimeout(() => onComplete(), 150);
        }
        return next;
      });
    }, 50);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isApiLoaded, apiError, onComplete]);

  // Auto complete fallback when API hasn't loaded after some time (but not if error)
  useEffect(() => {
    if (apiError) return;

    // If API is already loaded, let the progress effect drive completion so user sees the "API Ready" animation
    if (isApiLoaded) return;

    // Fallback: complete after 10 seconds if API still not loaded
    const timer = setTimeout(() => {
      onComplete();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onComplete, isApiLoaded, apiError]);

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

            {/* Error message if API failed */}
            {apiError && (
              <div className="flex flex-col items-center gap-2 text-sm font-mono">
                <div className="flex items-center justify-center gap-2 text-sm font-mono text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2 max-w-md mx-auto">
                  <span className="text-red-400">⚠️</span>
                  <span>{apiError}</span>
                </div>
              </div>
            )}

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

            {/* API error message - shown only on error */}
            {apiError && (
              <div className="mt-4 text-sm text-red-400 font-mono">
                Error: {apiError}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
