'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#E2F4F3] via-[#F4FBFA] to-[#E2F4F3] text-[#0c282d] flex flex-col justify-center items-center px-6 py-20 text-center">
      {/* Arctic Ice ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#6FD4E1]/20 blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-[#B9E7E6]/30 blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
        {/* Radar Badge */}
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B9E7E6] bg-white px-4 py-1.5 text-xs font-mono font-bold tracking-[0.2em] text-[#0891b2] uppercase shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0891b2] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0891b2]" />
          </span>
          Radar Signal Lost
        </motion.div>

        {/* Icon */}
        <motion.div
          className="w-20 h-20 rounded-3xl bg-white border-2 border-[#B9E7E6] shadow-md flex items-center justify-center text-[#0891b2] mb-6 rotate-3 hover:rotate-0 transition-transform duration-300"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Compass className="w-10 h-10 text-[#0891b2]" strokeWidth={1.75} />
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0c282d] tracking-tight leading-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          404 — Off Radar
        </motion.h1>

        {/* Note */}
        <motion.p
          className="text-base sm:text-lg text-[#2d5f68] font-medium leading-relaxed mb-8 max-w-md"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          The coordinates you entered are outside our mapped airway corridors. Recalibrate your heading to return to home base.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#6FD4E1] hover:bg-[#B9E7E6] px-7 py-3 text-sm font-bold text-[#0c282d] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-[#0c282d] transition-transform group-hover:-translate-x-1" />
            Return to Runway
          </Link>
        </motion.div>
      </div>
    </div>
  );
}