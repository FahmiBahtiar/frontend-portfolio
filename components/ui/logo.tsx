import React from 'react';

// Logo dengan SVG path custom untuk hasil lebih artistik
export function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Dark background gradient matching web theme */}
        <linearGradient id="logoBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#020617" stopOpacity="1" />
          <stop offset="50%" stopColor="#0f172a" stopOpacity="1" />
          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
        </linearGradient>
        
        {/* Accent gradient for letter B */}
        <linearGradient id="logoTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
        </linearGradient>
        
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Dark background rounded square */}
      <rect width="100" height="100" rx="22" fill="url(#logoBgGradient)" filter="url(#shadow)" />
      
      {/* Border with subtle accent */}
      <rect 
        width="100" 
        height="100" 
        rx="22" 
        fill="none" 
        stroke="url(#logoTextGradient)" 
        strokeWidth="1" 
        strokeOpacity="0.2"
      />
      
      {/* Stylized letter B with gradient */}
      <path
        d="M32 25 h20 c8 0 14 4 14 11 c0 5 -3 8 -7 9 c5 1 9 5 9 11 c0 8 -7 12 -15 12 h-21 z M40 33 v12 h10 c4 0 7 -2 7 -6 c0 -4 -3 -6 -7 -6 z M40 52 v13 h11 c5 0 8 -2 8 -6.5 c0 -4.5 -3 -6.5 -8 -6.5 z"
        fill="url(#logoTextGradient)"
        fillOpacity="0.95"
      />
    </svg>
  );
}
