'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { 
  Code2, 
  Calendar, 
  MapPin, 
  User, 
  Globe, 
  Plane, 
  Mountain, 
  Loader2, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

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

  // 3D tilt effect state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 7; // degrees
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = ((centerY - y) / centerY) * maxTilt;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setTilt({ rotateX, rotateY, glareX, glareY });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  }, []);

  const handleCardFlip = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsFlipped((prev) => !prev);
  }, []);

  useEffect(() => {
    const API_BASE = API_BASE_URL;
    const fetchLanyardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/api/about/lanyard`);
        if (!response.ok) {
          throw new Error('Failed to fetch lanyard data');
        }
        const result = await response.json();
        if (result.success && result.data) {
          if (Array.isArray(result.data)) {
            const raw = result.data[0] || null;
            if (raw) {
              setLanyardData(raw as LanyardData);
            } else {
              setLanyardData(null);
            }
          } else {
            setLanyardData(result.data as LanyardData);
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
          <div className="flex items-center gap-3 text-[#0c282d] font-bold font-mono">
            <Loader2 className="w-6 h-6 animate-spin text-[#0891b2]" />
            <span>Loading passport telemetry...</span>
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
            <p className="text-[#0c282d] font-bold mb-4">Unable to load passport data</p>
            <p className="text-[#527d85] text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-8 md:py-12 px-4 md:px-8">
      {/* Passport Card with 3D Flip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mb-6 md:mb-10 w-full flex flex-col items-center"
      >
        {/* 3D Perspective Outer Container */}
        <div
          ref={cardRef}
          className="w-full flex items-center justify-center select-none"
          style={{ perspective: '1600px' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Tilt Frame */}
          <div
            className="relative w-full max-w-[420px] sm:max-w-[440px] md:max-w-[600px] lg:max-w-[700px]"
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transition: isHovering ? 'transform 0.1s ease-out, box-shadow 0.1s ease-out' : 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              boxShadow: isHovering
                ? `${-tilt.rotateY * 2}px ${tilt.rotateX * 2}px 36px rgba(111,212,225,0.22), 0 20px 50px rgba(12,40,45,0.08)`
                : '0 10px 30px rgba(12,40,45,0.06)',
            }}
          >
            {/* Aspect Ratio Box with preserve-3d preserved */}
            <div 
              className="relative w-full" 
              style={{ 
                paddingTop: '142%', 
                transformStyle: 'preserve-3d', 
                WebkitTransformStyle: 'preserve-3d' 
              }}
            >
              {/* Flippable 3D Card Driver */}
              <motion.div 
                className="absolute inset-0 w-full h-full cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                }}
                animate={{
                  rotateY: isFlipped ? 180 : 0,
                }}
                transition={{
                  duration: 0.75,
                  ease: [0.34, 1.4, 0.64, 1], // Lively tactile 3D card flip
                }}
                onClick={() => handleCardFlip()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardFlip();
                  }
                }}
                aria-pressed={isFlipped}
                aria-label="Flip passport card"
              >
                {/* ======================================================== */}
                {/* FRONT SIDE - ARCTIC ICE PASSPORT COVER                   */}
                {/* ======================================================== */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-3xl border-2 sm:border-4 border-[#6FD4E1] shadow-xl bg-white"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                    zIndex: isFlipped ? 0 : 2,
                  }}
                >
                  <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#F4FBFB] to-[#E2F4F3] p-5 sm:p-8 md:p-12 flex flex-col items-center justify-between">
                    {/* Glare overlay */}
                    <div
                      className="absolute inset-0 z-20 pointer-events-none rounded-3xl transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
                        opacity: isHovering ? 1 : 0,
                      }}
                    />

                    {/* Top: Service Name */}
                    <div className="text-center space-y-1.5 z-10">
                      <div className="flex items-center justify-center gap-2 text-[#0891b2] mb-1">
                        <Globe className="w-4 h-4 text-[#0891b2]" />
                        <span className="text-[10px] font-mono tracking-[0.3em] font-extrabold uppercase">BIOMETRIC IDENTITY</span>
                        <Globe className="w-4 h-4 text-[#0891b2]" />
                      </div>
                      <h2 className="text-[#0c282d] font-black tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.35em] text-base sm:text-xl md:text-2xl lg:text-3xl uppercase">
                        {lanyardData.serviceName || 'BLIMBING PORTFOLIO'}
                      </h2>
                    </div>

                    {/* Center: Garuda-Inspired Emblem in Arctic Ice */}
                    <div className="flex flex-col items-center justify-center flex-1 my-4 z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.025, 1],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                      >
                        {/* Wings light aura */}
                        <div className="absolute -left-16 sm:-left-20 top-1/2 -translate-y-1/2 w-16 h-28 opacity-40">
                          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#6FD4E1]/40 to-transparent rounded-full transform -skew-y-12" />
                        </div>
                        <div className="absolute -right-16 sm:-right-20 top-1/2 -translate-y-1/2 w-16 h-28 opacity-40">
                          <div className="w-full h-full bg-gradient-to-l from-transparent via-[#6FD4E1]/40 to-transparent rounded-full transform skew-y-12" />
                        </div>

                        {/* Main emblem disc */}
                        <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full border-2 md:border-4 border-[#6FD4E1] bg-white/90 flex items-center justify-center backdrop-blur-sm shadow-[0_4px_24px_rgba(111,212,225,0.25)]">
                          <div className="absolute inset-2 md:inset-3 rounded-full bg-gradient-to-br from-[#E2F4F3] to-[#FFFFFF] border border-[#B9E7E6]" />
                          
                          {/* 3 Icons: Plane, Code, Mountain */}
                          <div className="relative flex flex-col items-center gap-2 md:gap-3 z-10">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-[#6FD4E1] flex items-center justify-center shadow-sm">
                              <Plane className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#0891b2]" />
                            </div>
                            <div className="flex gap-2.5 sm:gap-4">
                              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-[#6FD4E1] flex items-center justify-center shadow-sm">
                                <Code2 className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#0891b2]" />
                              </div>
                              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-[#6FD4E1] flex items-center justify-center shadow-sm">
                                <Mountain className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#0891b2]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Shield banner below emblem */}
                      <div className="mt-4 sm:mt-6 text-center space-y-1">
                        <div className="w-36 sm:w-48 h-0.5 bg-gradient-to-r from-transparent via-[#6FD4E1] to-transparent mx-auto mb-2" />
                        <p className="text-[#0c282d] text-xs sm:text-sm md:text-base font-extrabold tracking-wider uppercase">
                          {lanyardData.passportLabel || 'SERVICE PASSPORT'}
                        </p>
                        <p className="text-[#527d85] text-[11px] sm:text-xs font-mono tracking-widest uppercase">
                          {lanyardData.serviceType || '— PRIVATE PASSPORT —'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Click to Flip Action Button */}
                    <div className="text-center z-10 pt-2">
                      <div 
                        onClick={(e) => handleCardFlip(e)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#6FD4E1] bg-white text-[#0c282d] shadow-sm hover:bg-[#6FD4E1] hover:text-[#0c282d] transition-all duration-300 group"
                      >
                        <RefreshCw className="w-4 h-4 text-[#0891b2] group-hover:rotate-180 transition-all duration-500" />
                        <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.15em] uppercase">
                          Click To Open Data Page
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* BACK SIDE - ARCTIC ICE PASSPORT BIOGRAPHICAL DATA PAGE  */}
                {/* ======================================================== */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-3xl border-2 sm:border-4 border-[#B9E7E6] shadow-xl bg-white"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    zIndex: isFlipped ? 2 : 0,
                  }}
                >
                  <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#F4FBFB] to-[#E2F4F3] px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 flex flex-col justify-between">
                    {/* Faint Guilloche Security Watermark Pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
                      <div className="grid grid-cols-4 gap-6 p-4">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <Globe className="w-8 h-8 text-[#0891b2]" />
                            <Plane className="w-6 h-6 text-[#0891b2]" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-2 pb-2 border-b-2 border-[#B9E7E6]">
                      <div className="flex items-center justify-center gap-2 mb-0.5">
                        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0891b2]" />
                        <h3 className="text-[#0c282d] text-xs sm:text-sm md:text-base tracking-[0.2em] font-black uppercase">
                          {lanyardData.serviceName || 'BLIMBING PORTFOLIO'}
                        </h3>
                        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0891b2]" />
                      </div>
                      <p className="text-[#527d85] text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase font-bold">
                        {lanyardData.serviceType || 'SERVICE PASSPORT'}
                      </p>
                      <div className="mt-1 flex items-center justify-center gap-2">
                        <div className="w-8 h-px bg-[#B9E7E6]" />
                        <p className="text-[#0891b2] text-[9px] sm:text-[10px] font-mono tracking-wider font-semibold">
                          {lanyardData.passportLabel || '— PRIVATE PASSPORT —'}
                        </p>
                        <div className="w-8 h-px bg-[#B9E7E6]" />
                      </div>
                    </div>

                    {/* Photo and Personal Info Section (Side by Side) */}
                    <div className="flex flex-row gap-3 sm:gap-4 md:gap-5 mb-2.5">
                      {/* Photo - Portrait */}
                      <div className="flex-shrink-0 w-24 h-32 sm:w-28 sm:h-38 md:w-36 md:h-48 relative">
                        <div className="relative w-full h-full bg-[#E2F4F3] rounded-xl border-2 border-[#B9E7E6] overflow-hidden shadow-sm">
                          {lanyardData.avatarUrl ? (
                            <Image
                              src={lanyardData.avatarUrl}
                              alt="Avatar"
                              fill
                              sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 144px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#E2F4F3]">
                              <User className="w-10 h-10 text-[#527d85]" />
                            </div>
                          )}
                          {/* Hologram security overlay icon */}
                          <div className="absolute top-1.5 right-1.5 bg-white/80 backdrop-blur-xs p-1 rounded-md border border-[#B9E7E6] shadow-2xs">
                            <ShieldCheck className="w-3 h-3 text-[#0891b2]" />
                          </div>
                        </div>
                      </div>

                      {/* Personal Info - Key Fields */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        {/* Country Code */}
                        <div>
                          <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                            COUNTRY CODE
                          </p>
                          <p className="text-[#0c282d] text-sm sm:text-base md:text-lg font-black tracking-wide">
                            {lanyardData.countryCode || 'IDN'}
                          </p>
                        </div>

                        {/* Passport No */}
                        <div>
                          <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                            PASSPORT NO.
                          </p>
                          <p className="text-[#0891b2] font-mono text-sm sm:text-base md:text-lg font-black tracking-wider">
                            {lanyardData.passportNo || 'FHM20253333'}
                          </p>
                        </div>

                        {/* Surname */}
                        <div>
                          <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                            SURNAME/NAMA BELAKANG
                          </p>
                          <p className="text-[#0c282d] uppercase text-sm sm:text-base md:text-lg font-black tracking-wide">
                            {lanyardData.surname || 'ADI NUGROHO'}
                          </p>
                        </div>

                        {/* Given Names */}
                        <div>
                          <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                            GIVEN NAMES/NAMA DEPAN
                          </p>
                          <p className="text-[#0c282d] uppercase text-sm sm:text-base md:text-lg font-black tracking-wide">
                            {lanyardData.givenNames || 'FAHMI BAHTIAR'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details Grid */}
                    <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 border-t-2 border-[#B9E7E6]/60 pt-2.5">
                      {/* Nationality */}
                      <div>
                        <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                          NATIONALITY
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Globe className="w-3.5 h-3.5 text-[#0891b2]" />
                          <p className="text-[#0c282d] text-xs sm:text-sm md:text-base font-extrabold truncate">
                            {lanyardData.nationality || 'Indonesia'}
                          </p>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                          DATE OF BIRTH
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0891b2]" />
                          <p className="text-[#0c282d] text-xs sm:text-sm md:text-base font-extrabold truncate">
                            {lanyardData.dateOfBirth || 'Secret'}
                          </p>
                        </div>
                      </div>

                      {/* Place of Birth */}
                      <div>
                        <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                          PLACE OF BIRTH
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0891b2]" />
                          <p className="text-[#0c282d] text-xs sm:text-sm md:text-base font-extrabold truncate">
                            {lanyardData.placeOfBirth || 'Demak, Indonesia'}
                          </p>
                        </div>
                      </div>

                      {/* Sex */}
                      <div>
                        <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                          SEX/JENIS KELAMIN
                        </p>
                        <p className="text-[#0c282d] text-xs sm:text-sm md:text-base font-black tracking-wide mt-0.5">
                          {lanyardData.sex || 'M'} / {(lanyardData.sex === 'M' || !lanyardData.sex) ? 'L' : 'P'}
                        </p>
                      </div>

                      {/* Date of Issue */}
                      <div>
                        <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                          DATE OF ISSUE
                        </p>
                        <p className="text-[#0c282d] text-xs sm:text-sm md:text-base font-extrabold mt-0.5">
                          {lanyardData.dateOfIssue || '01 OCT 2025'}
                        </p>
                      </div>

                      {/* Date of Expiry */}
                      <div>
                        <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                          DATE OF EXPIRY
                        </p>
                        <p className="text-rose-600 text-xs sm:text-sm md:text-base font-black mt-0.5">
                          {lanyardData.dateOfExpiry || 'Nuclear War'}
                        </p>
                      </div>
                    </div>

                    {/* Signature Section */}
                    <div className="flex flex-col border-t-2 border-[#B9E7E6]/60 pt-2 px-1">
                      <p className="text-[#527d85] text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider">
                        HOLDER&apos;S SIGNATURE/TANDA TANGAN
                      </p>
                      <div className="border-b-2 border-[#B9E7E6] flex items-end pb-0.5 min-h-[2.5rem] sm:min-h-[3rem]">
                        <p 
                          className="text-[#0c282d] font-thin tracking-wide leading-none -rotate-2 origin-bottom whitespace-nowrap" 
                          style={{ 
                            fontFamily: 'var(--font-dancing-script), cursive', 
                            fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)' 
                          }}
                        >
                          {(lanyardData.givenNames || 'fahmi bahtiar').toLowerCase()}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Flip Button - Return to Cover */}
                    <div className="text-center pt-2">
                      <div 
                        onClick={(e) => handleCardFlip(e)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#B9E7E6] bg-white text-[#0c282d] shadow-sm hover:border-[#6FD4E1] hover:text-[#0891b2] transition-all duration-300 group"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#0891b2] group-hover:rotate-180 transition-all duration-500" />
                        <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.15em] uppercase">
                          Flip To Passport Cover
                        </span>
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
          <div className="relative p-6 sm:p-8 md:p-12 rounded-3xl bg-white/95 border border-[#B9E7E6] shadow-sm overflow-hidden">
            {/* Animated subtle gradient background */}
            <motion.div
              className="absolute inset-0 opacity-20 pointer-events-none"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(111, 212, 225, 0.25) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(185, 231, 230, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 80%, rgba(111, 212, 225, 0.2) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(111, 212, 225, 0.25) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#6FD4E1]/40 rounded-tl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#6FD4E1]/40 rounded-br-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-5 sm:space-y-6">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  className="h-px w-10 sm:w-12 bg-[#B9E7E6]"
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                />
                <h3 className="text-[#527d85] font-mono font-bold tracking-[0.3em] uppercase text-[11px] sm:text-xs md:text-sm">Philosophy</h3>
                <motion.div
                  className="h-px w-10 sm:w-12 bg-[#B9E7E6]"
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
                className="space-y-3"
              >
                <p className="text-[#0c282d] text-base sm:text-lg md:text-2xl leading-relaxed max-w-3xl italic font-semibold">
                  &quot;Code like a <span className="text-[#0891b2] not-italic font-bold">developer</span>,
                  think like a <span className="text-[#0891b2] not-italic font-bold">pilot</span>,
                  persevere like a <span className="text-[#0891b2] not-italic font-bold">mountaineer</span>.
                  Every challenge is just another peak to conquer.&quot;
                </p>
              </motion.div>

              {/* Signature line */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="w-28 sm:w-32 h-px bg-[#B9E7E6] mt-4"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
