'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Code2, Calendar, MapPin, User, Globe, Plane, Mountain, Terminal, ChevronDown, Loader2 } from 'lucide-react';

interface LanyardData {
  id: string;
  serviceName: string;
  serviceType: string;
  passportLabel: string;
  type: string;
  countryCode: string;
  passportNo: string;
  surname: string;
  givenNames: string;
  nationality: string;
  placeOfBirth: string;
  sex: 'M' | 'F';
  dateOfBirth: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  avatarUrl?: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export function LanyardCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [lanyardData, setLanyardData] = useState<LanyardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanyardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/admin/about/lanyard');
        if (!response.ok) {
          throw new Error('Failed to fetch lanyard data');
        }
        const result = await response.json();
        if (result.success && result.data) {
          setLanyardData(result.data);
        } else {
          setError('No lanyard data available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lanyard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanyardData();
  }, []);

  if (isLoading) {
    return (
      <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-8 md:py-12 px-4 md:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading passport...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lanyardData) {
    return (
      <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-8 md:py-12 px-4 md:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-white/60 mb-4">Unable to load passport data</p>
            <p className="text-white/40 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-8 md:py-12 px-4 md:px-8">
      {/* Passport Card - Center Top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mb-8 md:mb-12"
      >
        {/* Single Passport Card - Indonesia Style with Flip */}
        <div className="relative w-[300px] h-[420px] md:w-[400px] md:h-[560px]" style={{ perspective: '1500px' }}>
          {/* Passport Card - Flipable */}
          <motion.div 
            className="w-full h-full relative cursor-pointer"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            onClick={() => setIsFlipped(!isFlipped)}
            whileHover={{ scale: 1.02 }}
          >
            {/* FRONT SIDE - Blue Cover */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#1a3a5c] via-[#1e4466] to-[#1a3a5c] shadow-2xl overflow-hidden border-4 border-[#0f2847]" style={{ backfaceVisibility: 'hidden' }}>
              {/* Leather/fabric texture overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`
                }} />
              </div>

              {/* Main Content */}
              <div className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-12">
                {/* Top: Country Name */}
                <div className="text-center space-y-2">
                  <h2 className="text-amber-300/90 tracking-[0.2em] md:tracking-[0.4em] text-sm md:text-lg">{lanyardData.serviceName}</h2>
                </div>

                {/* Center: Garuda-style emblem */}
                <div className="flex flex-col items-center justify-center flex-1 -mt-8">
                  {/* Emblem circle with wings effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    {/* Wings spread effect */}
                    <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-16 h-24 opacity-30">
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent rounded-full transform -skew-y-12" />
                    </div>
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-16 h-24 opacity-30">
                      <div className="w-full h-full bg-gradient-to-l from-transparent via-amber-400/20 to-transparent rounded-full transform skew-y-12" />
                    </div>

                    {/* Main emblem */}
                    <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full border-2 md:border-4 border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent flex items-center justify-center backdrop-blur-sm shadow-2xl">
                      {/* Inner glow */}
                      <div className="absolute inset-2 md:inset-3 rounded-full bg-gradient-to-br from-amber-400/10 to-transparent" />
                      
                      {/* Three theme icons arranged vertically like Garuda */}
                      <div className="relative flex flex-col items-center gap-2 md:gap-3">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-blue-500/20 border-2 border-blue-400/40 flex items-center justify-center backdrop-blur-sm">
                          <Plane className="w-5 h-5 md:w-7 md:h-7 text-blue-300" />
                        </div>
                        <div className="flex gap-2 md:gap-4">
                          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center backdrop-blur-sm">
                            <Code2 className="w-4 h-4 md:w-6 md:h-6 text-cyan-300" />
                          </div>
                          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-green-500/20 border-2 border-green-400/40 flex items-center justify-center backdrop-blur-sm">
                            <Mountain className="w-4 h-4 md:w-6 md:h-6 text-green-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Shield/banner below emblem */}
                  <div className="mt-4 md:mt-6 relative">
                    <div className="w-32 md:w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-2 md:mb-3" />
                    <div className="text-center space-y-1">
                      <p className="text-amber-300/80 tracking-[0.15em] md:tracking-[0.3em] text-xs md:text-sm">{lanyardData.passportLabel}</p>
                      <p className="text-amber-400/60 tracking-[0.15em] md:tracking-[0.25em] text-[10px] md:text-xs italic">{lanyardData.serviceType}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom: Logo symbol */}
                <div className="text-center pb-4">
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 border-amber-500/30 bg-amber-500/5 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-8 h-1 bg-amber-500/50 rounded" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* BACK SIDE - Detail Information Page */}
            <div 
              className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 shadow-2xl overflow-hidden border-4 border-amber-200"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Watermark background pattern */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="grid grid-cols-4 gap-6 p-6">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <Globe className="w-10 h-10 text-blue-900" />
                      <Plane className="w-6 h-6 text-blue-900" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="relative w-full h-full p-4 md:p-8 flex flex-col">
                {/* Header */}
                <div className="text-center mb-6 pb-4 border-b-2 border-blue-900/20">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Globe className="w-6 h-6 text-blue-900" />
                    <h3 className="text-blue-900 tracking-[0.2em]">{lanyardData.serviceName}</h3>
                    <Globe className="w-6 h-6 text-blue-900" />
                  </div>
                  <p className="text-blue-800 text-xs tracking-[0.3em]">{lanyardData.serviceType}</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="w-12 h-px bg-blue-900/30" />
                    <p className="text-blue-700/60 text-xs">{lanyardData.passportLabel}</p>
                    <div className="w-12 h-px bg-blue-900/30" />
                  </div>
                </div>

                {/* Photo and Personal Info Section */}
                <div className="flex gap-5 mb-5">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded border-2 border-slate-300 overflow-hidden">
                      {lanyardData.avatarUrl ? (
                        <img src={lanyardData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                          <User className="w-16 h-16 text-slate-500" />
                        </div>
                      )}
                      
                      {/* Photo overlay pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="w-full h-full grid grid-cols-4 gap-1">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className="bg-blue-900" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Digital chip */}
                    <motion.div
                      className="mt-3 w-32 h-11 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded border border-amber-700 shadow-md relative overflow-hidden"
                      whileHover={{ scale: 1.03 }}
                    >
                      {/* Chip contact pattern */}
                      <div className="absolute inset-2 grid grid-cols-4 gap-0.5">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="bg-amber-800/50 rounded-sm" />
                        ))}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                    </motion.div>
                  </div>

                  {/* Personal Info */}
                  <div className="flex-1 space-y-3 text-sm">
                    {/* Type */}
                    <div>
                      <p className="text-blue-900/60 text-xs uppercase tracking-wide">Type / Tipe</p>
                      <p className="text-blue-900">{lanyardData.type}</p>
                    </div>

                    {/* Country Code */}
                    <div>
                      <p className="text-blue-900/60 text-xs uppercase tracking-wide">Country Code</p>
                      <p className="text-blue-900">{lanyardData.countryCode}</p>
                    </div>

                    {/* Passport No */}
                    <div>
                      <p className="text-blue-900/60 text-xs uppercase tracking-wide">Passport No.</p>
                      <p className="text-blue-900 font-mono tracking-wider">{lanyardData.passportNo}</p>
                    </div>

                    {/* Surname */}
                    <div>
                      <p className="text-blue-900/60 text-xs uppercase tracking-wide">Surname / Nama Keluarga</p>
                      <p className="text-blue-900 uppercase">{lanyardData.surname}</p>
                    </div>

                    {/* Given Names */}
                    <div>
                      <p className="text-blue-900/60 text-xs uppercase tracking-wide">Given Names / Nama Depan</p>
                      <p className="text-blue-900 uppercase">{lanyardData.givenNames}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  {/* Nationality */}
                  <div>
                    <p className="text-blue-900/60 text-xs uppercase tracking-wide">Nationality</p>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-700" />
                      <p className="text-blue-900">{lanyardData.nationality}</p>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <p className="text-blue-900/60 text-xs uppercase tracking-wide">Date of Birth</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" />
                      <p className="text-blue-900">{lanyardData.dateOfBirth}</p>
                    </div>
                  </div>

                  {/* Place of Birth */}
                  <div>
                    <p className="text-blue-900/60 text-xs uppercase tracking-wide">Place of Birth</p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-700" />
                      <p className="text-blue-900">{lanyardData.placeOfBirth}</p>
                    </div>
                  </div>

                  {/* Sex */}
                  <div>
                    <p className="text-blue-900/60 text-xs uppercase tracking-wide">Sex / Jenis Kelamin</p>
                    <p className="text-blue-900">{lanyardData.sex} / {lanyardData.sex === 'M' ? 'L' : 'P'}</p>
                  </div>

                  {/* Date of Issue */}
                  <div>
                    <p className="text-blue-900/60 text-xs uppercase tracking-wide">Date of Issue</p>
                    <p className="text-blue-900">{lanyardData.dateOfIssue}</p>
                  </div>

                  {/* Date of Expiry */}
                  <div>
                    <p className="text-blue-900/60 text-xs uppercase tracking-wide">Date of Expiry</p>
                    <p className="text-blue-900 text-red-700">{lanyardData.dateOfExpiry}</p>
                  </div>
                </div>

                {/* Signature */}
                <div className="mb-4">
                  <p className="text-blue-900/60 text-xs uppercase tracking-wide mb-2">Holder's Signature / Tanda Tangan</p>
                  <div className="h-12 border-b-2 border-blue-900/20 flex items-end pb-1">
                    <p className="text-blue-900 italic font-serif text-2xl">Your Signature</p>
                  </div>
                </div>

                {/* Machine Readable Zone (MRZ) */}
                <div className="bg-blue-900/5 rounded-lg p-3 font-mono text-xs leading-tight space-y-1">
                  <div className="text-blue-900 tracking-wider">{`P<${lanyardData.countryCode}${lanyardData.surname.padEnd(39, '<').slice(0, 39)}`}</div>
                  <div className="text-blue-900 tracking-wider">{`${lanyardData.passportNo}<${lanyardData.countryCode}${lanyardData.dateOfBirth.replace(/\s/g, '')}${lanyardData.sex}${lanyardData.dateOfExpiry.replace(/\s/g, '')}${lanyardData.surname.slice(0, 3).toUpperCase()}<${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`}</div>
                </div>

                {/* Theme Icons at bottom right */}
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-600/40 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Code2 className="w-4 h-4 text-cyan-700" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-600/40 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Plane className="w-4 h-4 text-blue-700" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="w-8 h-8 rounded-full bg-green-500/20 border border-green-600/40 flex items-center justify-center backdrop-blur-sm"
                  >
                    <Mountain className="w-4 h-4 text-green-700" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Philosophy Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="relative group">
          {/* Main Philosophy Card */}
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-cyan-400/30 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-orange-400/30 rounded-br-3xl" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  className="h-px w-12 bg-gradient-to-r from-transparent via-white/40 to-white/40"
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                />
                <h3 className="text-white/60 tracking-[0.3em] uppercase text-xs md:text-sm">Philosophy</h3>
                <motion.div
                  className="h-px w-12 bg-gradient-to-l from-transparent via-white/40 to-white/40"
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                />
              </motion.div>

              {/* Main Quote */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="space-y-4"
              >
                <p className="text-white/90 text-lg md:text-2xl leading-relaxed max-w-3xl italic">
                  "Code like a <span className="text-cyan-400 not-italic">developer</span>, 
                  think like a <span className="text-orange-400 not-italic">pilot</span>, 
                  persevere like a <span className="text-green-400 not-italic">mountaineer</span>. 
                  Every challenge is just another peak to conquer."
                </p>
              </motion.div>

              {/* Signature line */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-6"
              />
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
