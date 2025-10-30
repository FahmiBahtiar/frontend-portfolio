'use client';

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface JourneyCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  achievements: string[];
  index: number;
}

export function JourneyCard({
  icon: Icon,
  title,
  description,
  image,
  achievements,
  index,
}: JourneyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300"
    >
      {/* Background image */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white mb-2">{title}</h3>
            <p className="text-white/70">{description}</p>
          </div>
        </div>

        <div className="space-y-2 mt-6">
          {achievements.map((achievement, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 + i * 0.1 }}
              className="flex items-center gap-2 text-white/80"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span>{achievement}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
