'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { GraduationCap, Award, Code2, Plane, Mountain, Trophy, Star, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Education } from '@/lib/types/admin';

interface AltitudeTimelineProps {
  educationRecords?: Education[];
}

interface TimelinePoint {
  id: string;
  year: string;
  month: number; // 1-12 for positioning
  altitude: number; // 0-100 (percentage)
  title: string;
  subtitle: string;
  institution: string;
  level: 'elementary' | 'junior' | 'senior' | 'university';
  icon: any;
  badge?: string;
  description?: string;
  gpa?: string;
}

// Education Journey Timeline - 4 Levels
const defaultTimelineData: TimelinePoint[] = [
  // Elementary School
  { 
    id: '1', 
    year: '2006-2012', 
    month: 6, 
    altitude: 20, 
    title: 'Elementary School', 
    subtitle: 'Foundation Building', 
    institution: 'SD Negeri 1 Jakarta',
    level: 'elementary',
    icon: GraduationCap, 
    badge: 'Base Camp', 
    description: 'Building strong academic foundation and character development. Active in mathematics and science clubs.',
    gpa: 'Top 10 Student',
  },
  
  // Junior High School
  { 
    id: '2', 
    year: '2012-2015', 
    month: 6, 
    altitude: 45, 
    title: 'Junior High School', 
    subtitle: 'Academic Excellence', 
    institution: 'SMP Negeri 5 Jakarta',
    level: 'junior',
    icon: Award, 
    badge: 'Camp 1', 
    description: 'National Science Olympiad participant. Started programming journey with basic algorithms.',
    gpa: '9.2 / 10',
  },
  
  // Senior High School
  { 
    id: '3', 
    year: '2015-2018', 
    month: 6, 
    altitude: 70, 
    title: 'Senior High School', 
    subtitle: 'STEM Specialization', 
    institution: 'SMA Negeri 8 Jakarta',
    level: 'senior',
    icon: Trophy, 
    badge: 'Camp 2', 
    description: 'Science major focus on Mathematics & Physics. Won regional robotics competition. Developed first web applications.',
    gpa: '92 / 100',
  },
  
  // University
  { 
    id: '4', 
    year: '2020-2024', 
    month: 8, 
    altitude: 100, 
    title: 'Bachelor Degree', 
    subtitle: 'Network Engineering', 
    institution: 'University of Technology',
    level: 'university',
    icon: Star, 
    badge: '🎓 SUMMIT', 
    description: 'Specialized in Network Security, Cloud Computing, and Full-Stack Development. Final project: Smart Network Monitoring System using AI/ML.',
    gpa: '3.85 / 4.00',
  },
];

// Level-based colors for education stages
const categoryColors = {
  elementary: { main: '#22d3ee', glow: 'rgba(34, 211, 238, 0.5)', bg: 'from-cyan-400/20 to-blue-400/20', text: 'text-cyan-300' },
  junior: { main: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)', bg: 'from-green-400/20 to-emerald-400/20', text: 'text-green-300' },
  senior: { main: '#fb923c', glow: 'rgba(251, 146, 60, 0.5)', bg: 'from-orange-400/20 to-pink-400/20', text: 'text-orange-300' },
  university: { main: '#a78bfa', glow: 'rgba(167, 139, 250, 0.5)', bg: 'from-purple-400/20 to-pink-400/20', text: 'text-purple-300' },
};

