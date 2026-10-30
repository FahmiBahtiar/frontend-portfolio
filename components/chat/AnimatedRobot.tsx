'use client';

import React from 'react';
import { motion } from 'motion/react';

interface AnimatedRobotProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export function AnimatedRobot({ className = '', size = 28, glow = true }: AnimatedRobotProps) {
  return (
    <motion.div
      animate={{
        y: [0, -3, 0],
        rotate: [0, -1.5, 1.5, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Glow effect filter */}
        {glow && (
          <defs>
            <filter id="robot-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        )}

        {/* Antenna Stem */}
        <motion.line
          x1="18"
          y1="8"
          x2="18"
          y2="3"
          stroke="#6FD4E1"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Antenna Bulb / Signal Pulse */}
        <motion.circle
          cx="18"
          cy="3"
          r="2.5"
          fill="#6FD4E1"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          filter={glow ? 'url(#robot-glow)' : undefined}
        />

        {/* Ears / Side Headset Nodes */}
        <rect x="4" y="14" width="2.5" height="7" rx="1.25" fill="#6FD4E1" />
        <rect x="29.5" y="14" width="2.5" height="7" rx="1.25" fill="#6FD4E1" />

        {/* Robot Head Body */}
        <rect
          x="6.5"
          y="8"
          width="23"
          height="19"
          rx="6"
          fill="#0c282d"
          stroke="#6FD4E1"
          strokeWidth="1.5"
        />

        {/* Screen / Visor Area */}
        <rect x="9.5" y="11.5" width="17" height="11" rx="3.5" fill="#163e46" />

        {/* Left Eye */}
        <motion.ellipse
          cx="13.5"
          cy="17"
          rx="2"
          ry="2.2"
          fill="#6FD4E1"
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            times: [0, 0.45, 0.5, 0.55, 1],
            ease: 'easeInOut',
          }}
          filter={glow ? 'url(#robot-glow)' : undefined}
        />

        {/* Right Eye */}
        <motion.ellipse
          cx="22.5"
          cy="17"
          rx="2"
          ry="2.2"
          fill="#6FD4E1"
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            times: [0, 0.45, 0.5, 0.55, 1],
            ease: 'easeInOut',
          }}
          filter={glow ? 'url(#robot-glow)' : undefined}
        />

        {/* Cute Cheek Blushes */}
        <circle cx="11.5" cy="20.5" r="1" fill="#B9E7E6" opacity="0.6" />
        <circle cx="24.5" cy="20.5" r="1" fill="#B9E7E6" opacity="0.6" />

        {/* Little Smile / Indicator */}
        <path
          d="M16 20.5 Q18 22 20 20.5"
          stroke="#6FD4E1"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}
