'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Updated interface to include title and description
interface CarouselItem {
  id: string | number;
  image: string;
  title?: string;
  description?: string;
}

interface Carousel3DProps {
  items: CarouselItem[];
  onSelect: (index: number) => void;
  selectedIndex: number;
}

export function Carousel3D({ items, onSelect, selectedIndex }: Carousel3DProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        className="relative w-full h-full"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        {items.map((item, itemIndex) => {
          const position = itemIndex - selectedIndex;
          const isCenter = position === 0;
          const isAdjacent = Math.abs(position) === 1;
          
          // Simplified visibility for clarity
          const isVisible = Math.abs(position) <= (isMobile ? 1 : 2);

          if (!isVisible) {
            return null;
          }

          // Simplified transforms
          const rotateY = position * (isMobile ? -25 : -20);
          const translateX = position * (isMobile ? 60 : 120);
          const scale = isCenter ? 1 : 0.7;
          const zIndex = items.length - Math.abs(position);

          return (
            <motion.div
              key={item.id}
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
              initial={false}
              animate={{
                transform: `translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`,
                zIndex,
                opacity: isCenter ? 1 : 0.5,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              onClick={() => onSelect(itemIndex)}
            >
              <div className="relative w-full max-w-xs md:max-w-md lg:max-w-lg aspect-video rounded-lg overflow-hidden shadow-2xl cursor-pointer">
                <Image
                  src={item.image}
                  alt={item.title || 'Gallery image'}
                  layout="fill"
                  objectFit="cover"
                  className="transition-all duration-300"
                  unoptimized // Add this if you have issues with external image providers
                />
                <AnimatePresence>
                  {isCenter && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <h3 className="font-bold text-white text-lg">{item.title}</h3>
                      <p className="text-white/80 text-sm">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
