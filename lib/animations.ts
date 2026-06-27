// Animation configurations optimized for Next.js
// Using hardware-accelerated properties and optimized easing functions

export const smoothTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
  mass: 0.8,
};

export const smoothEase = [0.25, 0.1, 0.25, 1.0] as const;

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    ease: smoothEase,
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.4,
    ease: smoothEase,
  },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: 0.4,
    ease: smoothEase,
  },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 0.5,
    ease: smoothEase,
  },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: 0.5,
    ease: smoothEase,
  },
};

// Optimized stagger config for children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Smooth scroll behavior
export const smoothScrollToSection = (element: HTMLElement) => {
  element.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start',
    inline: 'nearest'
  });
};

// Optimized carousel transition
export const carouselTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.2,
    ease: smoothEase,
  },
};

export const hoverGlow = {
  boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)",
  transition: {
    duration: 0.3,
    ease: smoothEase,
  },
};

// Loading animations
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: 0.3,
    ease: smoothEase,
  },
};

// Viewport detection config
export const viewportConfig = {
  once: true,
  margin: "-100px",
  amount: 0.3,
};

// Reduced motion preferences
export const respectReducedMotion = <T extends object>(animation: T) => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      ...animation,
      transition: { duration: 0.01 },
    };
  }
  return animation;
};
