import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Detect if user prefers reduced motion or is on mobile for performance
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSlowDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
  
  return prefersReducedMotion || (isMobile && isSlowDevice);
};

// Get optimized animation config based on device
export const getAnimationConfig = () => {
  const reduce = shouldReduceMotion();
  
  return {
    initial: reduce ? {} : { opacity: 0, y: 20 },
    animate: reduce ? {} : { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { duration: 0.3 },
  };
};
