'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Makes all framer-motion animations honor the OS "reduce motion" setting.
 * With reducedMotion="user", transform/layout animations are skipped for users
 * who prefer reduced motion (vestibular safety / WCAG 2.3.3).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
