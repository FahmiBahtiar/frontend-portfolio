'use client';

import React from 'react';
import { motion } from 'motion/react';

interface AnimatedRobotProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * Adorable, lively Mochi mascot with a playful head tilt, blinking eyes,
 * glowing bouncy antenna, and a cute waving hand.
 */
export function AnimatedRobot({ className = '', size = 32, glow = true }: AnimatedRobotProps) {
  return (
    <motion.div
      animate={{
        y: [0, -4, 0, -2, 0],
        rotate: [0, -2.5, 2.5, -1, 1, 0],
      }}
      transition={{
        duration: 3.6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 42 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {glow && (
          <defs>
            <filter id="mochi-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        )}

        {/* --- Antenna with Bouncy Tip --- */}
        <motion.g
          animate={{
            rotate: [0, -4, 4, -2, 2, 0],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '21px 11px' }}
        >
          {/* Antenna Stem */}
          <line
            x1="21"
            y1="11"
            x2="21"
            y2="4.5"
            stroke="#6FD4E1"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Glowing Antenna Bulb */}
          <motion.circle
            cx="21"
            cy="4.5"
            r="3"
            fill="#6FD4E1"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            filter={glow ? 'url(#mochi-glow)' : undefined}
          />
          {/* Antenna Sparkle Core */}
          <circle cx="20" cy="3.5" r="1" fill="#FFFFFF" opacity="0.9" />
        </motion.g>

        {/* --- Ears / Headset Nodes --- */}
        <rect x="5.5" y="16.5" width="3" height="8" rx="1.5" fill="#6FD4E1" />
        <rect x="33.5" y="16.5" width="3" height="8" rx="1.5" fill="#6FD4E1" />

        {/* --- Robot Head (Chubby & Rounded) --- */}
        <rect
          x="7.5"
          y="10.5"
          width="27"
          height="21"
          rx="7.5"
          fill="#0c282d"
          stroke="#6FD4E1"
          strokeWidth="1.75"
        />

        {/* --- Screen / Visor Area --- */}
        <rect x="10.5" y="13.5" width="21" height="13.5" rx="4.5" fill="#143c44" />

        {/* --- Left Eye with Blink Animation & Glint --- */}
        <motion.g
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            times: [0, 0.44, 0.48, 0.52, 1],
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '15.5px 19.5px' }}
        >
          <ellipse
            cx="15.5"
            cy="19.5"
            rx="2.4"
            ry="2.7"
            fill="#6FD4E1"
            filter={glow ? 'url(#mochi-glow)' : undefined}
          />
          {/* Cute Eye Glint Highlight */}
          <circle cx="16.3" cy="18.5" r="0.9" fill="#FFFFFF" />
        </motion.g>

        {/* --- Right Eye with Blink Animation & Glint --- */}
        <motion.g
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            times: [0, 0.44, 0.48, 0.52, 1],
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '26.5px 19.5px' }}
        >
          <ellipse
            cx="26.5"
            cy="19.5"
            rx="2.4"
            ry="2.7"
            fill="#6FD4E1"
            filter={glow ? 'url(#mochi-glow)' : undefined}
          />
          {/* Cute Eye Glint Highlight */}
          <circle cx="27.3" cy="18.5" r="0.9" fill="#FFFFFF" />
        </motion.g>

        {/* --- Cute Rosy Cheeks --- */}
        <motion.circle
          cx="13.5"
          cy="23"
          r="1.3"
          fill="#B9E7E6"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="28.5"
          cy="23"
          r="1.3"
          fill="#B9E7E6"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* --- Happy Smile --- */}
        <path
          d="M19 23 Q21 24.8 23 23"
          stroke="#6FD4E1"
          strokeWidth="1.25"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- Cute Waving Hand (Saying Hello!) --- */}
        <motion.g
          animate={{
            rotate: [0, 24, -6, 24, -4, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 2.4,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '34px 24px' }}
        >
          {/* Hand Arm */}
          <path
            d="M34 24 Q37 21 38 18"
            stroke="#6FD4E1"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Round Hand Palm */}
          <circle cx="38" cy="17.5" r="2" fill="#6FD4E1" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
