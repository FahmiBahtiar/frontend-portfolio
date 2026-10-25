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
  RefreshCw 
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
  const [flipState, setFlipState] = useState<'initial' | 'to-back' | 'to-front'>('initial');
  const [isFlipped, setIsFlipped] = useState(false);
  const isFlipping = flipState === 'to-back' || flipState === 'to-front';
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
    const maxTilt = 8; // degrees
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

  const toggleFlip = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isFlipped) {
      setFlipState('to-back');
      setIsFlipped(true);
    } else {
      setFlipState('to-front');
      setIsFlipped(false);
    }
  }, [isFlipped]);

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
            <p className="text-[#0c282d] font-bold mb-4">Unable to load passport data</p>
            <p className="text-[#527d85] text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Passport Card Section with 3D Flip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mb-6 md:mb-10 w-full flex flex-col items-center"
      >
        {/* 3D Perspective Scene */}
        <div
          ref={cardRef}
          className="w-full flex items-center justify-center cursor-pointer select-none"
          style={{ perspective: '1800px' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => toggleFlip()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleFlip();
            }
          }}
          aria-pressed={isFlipped}
          aria-label="Click to flip passport card"
        >
          {/* Tilt Frame - Responsive Proportions */}
          <div
            className="relative w-full max-w-[380px] xs:max-w-[420px] sm:max-w-[480px] md:max-w-[600px] lg:max-w-[900px]"
            style={{
              transform: isFlipping
                ? 'rotateX(0deg) rotateY(0deg)'
                : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transition: isFlipping
                ? 'transform 0.4s ease-out'
                : isHovering ? 'transform 0.1s ease-out, box-shadow 0.1s ease-out' : 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              boxShadow: isHovering
                ? `${-tilt.rotateY * 2}px ${tilt.rotateX * 2}px 40px rgba(111,212,225,0.25), 0 20px 60px rgba(12,40,45,0.1)`
                : '0 10px 30px rgba(12,40,45,0.06)',
            }}
          >
            {/* Aspect Ratio Box: taller on mobile (162%) so all biographical fields & signature fit comfortably without clipping */}
            <div 
              className="relative w-full pt-[162%] sm:pt-[140%]" 
              style={{ 
                transformStyle: 'preserve-3d', 
                WebkitTransformStyle: 'preserve-3d',
                perspective: '2200px',
              }}
            >
              {/* Hardware-Accelerated 3D Flip Card */}
              <div 
                className={`absolute inset-0 w-full h-full passport-flipper allow-motion ${
                  flipState === 'to-back'
                    ? 'passport-flip-to-back'
                    : flipState === 'to-front'
                    ? 'passport-flip-to-front'
                    : ''
                }`}
                style={{
                  transform: isFlipped 
                    ? 'perspective(2200px) rotateY(180deg)' 
                    : 'perspective(2200px) rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                }}
              >
                {/* ======================================================== */}
                {/* FRONT SIDE - PASSPORT COVER (ARCTIC ICE)                  */}
                {/* ======================================================== */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-2xl shadow-xl border-4 border-[#6FD4E1]/50 passport-flipper allow-motion"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                  }}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#E2F4F3] to-[#B9E7E6] p-4 sm:p-8 md:p-12 flex flex-col items-center justify-between">
                    {/* 3D Glare overlay */}
                    <div
                      className="absolute inset-0 z-20 pointer-events-none rounded-2xl transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.45) 0%, transparent 60%)`,
                        opacity: isHovering ? 1 : 0,
                      }}
                    />

                    {/* Top: Country Name */}
                    <div className="text-center space-y-1.5 sm:space-y-2 z-10">
                      <h2 className="text-[#0c282d] font-bold tracking-[0.18em] sm:tracking-[0.25em] md:tracking-[0.35em] lg:tracking-[0.4em] text-xs sm:text-base md:text-2xl lg:text-3xl uppercase">
                        {lanyardData.serviceName || 'BLIMBING PORTFOLIO'}
                      </h2>
                    </div>

                    {/* Center: Garuda-style emblem */}
                    <div className="flex flex-col items-center justify-center flex-1 -mt-2 sm:-mt-6 md:-mt-8 z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.02, 1],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                      >
                        {/* Wings spread effect */}
                        <div className="absolute -left-12 sm:-left-20 lg:-left-24 top-1/2 -translate-y-1/2 w-10 h-20 sm:w-20 sm:h-28 lg:w-24 lg:h-32 opacity-25">
                          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#6FD4E1]/40 to-transparent rounded-full transform -skew-y-12" />
                        </div>
                        <div className="absolute -right-12 sm:-right-20 lg:-right-24 top-1/2 -translate-y-1/2 w-10 h-20 sm:w-20 sm:h-28 lg:w-24 lg:h-32 opacity-25">
                          <div className="w-full h-full bg-gradient-to-l from-transparent via-[#6FD4E1]/40 to-transparent rounded-full transform skew-y-12" />
                        </div>

                        {/* Main emblem */}
                        <div className="relative w-24 h-24 sm:w-36 sm:h-36 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-full border-2 md:border-4 border-[#6FD4E1] bg-white/80 flex items-center justify-center backdrop-blur-sm shadow-md">
                          <div className="absolute inset-1.5 md:inset-3 rounded-full bg-gradient-to-br from-[#6FD4E1]/15 to-transparent" />
                          
                          <div className="relative flex flex-col items-center gap-1.5 sm:gap-2 md:gap-4 z-10">
                            <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-[#E2F4F3] border-2 border-[#6FD4E1] flex items-center justify-center backdrop-blur-sm shadow-sm">
                              <Plane className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-[#0891b2]" />
                            </div>
                            <div className="flex gap-2 sm:gap-3 md:gap-5">
                              <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-18 lg:h-18 rounded-full bg-[#E2F4F3] border-2 border-[#6FD4E1] flex items-center justify-center backdrop-blur-sm shadow-sm">
                                <Code2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 text-[#0891b2]" />
                              </div>
                              <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-18 lg:h-18 rounded-full bg-[#E2F4F3] border-2 border-[#6FD4E1] flex items-center justify-center backdrop-blur-sm shadow-sm">
                                <Mountain className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-7 md:h-7 lg:w-9 lg:h-9 text-[#0891b2]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Shield/banner below emblem */}
                      <div className="mt-3 sm:mt-5 md:mt-8 relative text-center space-y-0.5 sm:space-y-1">
                        <div className="w-28 sm:w-44 md:w-64 lg:w-72 h-0.5 bg-gradient-to-r from-transparent via-[#6FD4E1]/50 to-transparent mx-auto mb-1.5 md:mb-3" />
                        <p className="text-[#0c282d] text-[11px] sm:text-sm md:text-base font-bold tracking-wider uppercase">
                          {lanyardData.passportLabel || 'SERVICE PASSPORT'}
                        </p>
                        <p className="text-[#2d5f68] text-[10px] sm:text-xs md:text-sm tracking-wide font-medium">
                          {lanyardData.serviceType || '— PRIVATE PASSPORT —'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Click to Flip */}
                    <div className="text-center pb-3 sm:pb-7 z-10">
                      <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-xl border border-[#6FD4E1] bg-white text-[#0c282d] shadow-sm hover:bg-[#6FD4E1]/20 transition-all duration-300 group">
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-[#0891b2] group-hover:rotate-180 transition-all duration-500" />
                        <span className="text-[11px] sm:text-sm md:text-base text-[#0c282d] font-semibold tracking-[0.12em] sm:tracking-[0.15em] uppercase">
                          Click To Flip
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* BACK SIDE - PASSPORT BIOGRAPHICAL DATA PAGE (ARCTIC ICE) */}
                {/* ======================================================== */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl border-4 border-[#B9E7E6] passport-flipper allow-motion"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#F4FBFB] to-[#E2F4F3] px-3 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-3.5 md:py-4 lg:py-5 flex flex-col justify-between">
                    {/* Watermark background pattern */}
                    <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
                      <div className="grid grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <Globe className="w-10 h-10 text-[#0891b2]" />
                            <Plane className="w-6 h-6 text-[#0891b2]" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-1 sm:mb-3 pb-1 sm:pb-3 border-b-2 border-[#B9E7E6]/70 z-10">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5 sm:mb-1">
                        <Globe className="w-3.5 h-3.5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-[#0891b2]" />
                        <h3 className="text-[#0c282d] text-[11px] sm:text-base md:text-lg lg:text-xl tracking-[0.12em] sm:tracking-[0.15em] font-bold uppercase">
                          {lanyardData.serviceName || 'BLIMBING PORTFOLIO'}
                        </h3>
                        <Globe className="w-3.5 h-3.5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-[#0891b2]" />
                      </div>
                      <p className="text-[#527d85] text-[9px] sm:text-xs md:text-sm lg:text-base tracking-[0.15em] sm:tracking-[0.2em] font-mono font-bold uppercase">
                        {lanyardData.serviceType || 'SERVICE PASSPORT'}
                      </p>
                      <div className="mt-0.5 sm:mt-1 flex items-center justify-center gap-2">
                        <div className="w-6 sm:w-8 h-px bg-[#B9E7E6]" />
                        <p className="text-[#0891b2] text-[9px] sm:text-xs md:text-sm font-semibold tracking-wider">
                          {lanyardData.passportLabel || '— PRIVATE PASSPORT —'}
                        </p>
                        <div className="w-6 sm:w-8 h-px bg-[#B9E7E6]" />
                      </div>
                    </div>

                    {/* Photo and Personal Info Section (Responsive on Mobile) */}
                    <div className="flex flex-row gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 mb-1.5 sm:mb-3 md:mb-4 z-10">
                      {/* Photo - Portrait */}
                      <div className="flex-shrink-0 w-24 h-32 sm:w-32 sm:h-44 md:w-36 md:h-52 lg:w-48 lg:h-72">
                        <div className="relative w-full h-full bg-[#E2F4F3] rounded-xl border-2 border-[#B9E7E6] overflow-hidden shadow-md">
                          {lanyardData.avatarUrl ? (
                            <Image
                              src={lanyardData.avatarUrl}
                              alt="Avatar"
                              fill
                              sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 144px, 192px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#E2F4F3]">
                              <User className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-[#527d85]" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Personal Info - Key Fields */}
                      <div className="flex-1 flex flex-col justify-between py-0.5 sm:py-2">
                        {/* Country Code */}
                        <div>
                          <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 tracking-wider font-mono font-bold">
                            COUNTRY CODE
                          </p>
                          <p className="text-[#0c282d] text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide">
                            {lanyardData.countryCode || 'IDN'}
                          </p>
                        </div>

                        {/* Passport No */}
                        <div>
                          <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 tracking-wider font-mono font-bold">
                            PASSPORT NO.
                          </p>
                          <p className="text-[#0891b2] font-mono text-xs sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide">
                            {lanyardData.passportNo || 'FHM20253333'}
                          </p>
                        </div>

                        {/* Surname */}
                        <div>
                          <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 tracking-wider font-mono font-bold">
                            SURNAME/NAMA BELAKANG
                          </p>
                          <p className="text-[#0c282d] uppercase text-xs sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide">
                            {lanyardData.surname || 'ADI NUGROHO'}
                          </p>
                        </div>

                        {/* Given Names */}
                        <div>
                          <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 tracking-wider font-mono font-bold">
                            GIVEN NAMES/NAMA DEPAN
                          </p>
                          <p className="text-[#0c282d] uppercase text-xs sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide">
                            {lanyardData.givenNames || 'FAHMI BAHTIAR'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details Grid (Responsive Layout) */}
                    <div className="grid grid-cols-2 gap-x-2.5 sm:gap-x-4 md:gap-x-6 gap-y-1 sm:gap-y-3 md:gap-y-4 mb-1 sm:mb-2 border-t-2 border-[#B9E7E6]/70 pt-1.5 sm:pt-4 md:pt-5 z-10">
                      {/* Nationality */}
                      <div>
                        <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 sm:mb-1 tracking-wider font-mono font-bold">
                          NATIONALITY
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#0891b2]" />
                          <p className="text-[#0c282d] text-xs sm:text-base md:text-lg lg:text-xl font-bold">
                            {lanyardData.nationality || 'Indonesia'}
                          </p>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 sm:mb-1 tracking-wider font-mono font-bold">
                          DATE OF BIRTH
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#0891b2]" />
                          <p className="text-[#0c282d] text-xs sm:text-base md:text-lg lg:text-xl font-bold">
                            {lanyardData.dateOfBirth || 'Secret'}
                          </p>
                        </div>
                      </div>

                      {/* Place of Birth */}
                      <div>
                        <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 sm:mb-1 tracking-wider font-mono font-bold">
                          PLACE OF BIRTH
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#0891b2]" />
                          <p className="text-[#0c282d] text-xs sm:text-base md:text-lg lg:text-xl font-bold">
                            {lanyardData.placeOfBirth || 'Demak, Indonesia'}
                          </p>
                        </div>
                      </div>

                      {/* Sex */}
                      <div>
                        <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 sm:mb-1 tracking-wider font-mono font-bold">
                          SEX/JENIS KELAMIN
                        </p>
                        <p className="text-[#0c282d] text-xs sm:text-base md:text-lg lg:text-xl font-black tracking-wide">
                          {lanyardData.sex || 'M'} / {(lanyardData.sex === 'M' || !lanyardData.sex) ? 'L' : 'P'}
                        </p>
                      </div>

                      {/* Date of Issue */}
                      <div>
                        <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 sm:mb-1 tracking-wider font-mono font-bold">
                          DATE OF ISSUE
                        </p>
                        <p className="text-[#0c282d] text-xs sm:text-base md:text-lg lg:text-xl font-bold">
                          {lanyardData.dateOfIssue || '01 OCT 2025'}
                        </p>
                      </div>

                      {/* Date of Expiry */}
                      <div>
                        <p className="text-[#527d85] text-[8px] sm:text-[11px] md:text-xs lg:text-sm uppercase mb-0.5 sm:mb-1 tracking-wider font-mono font-bold">
                          DATE OF EXPIRY
                        </p>
                        <p className="text-rose-600 text-xs sm:text-base md:text-lg lg:text-xl font-black">
                          {lanyardData.dateOfExpiry || 'Nuclear War'}
                        </p>
                      </div>
                    </div>

                    {/* Signature Section (Authentic Layout with Guaranteed Mobile Visibility) */}
                    <div className="flex-1 flex flex-col border-t-2 border-[#B9E7E6]/70 pt-1.5 sm:pt-3 md:pt-5 px-0.5 sm:px-1 mt-auto z-10">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <p className="text-[#527d85] text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wider font-mono font-bold">
                          HOLDER&apos;S SIGNATURE/TANDA TANGAN
                        </p>
                        <span className="text-[9px] sm:text-[10px] font-mono text-[#0891b2] font-semibold flex items-center gap-1 opacity-70">
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Click to flip</span>
                        </span>
                      </div>
                      <div className="flex-1 border-b-2 border-[#B9E7E6] flex items-end pb-0.5 sm:pb-1 min-h-[2.4rem] sm:min-h-[3.5rem] md:min-h-[4rem] lg:min-h-[5rem]">
                        <p 
                          className="text-[#0c282d] font-thin tracking-wide leading-none -rotate-3 origin-bottom transition-transform hover:rotate-0 whitespace-nowrap translate-y-[1px]" 
                          style={{ 
                            fontFamily: 'var(--font-dancing-script), cursive', 
                            fontSize: 'clamp(1.35rem, 4vw, 4rem)' 
                          }}
                        >
                          {(lanyardData.givenNames || 'fahmi bahtiar').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="relative p-8 md:p-12 rounded-3xl bg-white/95 border border-[#B9E7E6] shadow-sm overflow-hidden">
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
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#6FD4E1]/40 rounded-tl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#6FD4E1]/40 rounded-br-3xl pointer-events-none" />

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
                  className="h-px w-12 bg-[#B9E7E6]"
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                />
                <h3 className="text-[#527d85] font-mono font-bold tracking-[0.3em] uppercase text-[11px] sm:text-xs md:text-sm">Philosophy</h3>
                <motion.div
                  className="h-px w-12 bg-[#B9E7E6]"
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
                className="w-32 h-px bg-[#B9E7E6] mt-6"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