export function AltitudeTimeline({ educationRecords }: AltitudeTimelineProps = {}) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Convert education records to timeline points
  const convertEducationToTimeline = (records: Education[]): TimelinePoint[] => {
    if (!records || records.length === 0) return [];

    return records.map((record, index) => {
      // Map education order to timeline level
      const levelMap: Record<number, 'elementary' | 'junior' | 'senior' | 'university'> = {
        1: 'elementary',
        2: 'junior',
        3: 'senior',
        4: 'university'
      };

      const level = levelMap[record.order] || 'university';
      const altitude = Math.min(100, record.order * 25); // Use order for altitude

      return {
        id: record.id,
        year: record.period,
        month: 6, // Default to June
        altitude,
        title: record.degree,
        subtitle: record.description || record.degree,
        institution: record.institution,
        level,
        icon: GraduationCap,
        badge: record.institution,
        description: record.description,
        gpa: record.gpa,
      };
    });
  };

  // Use education records if available, otherwise use default data
  const timelineData = (educationRecords && educationRecords.length > 0) ? convertEducationToTimeline(educationRecords) : defaultTimelineData;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const waypointTimers = useRef<NodeJS.Timeout[]>([]);
  const titleHideTimer = useRef<NodeJS.Timeout | null>(null);
  const lastWaypointIndex = useRef<number>(-1);
  const animationStarted = useRef(false);
  const animationFrameId = useRef<number | null>(null);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const lastProgress = useRef<number>(0); // Track last progress to prevent backward movement
  
  const climberProgress = useMotionValue(0);
  const smoothProgress = useSpring(climberProgress, { stiffness: 40, damping: 25 });
  const pathRef = useRef<SVGPathElement>(null);
  const climberAnimProgress = useMotionValue(0);
  const pathDrawProgress = useMotionValue(0); // For synchronized path drawing

  // Animation timing constants
  const TRAVEL_TIME = 1500; // ms to travel between waypoints (diperlambat dari 700ms)
  const PAUSE_TIME = 1500; // ms to pause at each waypoint (diperlambat dari 1000ms)
  const TITLE_DISPLAY_TIME = 2500; // ms to show title at waypoint
  const ANIMATION_START_DELAY = 0; // Start delay in seconds (instant spawn!)
  
  // Helper function to generate synchronized animation keyframes
  const generateAnimationKeyframes = (waypointCount: number) => {
    const keyframes: number[] = [];
    const times: number[] = [];
    
    const segmentDuration = TRAVEL_TIME + PAUSE_TIME;
    // Total duration should be based on segments, not waypoints
    // We have (waypointCount - 1) segments between waypoints
    const totalDuration = segmentDuration * (waypointCount - 1) + TRAVEL_TIME; // Add final travel time
    
    for (let i = 0; i < waypointCount; i++) {
      const startTime = i * segmentDuration;
      const arrivalTime = startTime + TRAVEL_TIME;
      const departureTime = arrivalTime + PAUSE_TIME;
      const progress = i / (waypointCount - 1); // 0 to 1
      
      // Arrival keyframe
      keyframes.push(progress);
      times.push(arrivalTime / totalDuration);
      
      // Pause keyframe (duplicate position) - except for the last waypoint
      if (i < waypointCount - 1) {
        keyframes.push(progress);
        times.push(departureTime / totalDuration);
      }
    }
    
    return { keyframes, times, totalDuration: totalDuration / 1000 };
  };
  
  // Calculate total animation duration for path sync
  const { totalDuration: climberDuration } = generateAnimationKeyframes(timelineData.length);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      waypointTimers.current.forEach(timer => clearTimeout(timer));
      if (titleHideTimer.current) clearTimeout(titleHideTimer.current);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (timeoutId.current) clearTimeout(timeoutId.current);
      // Reset animation state on cleanup
      animationStarted.current = false;
      lastWaypointIndex.current = -1;
      lastProgress.current = 0;
      setCurrentWaypointIndex(-1);
      setShowingTitle(false);
      setSelectedPoint(null);
      setHoveredPoint(null);
      // Reset motion values
      climberProgress.set(0);
      climberAnimProgress.set(0);
      pathDrawProgress.set(0);
    };
  }, []);

  // Calculate SVG path points
  const width = 1000;
  const height = 600;
  const padding = { top: 40, right: 60, bottom: 80, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Map data to coordinates (education timeline: 2006-2024)
  const points = timelineData.map((point, index) => {
    // For education, we'll space them evenly across the timeline
    const totalPoints = timelineData.length;
    const x = padding.left + (index / (totalPoints - 1)) * chartWidth;
    const y = padding.top + chartHeight - (point.altitude / 100) * chartHeight;
    
    return { ...point, x, y };
  });

  // Function to detect which waypoint climber is near
  const detectNearestWaypoint = (x: number, y: number) => {
    const threshold = 10; // Distance threshold to consider "at waypoint"
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      
      if (distance < threshold) {
        return i;
      }
    }
    
    return -1;
  };

  // Get point on path at specific progress (0-1)
  const getPointAtProgress = (progress: number) => {
    if (!pathRef.current) return { x: points[0].x, y: points[0].y };
    
    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    const pathLength = pathRef.current.getTotalLength();
    const targetLength = pathLength * clampedProgress;
    const point = pathRef.current.getPointAtLength(targetLength);
    
    return { x: point.x, y: point.y };
  };

  // Generate SVG path
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    // Smooth curve using quadratic bezier
    const prevPoint = points[index - 1];
    const midX = (prevPoint.x + point.x) / 2;
    return `${path} Q ${midX} ${prevPoint.y}, ${midX} ${(prevPoint.y + point.y) / 2} Q ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  // Get point at progress for climber position
  const getClimberPosition = (progress: number) => {
    const index = Math.min(Math.floor(progress * (points.length - 1)), points.length - 1);
    const nextIndex = Math.min(index + 1, points.length - 1);
    const segmentProgress = (progress * (points.length - 1)) % 1;
    
    const current = points[index];
    const next = points[nextIndex];
    
    return {
      x: current.x + (next.x - current.x) * segmentProgress,
      y: current.y + (next.y - current.y) * segmentProgress,
    };
  };

  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(-1);
  const [showingTitle, setShowingTitle] = useState(false);
  // Get current waypoint data
  const currentWaypoint = currentWaypointIndex >= 0 && currentWaypointIndex < timelineData.length 
    ? timelineData[currentWaypointIndex] 
    : null;

  // Create transforms for climber position (at top level)
  const climberX = useTransform(smoothProgress, (p) => {
    if (!pathRef.current || points.length === 0) return points[0]?.x || 0;
    const clampedP = Math.max(0, Math.min(1, p));
    try {
      const pathLength = pathRef.current.getTotalLength();
      const targetLength = pathLength * clampedP;
      const point = pathRef.current.getPointAtLength(targetLength);
      return point.x;
    } catch {
      return points[0]?.x || 0;
    }
  });
  
  const climberY = useTransform(smoothProgress, (p) => {
    if (!pathRef.current || points.length === 0) return points[0]?.y || 0;
    const clampedP = Math.max(0, Math.min(1, p));
    try {
      const pathLength = pathRef.current.getTotalLength();
      const targetLength = pathLength * clampedP;
      const point = pathRef.current.getPointAtLength(targetLength);
      return point.y;
    } catch {
      return points[0]?.y || 0;
    }
  });

  // Animate climber progress on mount - ONLY ONCE per mount
  useEffect(() => {
    // Guard: only run if in view and not started
    if (!isInView || animationStarted.current) {
      return;
    }
    
    // Use requestAnimationFrame instead of setTimeout for immediate execution
    const rafId = requestAnimationFrame(() => {
      // Double check before starting
      if (!pathRef.current || animationStarted.current) {
        return;
      }
      
      // Mark as started IMMEDIATELY
      animationStarted.current = true;
      
      // Initialize to 0
      climberAnimProgress.set(0);
      pathDrawProgress.set(0);
      lastProgress.current = 0; // Reset progress tracker
      
      // Generate animation keyframes with pauses
      const { keyframes, times, totalDuration } = generateAnimationKeyframes(points.length);
      
      // Animate with requestAnimationFrame
      const startTime = Date.now();
      
      const animate = () => {
        // Safety check - if component unmounted, stop
        if (!animationStarted.current) {
          return;
        }
        
        const elapsed = (Date.now() - startTime) / 1000 - ANIMATION_START_DELAY;
        
        if (elapsed < 0) {
          animationFrameId.current = requestAnimationFrame(animate);
          return;
        }
        
        if (elapsed >= totalDuration) {
          climberAnimProgress.set(1);
          pathDrawProgress.set(1);
          lastProgress.current = 1; // Ensure we're at the end
          animationFrameId.current = null;
          return; // Animation complete
        }
        
        const normalizedTime = elapsed / totalDuration;
        let progress = keyframes[keyframes.length - 1] || 1; // Default to last keyframe or 1
        
        // Find the appropriate keyframe segment
        let foundSegment = false;
        for (let i = 0; i < times.length; i++) {
          if (normalizedTime <= times[i]) {
            if (i === 0) {
              progress = keyframes[0] * (normalizedTime / times[0]);
            } else {
              const t = (normalizedTime - times[i - 1]) / (times[i] - times[i - 1]);
              progress = keyframes[i - 1] + (keyframes[i] - keyframes[i - 1]) * t;
            }
            foundSegment = true;
            break;
          }
        }
        
        // If we're past all times, ensure we're at the final position
        if (!foundSegment) {
          progress = keyframes[keyframes.length - 1] || 1;
        }
        
        // Ensure progress never goes backward and doesn't exceed 1
        progress = Math.max(progress, lastProgress.current);
        progress = Math.min(progress, 1); // Clamp to max 1
        lastProgress.current = progress;
        
        climberAnimProgress.set(progress);
        pathDrawProgress.set(progress); // Sync path drawing with climber
        animationFrameId.current = requestAnimationFrame(animate);
      };
      
      animationFrameId.current = requestAnimationFrame(animate);
    });
    
    // Cleanup function
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isInView]); // ONLY depend on isInView - nothing else!

  // Track climber position and detect waypoints - SETUP ONCE
  useEffect(() => {
    const handleProgressChange = (progress: number) => {
      if (!pathRef.current) return;
      
      // Update climber position
      const position = getPointAtProgress(progress);
      climberProgress.set(progress);
      
      // Detect waypoint
      const nearestIndex = detectNearestWaypoint(position.x, position.y);
      
      if (nearestIndex !== -1 && nearestIndex !== lastWaypointIndex.current) {
        lastWaypointIndex.current = nearestIndex;
        
        // Use requestAnimationFrame to batch state updates
        requestAnimationFrame(() => {
          setCurrentWaypointIndex(nearestIndex);
          setShowingTitle(true);
        });
        
        if (titleHideTimer.current) {
          clearTimeout(titleHideTimer.current);
        }
        
        titleHideTimer.current = setTimeout(() => {
          requestAnimationFrame(() => {
            setShowingTitle(false);
          });
        }, TITLE_DISPLAY_TIME);
      }
    };
    
    const unsubscribe = climberAnimProgress.on('change', handleProgressChange);
    
    return () => {
      unsubscribe();
    };
  }, []); // Empty array - setup listener only once!

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Current Achievement Title Display */}
      <AnimatePresence>
        {showingTitle && currentWaypoint && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 mb-6"
            style={{ width: 'max-content', maxWidth: '90%' }}
          >
            <div
              className="px-6 py-4 rounded-2xl backdrop-blur-xl border-2 shadow-2xl"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: categoryColors[currentWaypoint.level].main,
                boxShadow: `0 0 40px ${categoryColors[currentWaypoint.level].glow}, 0 10px 30px rgba(0,0,0,0.5)`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const Icon = currentWaypoint.icon;
                  return <Icon className="w-5 h-5" style={{ color: categoryColors[currentWaypoint.level].main }} />;
                })()}
                <h3 className="text-white text-lg">{currentWaypoint.title}</h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {currentWaypoint.institution}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {currentWaypoint.year}
                </span>
                {currentWaypoint.badge && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs ml-auto"
                    style={{
                      backgroundColor: categoryColors[currentWaypoint.level].glow,
                      color: categoryColors[currentWaypoint.level].main,
                    }}
                  >
                    {currentWaypoint.badge}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Altitude Labels & Background Zones */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Elementary Zone */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-cyan-400/5 to-transparent">
          <div className="absolute top-2 md:top-4 left-2 md:left-4 text-cyan-300/50 text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2">
            <GraduationCap className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">Base Camp • Elementary School</span>
            <span className="sm:hidden">Elementary</span>
          </div>
        </div>
        {/* Junior Zone */}
        <div className="absolute bottom-1/4 left-0 right-0 h-1/4 bg-gradient-to-t from-green-400/5 to-transparent">
          <div className="absolute top-2 md:top-4 left-2 md:left-4 text-green-300/50 text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2">
            <Award className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">Camp 1 • Junior High School</span>
            <span className="sm:hidden">Junior High</span>
          </div>
        </div>
        {/* Senior Zone */}
        <div className="absolute bottom-2/4 left-0 right-0 h-1/4 bg-gradient-to-t from-orange-400/5 to-transparent">
          <div className="absolute top-2 md:top-4 left-2 md:left-4 text-orange-300/50 text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2">
            <Trophy className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">Camp 2 • Senior High School</span>
            <span className="sm:hidden">Senior High</span>
          </div>
        </div>
        {/* University Zone */}
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-purple-400/5 to-transparent">
          <div className="absolute top-2 md:top-4 left-2 md:left-4 text-purple-300/50 text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2">
            <Star className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:inline">Summit • University</span>
            <span className="sm:hidden">University</span>
          </div>
        </div>

        {/* Floating clouds */}
        <motion.div
          animate={{ x: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 right-20 w-32 h-16 rounded-full bg-white/5 blur-xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-40 left-32 w-40 h-20 rounded-full bg-white/5 blur-xl"
        />
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ minHeight: '300px', maxHeight: '600px' }}
        >
          {/* Grid lines */}
          <g opacity="0.1">
            {[0, 25, 50, 75, 100].map((alt) => {
              const y = padding.top + chartHeight - (alt / 100) * chartHeight;
              return (
                <g key={alt}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text x={padding.left - 35} y={y + 4} fill="white" fontSize="12" opacity="0.5">
                    {alt}%
                  </text>
                </g>
              );
            })}
          </g>

          {/* Year labels */}
          <g>
            {['2020', '2021', '2022', '2023', '2024'].map((year, index) => {
              const x = padding.left + (index / 4) * chartWidth;
              return (
                <text
                  key={year}
                  x={x}
                  y={height - padding.bottom + 30}
                  fill="white"
                  fontSize="14"
                  textAnchor="middle"
                  opacity="0.7"
                >
                  {year}
                </text>
              );
            })}
          </g>

          {/* Gradient definition for path */}
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fb923c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="pathGlowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#fb923c" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Path glow effect */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#pathGlowGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pathLength: pathDrawProgress,
              opacity: isInView ? 1 : 0,
            }}
            filter="blur(4px)"
          />

          {/* Main path */}
          <motion.path
            ref={pathRef}
            d={pathData}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pathLength: pathDrawProgress,
            }}
          />

          {/* Waypoints */}
          {points.map((point, index) => {
            const colors = categoryColors[point.level];
            const isHovered = hoveredPoint === point.id;
            const isSelected = selectedPoint === point.id;
            
            // Calculate when this waypoint should appear (when climber reaches it)
            const waypointDelay = ANIMATION_START_DELAY + (index * (TRAVEL_TIME + PAUSE_TIME) / 1000) + (TRAVEL_TIME / 1000);
            
            return (
              <g key={point.id}>
                {/* Glow effect */}
                {(isHovered || isSelected) && (
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r="20"
                    fill={colors.glow}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.6 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ filter: 'blur(8px)' }}
                  />
                )}
                
                {/* Waypoint circle */}
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill={colors.main}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: waypointDelay, type: 'spring', stiffness: 200 }}
                  style={{ cursor: 'pointer' }}
                  whileHover={{ scale: 1.5 }}
                  onMouseEnter={() => setHoveredPoint(point.id)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setSelectedPoint(selectedPoint === point.id ? null : point.id)}
                />

                {/* Badge label */}
                {point.badge && (
                  <motion.text
                    x={point.x}
                    y={point.y - 20}
                    fill={colors.main}
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 0.8, y: 0 } : {}}
                    transition={{ delay: waypointDelay + 0.2 }}
                  >
                    {point.badge}
                  </motion.text>
                )}
              </g>
            );
          })}

          {/* Animated climber icon */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ delay: ANIMATION_START_DELAY }}
            style={{ pointerEvents: 'none' }}
          >
            <motion.g
              style={{
                x: climberX,
                y: climberY,
                pointerEvents: 'none',
              }}
            >
              {/* Climber */}
              <circle cx="0" cy="0" r="12" fill="rgba(255, 255, 255, 0.2)" style={{ pointerEvents: 'none' }} />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="16"
                style={{ pointerEvents: 'none' }}
              >
                🧗
              </text>
            </motion.g>
          </motion.g>
        </svg>
      </div>



      {/* Click Modal - Full details */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedPoint && (() => {
            const point = points.find((p) => p.id === selectedPoint);
            if (!point) return null;
            
            const colors = categoryColors[point.level];
            const Icon = point.icon;
            
            return (
              <motion.div
                key={`modal-${point.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                  onClick={() => setSelectedPoint(null)}
                />
                
                {/* Modal Card */}
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative max-w-md w-full pointer-events-auto mx-4"
                >
                  {/* Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-3xl blur-xl opacity-50"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.main}40, transparent)`,
                    }}
                  />
                  
                  {/* Main Card - HYBRID EXPEDITION DATA SHEET */}
                  <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl border rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
                    style={{ 
                      borderColor: colors.main,
                      boxShadow: `0 0 60px ${colors.glow}, 0 20px 60px rgba(0,0,0,0.6)`,
                    }}
                  >
                    {/* TERMINAL HEADER - Developer Theme */}
                    <div 
                      className="relative px-4 py-3 md:px-6 md:py-4 border-b"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.main}15, ${colors.main}05)`,
                        borderBottomColor: `${colors.main}30`,
                      }}
                    >
                      {/* Terminal Controls */}
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <div className="flex gap-1.5 md:gap-2">
                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80" />
                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80" />
                          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="flex-1 text-center">
                          <span className="font-mono text-[10px] md:text-xs text-white/40 truncate block">
                            <span className="hidden sm:inline">~/expedition_data/{point.id}.log</span>
                            <span className="sm:hidden">{point.id}.log</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Terminal Command */}
                      <div className="font-mono text-xs md:text-sm space-y-1">
                        <div className="text-green-400 hidden sm:block">
                          <span className="text-white/40">$</span> cat education_journey.txt
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 text-white">
                          <span className="text-white/60">»</span>
                          <span className="tracking-wide truncate flex-1">{point.title}</span>
                          {point.badge && <span className="text-base md:text-lg flex-shrink-0">{point.badge}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-h-[75vh] overflow-y-auto relative">
                      {/* Topographic Lines Background - Mountain Theme */}
                      <div 
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                          backgroundImage: `repeating-linear-gradient(0deg, ${colors.main} 0px, transparent 1px, transparent 20px, ${colors.main} 21px), repeating-linear-gradient(90deg, ${colors.main} 0px, transparent 1px, transparent 20px, ${colors.main} 21px)`,
                        }}
                      />
                      
                      {/* Main Content Grid */}
                      <div className="relative grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
                        {/* ALTIMETER GAUGE - Aviation Theme */}
                        <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
                          <div 
                            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center shadow-2xl"
                            style={{ 
                              background: `radial-gradient(circle, ${colors.main}20, ${colors.main}05, transparent)`,
                              borderColor: colors.main,
                              boxShadow: `inset 0 0 30px ${colors.glow}, 0 0 40px ${colors.glow}`,
                            }}
                          >
                            {/* Altitude Markers */}
                            <div className="absolute inset-0">
                              {[0, 25, 50, 75, 100].map((alt) => (
                                <div
                                  key={alt}
                                  className="absolute w-full h-full"
                                  style={{
                                    transform: `rotate(${(alt / 100) * 270 - 135}deg)`,
                                  }}
                                >
                                  <div 
                                    className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/40"
                                  />
                                </div>
                              ))}
                            </div>
                            
                            {/* Needle */}
                            <div
                              className="absolute w-1 h-12 origin-bottom rounded-full transition-transform duration-1000"
                              style={{
                                background: `linear-gradient(180deg, ${colors.main}, transparent)`,
                                transform: `rotate(${(point.altitude / 100) * 270 - 135}deg)`,
                                bottom: '50%',
                              }}
                            />
                            
                            {/* Center Display */}
                            <div className="relative z-10 text-center">
                              <Icon className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1" style={{ color: colors.main }} />
                              <div 
                                className="font-mono text-sm md:text-base tracking-tight"
                                style={{ color: colors.main }}
                              >
                                {point.altitude}%
                              </div>
                              <div className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider">
                                ALT
                              </div>
                            </div>
                            
                            {/* Outer Ring Glow */}
                            <div 
                              className="absolute inset-0 rounded-full animate-pulse"
                              style={{
                                boxShadow: `0 0 20px ${colors.glow}`,
                              }}
                            />
                          </div>
                          
                          {/* Level Badge */}
                          <div 
                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs uppercase tracking-widest border-2 shadow-lg"
                            style={{ 
                              color: colors.main,
                              borderColor: colors.main,
                              background: `${colors.main}20`,
                              boxShadow: `0 0 15px ${colors.glow}`,
                            }}
                          >
                            {point.level.replace('_', ' ')}
                          </div>
                        </div>
                        
                        {/* INFO SECTION */}
                        <div className="space-y-3 md:space-y-4">
                          {/* Institution & Subtitle */}
                          <div>
                            <h3 className="text-white/90 mb-1 flex items-center gap-2 text-sm md:text-base">
                              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: colors.main }} />
                              <span className="truncate">{point.institution}</span>
                            </h3>
                            <p className="text-white/60 text-xs md:text-sm italic">{point.subtitle}</p>
                          </div>
                          
                          {/* Description */}
                          {point.description && (
                            <div className="p-3 md:p-4 rounded-xl border bg-white/5 backdrop-blur-sm" style={{ borderColor: `${colors.main}30` }}>
                              <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                                {point.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* STATS GRID - RPG/Game Theme */}
                      <div 
                        className="grid grid-cols-2 gap-2 md:gap-3 p-3 md:p-4 rounded-xl border"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.main}10, ${colors.main}05)`,
                          borderColor: `${colors.main}30`,
                        }}
                      >
                        <div className="space-y-0.5 md:space-y-1">
                          <div className="flex items-center gap-1.5 md:gap-2 text-white/50 text-[10px] md:text-xs uppercase tracking-wider">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="hidden sm:inline">Duration</span>
                            <span className="sm:hidden">Time</span>
                          </div>
                          <div className="font-mono text-xs md:text-sm text-white truncate">{point.year}</div>
                        </div>
                        
                        {point.gpa && (
                          <div className="space-y-0.5 md:space-y-1">
                            <div className="flex items-center gap-1.5 md:gap-2 text-white/50 text-[10px] md:text-xs uppercase tracking-wider">
                              <TrendingUp className="w-3 h-3 flex-shrink-0" />
                              <span className="hidden sm:inline">Performance</span>
                              <span className="sm:hidden">Perf</span>
                            </div>
                            <div className="font-mono text-xs md:text-sm text-white truncate">{point.gpa}</div>
                          </div>
                        )}
                        
                        <div className="space-y-0.5 md:space-y-1">
                          <div className="flex items-center gap-1.5 md:gap-2 text-white/50 text-[10px] md:text-xs uppercase tracking-wider">
                            <Mountain className="w-3 h-3 flex-shrink-0" />
                            <span className="hidden sm:inline">Elevation</span>
                            <span className="sm:hidden">Elev</span>
                          </div>
                          <div className="font-mono text-xs md:text-sm text-white">{point.altitude}m</div>
                        </div>
                        
                        <div className="space-y-0.5 md:space-y-1">
                          <div className="flex items-center gap-1.5 md:gap-2 text-white/50 text-[10px] md:text-xs uppercase tracking-wider">
                            <Code2 className="w-3 h-3 flex-shrink-0" />
                            Status
                          </div>
                          <div className="font-mono text-xs md:text-sm" style={{ color: colors.main }}>DONE</div>
                        </div>
                      </div>
                      
                      {/* ACTION BUTTONS */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setSelectedPoint(null)}
                          className="flex-1 py-2.5 md:py-3 rounded-xl transition-all duration-200 text-white hover:scale-[1.02] active:scale-95 border font-mono text-xs md:text-sm tracking-wide"
                          style={{ 
                            background: `linear-gradient(135deg, ${colors.main}20, ${colors.main}10)`,
                            borderColor: colors.main,
                          }}
                        >
                          <span className="hidden sm:inline">[ESC] Close</span>
                          <span className="sm:hidden">Close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}

      {/* Hover Info Bar - Bottom Fixed */}
      <AnimatePresence>
        {(() => {
          if (!hoveredPoint || selectedPoint) return null;
          const point = points.find((p) => p.id === hoveredPoint);
          if (!point) return null;
          
          const colors = categoryColors[point.level];
          const Icon = point.icon;
          
          return (
            <motion.div
              key={`info-bar-${point.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute bottom-0 left-0 right-0 pointer-events-none z-40"
            >
              <div className="max-w-4xl mx-auto px-2 md:px-4 pb-2 md:pb-4">
                <div 
                  className="relative bg-gradient-to-r from-gray-900/98 via-gray-800/98 to-gray-900/98 backdrop-blur-2xl border rounded-xl md:rounded-2xl shadow-2xl overflow-hidden"
                  style={{ 
                    borderColor: colors.main,
                    boxShadow: `0 0 30px ${colors.glow}, 0 10px 40px rgba(0,0,0,0.5)`,
                  }}
                >
                  {/* Terminal-style Top Bar */}
                  <div 
                    className="px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 md:gap-3 border-b"
                    style={{ 
                      background: `linear-gradient(90deg, ${colors.main}20, ${colors.main}05)`,
                      borderBottomColor: `${colors.main}30`,
                    }}
                  >
                    <div className="flex gap-1 md:gap-1.5">
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500/70" />
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-500/70" />
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500/70" />
                    </div>
                    <div className="flex-1 font-mono text-[10px] md:text-xs text-white/40 truncate">
                      {point.id}.expedition_log
                    </div>
                    <div 
                      className="font-mono text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded border flex-shrink-0"
                      style={{ 
                        color: colors.main,
                        borderColor: `${colors.main}50`,
                        background: `${colors.main}10`,
                      }}
                    >
                      <span className="hidden sm:inline">ALT </span>{point.altitude}%
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center gap-4">
                    {/* Altimeter Icon */}
                    <div 
                      className="relative w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2"
                      style={{ 
                        background: `radial-gradient(circle, ${colors.main}30, ${colors.main}05)`,
                        borderColor: colors.main,
                        boxShadow: `inset 0 0 20px ${colors.glow}, 0 0 20px ${colors.glow}`,
                      }}
                    >
                      <Icon className="w-6 h-6 z-10" style={{ color: colors.main }} />
                      {/* Rotating ring */}
                      <div 
                        className="absolute inset-0 rounded-full border-2 border-dashed animate-spin"
                        style={{ 
                          borderColor: `${colors.main}30`,
                          animationDuration: '8s',
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="px-2 py-0.5 rounded text-xs uppercase tracking-wider border font-mono"
                          style={{ 
                            color: colors.main,
                            borderColor: colors.main,
                            background: `${colors.main}15`,
                          }}
                        >
                          {point.level.replace('_', ' ')}
                        </span>
                        {point.badge && (
                          <span className="text-sm">{point.badge}</span>
                        )}
                      </div>
                      <h4 className="text-white truncate">{point.title}</h4>
                      <p className="text-white/50 text-sm truncate">{point.institution}</p>
                    </div>
                    
                    {/* Meta - Terminal Style */}
                    <div className="hidden md:flex flex-col gap-1.5 font-mono text-xs text-white/60 flex-shrink-0">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {point.year}
                      </span>
                      {point.gpa && (
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3" />
                          {point.gpa}
                        </span>
                      )}
                    </div>
                    
                    {/* Click hint */}
                    <div className="hidden md:block text-xs text-white/40 flex-shrink-0 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      Click for details
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
