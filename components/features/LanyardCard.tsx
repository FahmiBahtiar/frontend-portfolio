'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Code2, Calendar, MapPin, User, Globe, Plane, Mountain, Loader2, RefreshCw } from 'lucide-react';

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
          if (Array.isArray(result.data)) {
            const raw = result.data[0] || null;
            if (raw) {
              setLanyardData({
                id: raw.id,
                serviceName: raw.service_name,
                serviceType: raw.service_type,
                passportLabel: raw.passport_label,
                type: raw.type,
                countryCode: raw.country_code,
                passportNo: raw.passport_no,
                surname: raw.surname,
                givenNames: raw.given_names,
                nationality: raw.nationality,
                placeOfBirth: raw.place_of_birth,
                sex: raw.sex,
                dateOfBirth: raw.date_of_birth,
                dateOfIssue: raw.date_of_issue,
                dateOfExpiry: raw.date_of_expiry,
                avatarUrl: raw.avatar_url,
                backgroundColor: raw.background_color,
                textColor: raw.text_color,
                accentColor: raw.accent_color,
              });
            } else {
              setLanyardData(null);
            }
          } else {
            // If not array, fallback to old behavior (assume already camelCase)
            setLanyardData(result.data);
          }
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
        className="relative z-10 mb-6 md:mb-10 w-full flex flex-col items-center"
      >
        {/* Single Passport Card - Indonesia Style with Flip (Responsive) */}
        <div className="w-full flex items-center justify-center" style={{ perspective: '1500px' }}>
          {/* Maintain aspect ratio ~ 5:7 using padding-top trick so it scales with width */}
          <div className="relative w-full max-w-[420px] sm:max-w-[440px] md:max-w-[600px] lg:max-w-[900px]" aria-live="polite">
            <div className="relative w-full" style={{ paddingTop: '140%' }}>
              {/* Passport Card - Flippable - absolute to fill ratio box */}
              <motion.div 
                className="absolute inset-0 w-full h-full cursor-pointer"
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
                role="button"
                aria-pressed={isFlipped}
                aria-label="Flip passport card"
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
              <div className="relative w-full h-full flex flex-col items-center justify-between p-5 sm:p-8 md:p-12">
                {/* Top: Country Name */}
                <div className="text-center space-y-2">
                  <h2 className="text-amber-300/90 tracking-[0.2em] md:tracking-[0.35em] lg:tracking-[0.4em] text-sm sm:text-base md:text-2xl lg:text-3xl">{lanyardData.serviceName}</h2>
                </div>

                {/* Center: Garuda-style emblem */}
                <div className="flex flex-col items-center justify-center flex-1 -mt-6 sm:-mt-8">
                  {/* Emblem circle with wings effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    {/* Wings spread effect */}
                    <div className="absolute -left-16 sm:-left-20 lg:-left-24 top-1/2 -translate-y-1/2 w-14 h-24 sm:w-20 sm:h-28 lg:w-24 lg:h-32 opacity-30">
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent rounded-full transform -skew-y-12" />
                    </div>
                    <div className="absolute -right-16 sm:-right-20 lg:-right-24 top-1/2 -translate-y-1/2 w-14 h-24 sm:w-20 sm:h-28 lg:w-24 lg:h-32 opacity-30">
                      <div className="w-full h-full bg-gradient-to-l from-transparent via-amber-400/20 to-transparent rounded-full transform skew-y-12" />
                    </div>

                    {/* Main emblem */}
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-full border-2 md:border-4 border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent flex items-center justify-center backdrop-blur-sm shadow-2xl">
                      {/* Inner glow */}
                      <div className="absolute inset-2 md:inset-3 rounded-full bg-gradient-to-br from-amber-400/10 to-transparent" />
                      
                      {/* Three theme icons arranged vertically like Garuda */}
                      <div className="relative flex flex-col items-center gap-2 md:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-blue-500/20 border-2 border-blue-400/40 flex items-center justify-center backdrop-blur-sm">
                          <Plane className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-300" />
                        </div>
                        <div className="flex gap-3 md:gap-5">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-18 lg:h-18 rounded-full bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center backdrop-blur-sm">
                            <Code2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 text-cyan-300" />
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-18 lg:h-18 rounded-full bg-green-500/20 border-2 border-green-400/40 flex items-center justify-center backdrop-blur-sm">
                            <Mountain className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 text-green-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Shield/banner below emblem */}
                  <div className="mt-4 sm:mt-5 md:mt-8 relative">
                    <div className="w-36 sm:w-44 md:w-64 lg:w-72 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-2 md:mb-3" />
                    <div className="text-center space-y-1">
                      <p className="text-amber-300/80 tracking-[0.15em] md:tracking-[0.25em] text-xs sm:text-sm md:text-lg lg:text-xl">{lanyardData.passportLabel}</p>
                      <p className="text-amber-400/60 tracking-[0.15em] md:tracking-[0.25em] text-[11px] sm:text-sm md:text-base lg:text-lg italic">{lanyardData.serviceType}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom: Logo symbol */}
                <div className="text-center pb-6 sm:pb-7">
                  <div className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-amber-400/30 bg-amber-500/5 backdrop-blur-sm hover:border-amber-400/50 hover:bg-amber-500/10 transition-all duration-300 group">
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300/80 group-hover:text-amber-300 group-hover:rotate-180 transition-all duration-500" />
                    <span className="text-xs sm:text-sm md:text-base text-amber-300/80 group-hover:text-amber-300 font-normal tracking-[0.15em] uppercase transition-colors duration-300">Click To Flip</span>
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
                <div className="grid grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <Globe className="w-10 h-10 text-blue-900" />
                      <Plane className="w-6 h-6 text-blue-900" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="relative w-full h-full px-5 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-6 lg:py-8 flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-5 pb-3 sm:pb-4 border-b-2 border-blue-900/20">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <Globe className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-blue-900" />
                    <h3 className="text-blue-900 text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.15em] font-semibold">{lanyardData.serviceName}</h3>
                    <Globe className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-blue-900" />
                  </div>
                  <p className="text-blue-800 text-xs sm:text-sm md:text-base lg:text-lg tracking-[0.2em]">{lanyardData.serviceType}</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <div className="w-12 h-px bg-blue-900/30" />
                    <p className="text-blue-700/60 text-xs sm:text-sm md:text-base">{lanyardData.passportLabel}</p>
                    <div className="w-12 h-px bg-blue-900/30" />
                  </div>
                </div>

                {/* Photo and Personal Info Section - Side by side layout */}
                <div className="flex flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-6">
                  {/* Photo - Portrait (Left side) */}
                  <div className="flex-shrink-0 w-40 h-56 sm:w-40 sm:h-56 md:w-48 md:h-72 lg:w-64 lg:h-96">
                    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded border-2 border-slate-300 overflow-hidden shadow-lg">
                      {lanyardData.avatarUrl ? (
                        <img src={lanyardData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                          <User className="w-16 h-16 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-slate-500" />
                        </div>
                      )}
                      
                    </div>
                  </div>

                  {/* Personal Info - Main Details (Right side) */}
                  <div className="flex-1 space-y-3.5 sm:space-y-5 md:space-y-3.5">
                    {/* Country Code */}
                    <div>
                      <p className="text-blue-900/50 text-[11px] sm:text-xs md:text-sm uppercase mb-1.5 tracking-wider">COUNTRY CODE</p>
                      <p className="text-blue-900 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">{lanyardData.countryCode}</p>
                    </div>

                    {/* Passport No */}
                    <div>
                      <p className="text-blue-900/50 text-[11px] sm:text-xs md:text-sm uppercase mb-1.5 tracking-wider">PASSPORT NO.</p>
                      <p className="text-blue-900 font-mono text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">{lanyardData.passportNo}</p>
                    </div>

                    {/* Surname */}
                    <div>
                      <p className="text-blue-900/50 text-[11px] sm:text-xs md:text-sm uppercase mb-1.5 tracking-wider">SURNAME/NAMA BELAKANG</p>
                      <p className="text-blue-900 uppercase text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">{lanyardData.surname}</p>
                    </div>

                    {/* Given Names */}
                    <div>
                      <p className="text-blue-900/50 text-[11px] sm:text-xs md:text-sm uppercase mb-1.5 tracking-wider">GIVEN NAMES/NAMA DEPAN</p>
                      <p className="text-blue-900 uppercase text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">{lanyardData.givenNames}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-5 sm:gap-y-6 mb-4 border-t-2 border-blue-900/10 pt-6">
                  {/* Nationality */}
                  <div>
                    <p className="text-blue-900/50 text-xs sm:text-sm md:text-base uppercase mb-1 tracking-wider">NATIONALITY</p>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 md:w-6 md:h-6 text-blue-700" />
                      <p className="text-blue-900 text-base sm:text-lg md:text-xl lg:text-2xl font-medium">{lanyardData.nationality}</p>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <p className="text-blue-900/50 text-xs sm:text-sm md:text-base uppercase mb-1 tracking-wider">DATE OF BIRTH</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-700" />
                      <p className="text-blue-900 text-base sm:text-lg md:text-xl lg:text-2xl font-medium">{lanyardData.dateOfBirth}</p>
                    </div>
                  </div>

                  {/* Place of Birth */}
                  <div>
                    <p className="text-blue-900/50 text-xs sm:text-sm md:text-base uppercase mb-1 tracking-wider">PLACE OF BIRTH</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-700" />
                      <p className="text-blue-900 text-base sm:text-lg md:text-xl lg:text-2xl font-medium">{lanyardData.placeOfBirth}</p>
                    </div>
                  </div>

                  {/* Sex */}
                  <div>
                    <p className="text-blue-900/50 text-xs sm:text-sm md:text-base uppercase mb-1 tracking-wider">SEX/JENIS KELAMIN</p>
                    <p className="text-blue-900 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">{lanyardData.sex} / {lanyardData.sex === 'M' ? 'L' : 'P'}</p>
                  </div>

                  {/* Date of Issue */}
                  <div>
                    <p className="text-blue-900/50 text-xs sm:text-sm md:text-base uppercase mb-1 tracking-wider">DATE OF ISSUE</p>
                    <p className="text-blue-900 text-base sm:text-lg md:text-xl lg:text-2xl font-medium">{lanyardData.dateOfIssue}</p>
                  </div>

                  {/* Date of Expiry */}
                  <div>
                    <p className="text-blue-900/50 text-xs sm:text-sm md:text-base uppercase mb-1 tracking-wider">DATE OF EXPIRY</p>
                    <p className="text-red-700 text-base sm:text-lg md:text-xl lg:text-2xl font-bold">{lanyardData.dateOfExpiry}</p>
                  </div>
                </div>

                {/* Signature */}
                <div className="border-t-2 border-blue-900/10 pt-6 px-2">
                  <p className="text-blue-900/50 text-xs sm:text-sm md:text-base uppercase mb-3 tracking-wider">HOLDER'S SIGNATURE/TANDA TANGAN</p>
                  <div className="h-20 sm:h-24 md:h-28 lg:h-32 border-b-2 border-blue-900/20 flex items-end pb-0 pt-1 sm:pt-1.5 mt-8 sm:mt-10 md:mt-12">
                    <p className="text-blue-900/80 font-thin tracking-wide leading-none -rotate-3 origin-bottom transition-transform hover:rotate-0 whitespace-nowrap translate-y-[1px]" style={{ fontFamily: 'var(--font-dancing-script), cursive', fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
                      {(lanyardData.givenNames || '').toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
              </motion.div>
            </div>
          </div>
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
            <div className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-8">
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
                <h3 className="text-white/60 tracking-[0.3em] uppercase text-[11px] sm:text-xs md:text-sm">Philosophy</h3>
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
                <p className="text-white/90 text-base sm:text-lg md:text-2xl leading-relaxed max-w-3xl italic">
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
