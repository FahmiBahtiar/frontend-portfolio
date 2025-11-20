'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarouselItem {
  id: string | number;
  image: string;
}

interface CockpitCarouselProps {
  items: CarouselItem[];
  currentIndex: number;
}

export const CockpitCarousel = memo(function CockpitCarousel({ items, currentIndex }: CockpitCarouselProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1920);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setViewportWidth(width);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[clamp(400px,30vh,600px)] flex items-center justify-center overflow-hidden px-4 md:px-8">
      {/* Crosshair Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative w-full h-full max-w-[1600px]">
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-16 h-16">
              {/* Horizontal line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/30" />
              {/* Vertical line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/30" />
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-cyan-400/50" />
            </div>
          </div>

          {/* Corner markers */}
          <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-cyan-400/20" />
          <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-cyan-400/20" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-cyan-400/20" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-cyan-400/20" />
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full max-w-[1600px] h-full flex items-center justify-center">
        {items.map((item, itemIndex) => {
          const position = itemIndex - currentIndex;
          const wrappedPosition = 
            position > items.length / 2 ? position - items.length :
            position < -items.length / 2 ? position + items.length :
            position;
          
          const isCenter = wrappedPosition === 0;
          const isAdjacent = Math.abs(wrappedPosition) === 1;
          const isFar = Math.abs(wrappedPosition) === 2;
          // On mobile, only show center and adjacent cards
          const isVisible = isMobile 
            ? Math.abs(wrappedPosition) <= 1 
            : Math.abs(wrappedPosition) <= 2;

          // Calculate responsive offsets based on viewport
          const baseOffset = Math.min(viewportWidth * 0.15, 280); // Max 280px or 15% of viewport
          const mobileOffset = Math.min(viewportWidth * 0.08, 140); // Max 140px or 8% of viewport
          const adjacentOffset = Math.min(viewportWidth * 0.12, 220); // Max 220px or 12% of viewport
          const farOffset = Math.min(viewportWidth * 0.13, 230); // Max 230px or 13% of viewport

          let xOffset = wrappedPosition * baseOffset;
          let scale = 1;
          let zIndex = 10;
          let opacity = 1;
          let rotateY = 0;
          let blur = 0;
          let brightness = 1;

          if (isCenter) {
            scale = 1;
            zIndex = 30;
            xOffset = 0;
            blur = 0;
            brightness = 1;
          } else if (isAdjacent) {
            // Mobile: smaller offset and more blur
            scale = isMobile ? 0.75 : 0.82;
            zIndex = 20;
            rotateY = wrappedPosition * 6;
            xOffset = isMobile ? wrappedPosition * mobileOffset : wrappedPosition * adjacentOffset;
            blur = isMobile ? 4 : 2;
            brightness = isMobile ? 0.8 : 0.9;
            opacity = isMobile ? 0.7 : 1;
          } else if (isFar) {
            scale = 0.78;
            zIndex = 10;
            opacity = 0.85;
            rotateY = wrappedPosition * 8;
            xOffset = wrappedPosition * farOffset;
            blur = 4;
            brightness = 0.8;
          } else {
            scale = 0.4;
            opacity = 0;
            zIndex = 0;
            blur = 8;
            brightness = 0.5;
          }

          if (!isVisible) {
            return null;
          }

          return (
            <motion.div
              key={item.id}
              className="absolute will-change-transform"
              initial={false}
              animate={{
                x: xOffset,
                scale,
                opacity,
                zIndex,
                rotateY,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.8,
                restDelta: 0.001,
                restSpeed: 0.001,
              }}
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
              }}
            >
              <motion.div
                className="relative overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  filter: `blur(${blur}px) brightness(${brightness})`,
                  willChange: 'filter',
                }}
                animate={{
                  filter: `blur(${blur}px) brightness(${brightness})`,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                {/* Image Frame */}
                <div className={`relative ${
                  isCenter
                    ? 'w-[280px] h-[158px] md:w-[480px] md:h-[270px] lg:w-[640px] lg:h-[360px] xl:w-[clamp(400px,25vw,640px)] xl:h-[clamp(225px,14vh,360px)]'
                    : 'w-[224px] h-[126px] md:w-[384px] md:h-[216px] lg:w-[512px] lg:h-[288px] xl:w-[clamp(320px,20vw,512px)] xl:h-[clamp(180px,11vh,288px)]'
                }`}>
                  {/* Cockpit Window Frame */}
                  <div className={`absolute inset-0 pointer-events-none z-10 ${
                    isCenter 
                      ? 'border-[4px] md:border-[6px] lg:border-[8px] border-cyan-400/60' 
                      : 'border-[3px] md:border-[4px] lg:border-[6px] border-cyan-400/30'
                  } rounded-lg`}>
                    {/* Corner reinforcements */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400" />
                  </div>

                  {/* Scanline overlay for center image */}
                  {isCenter && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-lg"
                      initial={false}
                    >
                      <motion.div
                        className="absolute inset-x-0 h-1 bg-cyan-400/20 blur-sm"
                        animate={{
                          y: ['0%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Image */}
                  <Image
                    src={item.image}
                    alt={`Mission photo ${itemIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 240px, (max-width: 1024px) 400px, 580px"
                    className={`object-cover ${
                      isCenter ? 'rounded-lg shadow-2xl shadow-cyan-500/20' : 'rounded-lg shadow-xl'
                    }`}
                    priority={isCenter}
                    quality={isCenter ? 90 : 75}
                  />

                  {/* Glow effect for center image */}
                  {isCenter && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
    </div>
  );
});
