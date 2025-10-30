'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface CarouselItem {
  id: number;
  image: string;
}

interface Carousel3DProps {
  items: CarouselItem[];
  currentIndex: number;
}

export function Carousel3D({ items, currentIndex }: Carousel3DProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden px-4 md:px-8">
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

          // Calculate transforms
          let xOffset = wrappedPosition * 280;
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
            xOffset = isMobile ? wrappedPosition * 140 : wrappedPosition * 220;
            blur = isMobile ? 4 : 2;
            brightness = isMobile ? 0.8 : 0.9;
            opacity = isMobile ? 0.7 : 1;
          } else if (isFar) {
            scale = 0.78;
            zIndex = 10;
            opacity = 0.85;
            rotateY = wrappedPosition * 8;
            xOffset = wrappedPosition * 230;
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
                className={`relative overflow-hidden ${
                  isCenter
                    ? 'w-[280px] h-[158px] md:w-[480px] md:h-[270px] lg:w-[640px] lg:h-[360px] rounded-[16px] md:rounded-[24px] lg:rounded-[32px] border-[4px] md:border-[6px] lg:border-[8px] border-white/90 shadow-2xl'
                    : 'w-[224px] h-[126px] md:w-[384px] md:h-[216px] lg:w-[512px] lg:h-[288px] rounded-[12px] md:rounded-[18px] lg:rounded-[24px] border-[3px] md:border-[4px] lg:border-[6px] border-white/60 shadow-xl'
                }`}
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
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
