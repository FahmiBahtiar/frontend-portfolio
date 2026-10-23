import React from 'react';

// Arctic Ice Logo matching web theme (White & Ice Squircle with vibrant cyan letter B)
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
        {/* Arctic Ice background gradient */}
        <linearGradient id="logoBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#E2F4F3" />
        </linearGradient>
        
        {/* Accent cyan gradient for letter B */}
        <linearGradient id="logoTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        
        <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0c282d" floodOpacity="0.12"/>
        </filter>
      </defs>
      
      {/* Arctic Ice background rounded squircle */}
      <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#logoBgGradient)" filter="url(#logoShadow)" />
      
      {/* Borders */}
      <rect 
        x="2" 
        y="2" 
        width="96" 
        height="96" 
        rx="22" 
        fill="none" 
        stroke="#6FD4E1" 
        strokeWidth="2" 
        strokeOpacity="0.8"
      />
      <rect 
        x="4" 
        y="4" 
        width="92" 
        height="92" 
        rx="20" 
        fill="none" 
        stroke="#B9E7E6" 
        strokeWidth="1" 
        strokeOpacity="0.6"
      />
      
      {/* Stylized letter B with Arctic Gradient */}
      <path
        d="M32 24 h21 c8.5 0 14.5 4.2 14.5 11.5 c0 5.2 -3.2 8.5 -7.5 9.8 c5.5 1.2 9.5 5.5 9.5 11.7 c0 8.5 -7.5 13 -16 13 h-21.5 z M40.5 32.5 v12.5 h11 c4.5 0 7.5 -2.2 7.5 -6.2 c0 -4.2 -3 -6.3 -7.5 -6.3 z M40.5 52.5 v14.5 h12 c5 0 8.5 -2.2 8.5 -7.2 c0 -4.8 -3.5 -7.3 -8.5 -7.3 z"
        fill="url(#logoTextGradient)"
      />
    </svg>
  );
}
