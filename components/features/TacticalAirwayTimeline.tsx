'use client';

import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Compass,
  Plane,
  RotateCcw,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Radio,
  Gauge,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Education } from '@/lib/types/admin';
import { FALLBACK_EDUCATION_RECORDS } from '@/lib/fallback-data';

// ── Waypoint Telemetry Data ──────────────────────────────────────────────────
export interface WaypointLeg {
  id: string;
  order: number;
  fixCode: string;
  waypointName: string;
  flightLevel: string;
  altitudeFeet: number;
  airspeedKnots: number;
  courseHeading: number;
  flightPhase: string;
  degree: string;
  institution: string;
  period: string;
  status: string;
  description: string;
  // 3D coordinates along the airway flight corridor
  coord: [number, number, number];
  pitchDeg: number;
  rollDeg: number;
}

const DEFAULT_WAYPOINTS: WaypointLeg[] = [
  {
    id: 'wpt-01-demak',
    order: 1,
    fixCode: 'DMK 01',
    waypointName: 'DEMAK VOR',
    flightLevel: 'FL040',
    altitudeFeet: 4000,
    airspeedKnots: 180,
    courseHeading: 45,
    flightPhase: 'DEPARTURE & INITIAL CLIMB',
    degree: 'Elementary School',
    institution: 'MI Negeri 1 Demak',
    period: '2010 - 2018',
    status: 'Cleared & Complete',
    description:
      'Building strong academic foundation and character development. Active in journey, survival, and exploration clubs.',
    coord: [-4.2, -1.8, 2.5],
    pitchDeg: 14,
    rollDeg: 5,
  },
  {
    id: 'wpt-02-smpn2',
    order: 2,
    fixCode: 'DMN 02',
    waypointName: 'SMPN2 FIX',
    flightLevel: 'FL120',
    altitudeFeet: 12000,
    airspeedKnots: 240,
    courseHeading: 58,
    flightPhase: 'EN-ROUTE CLIMB',
    degree: 'Junior High School',
    institution: 'SMP Negeri 2 Demak',
    period: '2016 - 2019',
    status: 'Cleared & Complete',
    description:
      'Initiated programming journey and algorithmic foundations. First explorations into logic, web development, and digital problem solving.',
    coord: [-2.1, -0.7, 1.2],
    pitchDeg: 12,
    rollDeg: -4,
  },
  {
    id: 'wpt-03-kudus',
    order: 3,
    fixCode: 'RUS 03',
    waypointName: 'KUDUS AIRWAY',
    flightLevel: 'FL240',
    altitudeFeet: 24000,
    airspeedKnots: 310,
    courseHeading: 72,
    flightPhase: 'TRANSITION LEVEL',
    degree: 'Senior High School',
    institution: 'SMK Raden Umar Said Kudus',
    period: '2019 - 2022',
    status: 'Cleared & Complete',
    description:
      'Deep dive into modern software engineering, 3D graphics pipeline, animation, and responsive web applications at Raden Umar Said.',
    coord: [0.0, 0.4, 0.0],
    pitchDeg: 8,
    rollDeg: 8,
  },
  {
    id: 'wpt-04-binar',
    order: 4,
    fixCode: 'BNR 04',
    waypointName: 'BINAR TRANSIT',
    flightLevel: 'FL320',
    altitudeFeet: 32000,
    airspeedKnots: 390,
    courseHeading: 84,
    flightPhase: 'CRUISE LEVEL',
    degree: 'Djarum Foundation Scholarship',
    institution: 'Binar Academy',
    period: '2021 - 2021',
    status: 'Cleared & Complete',
    description:
      'Specialized intensive computer science scholarship. Mastery in full-stack architecture, clean code principles, and collaborative agile engineering.',
    coord: [2.2, 1.3, -1.2],
    pitchDeg: 4,
    rollDeg: -6,
  },
  {
    id: 'wpt-05-udinus',
    order: 5,
    fixCode: 'UDN 05',
    waypointName: 'SEMARANG ILS',
    flightLevel: 'FL380',
    altitudeFeet: 38000,
    airspeedKnots: 450,
    courseHeading: 90,
    flightPhase: 'CRUISE & ADVANCED OPS',
    degree: 'Bachelor Degree (Informatics)',
    institution: 'Dian Nuswantoro University',
    period: '2022 - 2026',
    status: 'Active En-Route',
    description:
      'Pursuing Bachelor of Computer Science. Researching distributed systems, cloud infrastructure, AI agents, and high-performance interactive 3D web technologies.',
    coord: [4.4, 2.1, -2.4],
    pitchDeg: 2,
    rollDeg: 2,
  },
];

// Preload 3D jet asset
if (typeof window !== 'undefined') {
  useGLTF.preload('/models/aircraft/jet.glb');
}

// ── 3D Aircraft Model with Aerodynamic Banking ──────────────────────────────
function TacticalJetAircraft({
  targetCoord,
  pitchDeg,
  rollDeg,
  courseHeading,
}: {
  targetCoord: [number, number, number];
  pitchDeg: number;
  rollDeg: number;
  courseHeading: number;
}) {
  const gltf = useGLTF('/models/aircraft/jet.glb');
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene so materials/instances don't collide
  const sceneClone = useMemo(() => {
    const clone = gltf.scene.clone(true);
    // Orient jet: nose points towards flight direction (+X or +Z based on source)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf.scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Smooth position interpolation towards target waypoint
    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetCoord[0],
      3.2,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetCoord[1],
      3.2,
      delta
    );
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetCoord[2],
      3.2,
      delta
    );

    // Subtle atmospheric turbulence roll/pitch oscillation
    const turbRoll = Math.sin(t * 1.8) * 0.035;
    const turbPitch = Math.cos(t * 1.4) * 0.02;
    const turbYaw = Math.sin(t * 0.9) * 0.015;

    // Convert target angles to radians
    const targetPitchRad = THREE.MathUtils.degToRad(pitchDeg) + turbPitch;
    const targetRollRad = THREE.MathUtils.degToRad(rollDeg) + turbRoll;
    const targetYawRad = THREE.MathUtils.degToRad(-courseHeading + 90) + turbYaw;

    // Interpolate rotations
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetPitchRad,
      3.5,
      delta
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetYawRad,
      3.5,
      delta
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetRollRad,
      3.5,
      delta
    );
  });

  return (
    <group ref={groupRef} position={[targetCoord[0], targetCoord[1], targetCoord[2]]}>
      {/* Scaled & oriented jet mesh: jet.glb is ~42m, scale 0.045 fits unit world */}
      <primitive
        object={sceneClone}
        scale={[0.045, 0.045, 0.045]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* Engine Afterburner / Contrail Vapor Trails */}
      <group position={[-0.45, -0.05, 0.85]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.06, 1.2, 8]} />
          <meshBasicMaterial color="#6FD4E1" transparent opacity={0.45} />
        </mesh>
      </group>
      <group position={[0.45, -0.05, 0.85]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.06, 1.2, 8]} />
          <meshBasicMaterial color="#6FD4E1" transparent opacity={0.45} />
        </mesh>
      </group>
    </group>
  );
}

// ── Highway In The Sky (HITS) Pathway Gate Rectangles ─────────────────────────
function PathwayGates({
  waypoints,
  selectedIdx,
  onSelectWaypoint,
}: {
  waypoints: WaypointLeg[];
  selectedIdx: number;
  onSelectWaypoint: (idx: number) => void;
}) {
  // Generate curve through all waypoints
  const points = useMemo(
    () => waypoints.map((w) => new THREE.Vector3(...w.coord)),
    [waypoints]
  );
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2),
    [points]
  );

  // Generate intermediate points along flight corridor
  const corridorPoints = useMemo(() => curve.getPoints(80), [curve]);
  const corridorLineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(corridorPoints);
  }, [corridorPoints]);

  return (
    <group>
      {/* Core Airway Flight Corridor Line */}
      <primitive object={new THREE.Line(corridorLineGeometry, new THREE.LineBasicMaterial({
        color: '#0891b2',
        linewidth: 3,
        transparent: true,
        opacity: 0.85,
      }))} />

      {/* Outer Cyan Flight Glow Line */}
      <primitive object={new THREE.Line(corridorLineGeometry, new THREE.LineBasicMaterial({
        color: '#6FD4E1',
        linewidth: 6,
        transparent: true,
        opacity: 0.35,
      }))} />

      {/* Waypoint Stations & Highway In The Sky Gates */}
      {waypoints.map((wpt, idx) => {
        const isSelected = idx === selectedIdx;
        const [x, y, z] = wpt.coord;

        return (
          <group
            key={wpt.id}
            position={[x, y, z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWaypoint(idx);
            }}
          >
            {/* Outer HITS Gate Ring */}
            <mesh rotation={[0, -THREE.MathUtils.degToRad(wpt.courseHeading - 90), 0]}>
              <ringGeometry args={[isSelected ? 0.75 : 0.55, isSelected ? 0.82 : 0.6, 32]} />
              <meshBasicMaterial
                color={isSelected ? '#0891b2' : '#6FD4E1'}
                side={THREE.DoubleSide}
                transparent
                opacity={isSelected ? 0.95 : 0.55}
              />
            </mesh>

            {/* Inner Reticle Gate Box */}
            <mesh rotation={[0, -THREE.MathUtils.degToRad(wpt.courseHeading - 90), 0]}>
              <ringGeometry args={[isSelected ? 0.45 : 0.35, isSelected ? 0.48 : 0.38, 4]} />
              <meshBasicMaterial
                color={isSelected ? '#FFFFFF' : '#B9E7E6'}
                side={THREE.DoubleSide}
                transparent
                opacity={isSelected ? 0.9 : 0.4}
              />
            </mesh>

            {/* Waypoint Beacon Pulse */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.16 : 0.1, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#0891b2' : '#6FD4E1'}
                emissive={isSelected ? '#0891b2' : '#6FD4E1'}
                emissiveIntensity={isSelected ? 0.8 : 0.3}
              />
            </mesh>

            {/* 3D Nav Label Pin */}
            <Html position={[0, isSelected ? 1.05 : 0.85, 0]} center distanceFactor={14}>
              <div
                onClick={() => onSelectWaypoint(idx)}
                className={`transition-all duration-300 pointer-events-auto cursor-pointer select-none px-2.5 py-1 rounded-md border text-[11px] font-mono tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0891b2] text-white border-white ring-2 ring-[#6FD4E1]/60 font-bold scale-110'
                    : 'bg-white/90 text-[#0c282d] border-[#B9E7E6] hover:bg-[#E2F4F3]'
                }`}
              >
                <Radio className={`w-3 h-3 ${isSelected ? 'animate-pulse text-white' : 'text-[#0891b2]'}`} />
                <span>{wpt.fixCode}</span>
                <span className="opacity-75 text-[10px]">{wpt.flightLevel}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ── Smooth Camera Following ──────────────────────────────────────────────────
function TacticalCameraController({ targetCoord }: { targetCoord: [number, number, number] }) {
  useFrame((state, delta) => {
    // Offset camera slightly behind and above the aircraft
    const desiredPos = new THREE.Vector3(
      targetCoord[0] + 3.8,
      targetCoord[1] + 2.2,
      targetCoord[2] + 4.8
    );
    state.camera.position.lerp(desiredPos, delta * 2.5);
    state.camera.lookAt(targetCoord[0], targetCoord[1] + 0.3, targetCoord[2]);
  });

  return null;
}

// ── Resilient 2.5D SVG Synthetic Vision Fallback ─────────────────────────────
function SyntheticVisionFallback({
  waypoints,
  selectedIdx,
  onSelectWaypoint,
}: {
  waypoints: WaypointLeg[];
  selectedIdx: number;
  onSelectWaypoint: (idx: number) => void;
}) {

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4 sm:p-6 select-none bg-gradient-to-b from-[#E2F4F3]/60 via-white to-[#F2FBFB] overflow-hidden">
      <svg viewBox="0 0 800 480" className="w-full h-full max-h-[460px]" fill="none">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2F4F3" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="pathLineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6FD4E1" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>

        {/* Artificial Horizon Pitch Ladder */}
        <line x1="160" y1="240" x2="640" y2="240" stroke="#B9E7E6" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1="320" y1="180" x2="480" y2="180" stroke="#0891b2" strokeWidth="1" opacity="0.3" />
        <line x1="320" y1="300" x2="480" y2="300" stroke="#0891b2" strokeWidth="1" opacity="0.3" />
        <text x="500" y="184" fill="#527d85" fontFamily="monospace" fontSize="10">+10°</text>
        <text x="500" y="304" fill="#527d85" fontFamily="monospace" fontSize="10">-10°</text>

        {/* 3D Perspective Flight Corridor Lines */}
        <line x1="80" y1="440" x2="400" y2="180" stroke="#6FD4E1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
        <line x1="720" y1="440" x2="400" y2="180" stroke="#6FD4E1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />

        {/* Flight Path Spline */}
        <path
          d="M 120 400 Q 280 320 400 240 T 680 120"
          stroke="url(#pathLineGrad)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Waypoint Rectangles (Highway in the Sky) */}
        {waypoints.map((wpt, idx) => {
          const coords = [
            [120, 400],
            [240, 330],
            [370, 260],
            [510, 190],
            [660, 130],
          ];
          const [cx, cy] = coords[idx];
          const isSelected = idx === selectedIdx;

          return (
            <g
              key={wpt.id}
              onClick={() => onSelectWaypoint(idx)}
              className="cursor-pointer group"
            >
              {/* Pathway Box Gate */}
              <rect
                x={cx - (isSelected ? 34 : 26)}
                y={cy - (isSelected ? 34 : 26)}
                width={isSelected ? 68 : 52}
                height={isSelected ? 68 : 52}
                rx="6"
                fill={isSelected ? '#6FD4E1' : '#E2F4F3'}
                fillOpacity={isSelected ? 0.3 : 0.15}
                stroke={isSelected ? '#0891b2' : '#6FD4E1'}
                strokeWidth={isSelected ? 2.5 : 1.5}
                className="transition-all duration-300"
              />

              {/* Waypoint Center Node */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 8 : 5}
                fill={isSelected ? '#0891b2' : '#FFFFFF'}
                stroke={isSelected ? '#FFFFFF' : '#0891b2'}
                strokeWidth={2}
              />

              {/* Waypoint Tag */}
              <text
                x={cx + 38}
                y={cy + 4}
                fill="#0c282d"
                fontFamily="monospace"
                fontSize={isSelected ? '12' : '10'}
                fontWeight={isSelected ? 'bold' : 'normal'}
              >
                {wpt.fixCode} • {wpt.flightLevel}
              </text>
            </g>
          );
        })}

        {/* Aircraft Symbol Crosshair */}
        <g transform={`translate(${[120, 240, 370, 510, 660][selectedIdx]}, ${[400, 330, 260, 190, 130][selectedIdx]})`}>
          <circle cx="0" cy="0" r="16" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M -18 0 L -6 0 M 6 0 L 18 0 M 0 -18 L 0 -6 M 0 6 L 0 18" stroke="#0891b2" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

// ── Master Component ─────────────────────────────────────────────────────────
export function TacticalAirwayTimeline({
  educationRecords,
}: {
  educationRecords?: Education[];
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [webGLSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  // Merge dynamic education records with aviation telemetry
  const waypoints = useMemo(() => {
    const raw = educationRecords && educationRecords.length > 0
      ? educationRecords
      : FALLBACK_EDUCATION_RECORDS;

    return DEFAULT_WAYPOINTS.map((wpt, idx) => {
      const matched = raw[idx];
      if (!matched) return wpt;
      return {
        ...wpt,
        degree: matched.degree || wpt.degree,
        institution: matched.institution || wpt.institution,
        period: matched.period || wpt.period,
        description: matched.description || wpt.description,
      };
    });
  }, [educationRecords]);

  const currentWpt = waypoints[selectedIdx];

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : waypoints.length - 1));
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev < waypoints.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Flight Plan HUD & 3D Glass Cockpit Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Glass Cockpit / Tactical Airway Viewport (Left 7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-[#B9E7E6] bg-gradient-to-b from-[#F2FBFB] via-white to-[#E2F4F3]/40 overflow-hidden shadow-lg relative min-h-[440px] md:min-h-[520px] flex flex-col">
          {/* Top HUD Telemetry Banner */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Navigation Mode Annunciator */}
            <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#B9E7E6] px-3.5 py-1.5 rounded-full shadow-sm text-xs font-mono text-[#0c282d]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#0891b2]">IFR AIRWAY</span>
              <span className="text-[#527d85]">•</span>
              <span>LNAV / VNAV</span>
              <span className="text-[#527d85] hidden sm:inline">•</span>
              <span className="hidden sm:inline font-bold">{currentWpt.fixCode}</span>
            </div>

            {/* Flight Level & Heading Bug */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-[#B9E7E6] px-3 py-1.5 rounded-full shadow-sm text-xs font-mono text-[#2d5f68]">
              <Compass className="w-3.5 h-3.5 text-[#0891b2]" />
              <span>HDG {String(currentWpt.courseHeading).padStart(3, '0')}°</span>
              <span className="text-[#B9E7E6]">|</span>
              <Gauge className="w-3.5 h-3.5 text-[#0891b2]" />
              <span>{currentWpt.airspeedKnots} KT</span>
            </div>
          </div>

          {/* 3D Canvas / Synthetic Vision Fallback */}
          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing min-h-[380px]">
            {webGLSupported ? (
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center font-mono text-sm text-[#527d85]">
                    Loading 3D Flight Corridor...
                  </div>
                }
              >
                <Canvas
                  shadows
                  camera={{ position: [5.5, 3.2, 7.5], fov: 46, near: 0.1, far: 50 }}
                  dpr={[1, 2]}
                  gl={{ antialias: true, powerPreference: 'high-performance' }}
                >
                  <color attach="background" args={['#F4FAFA']} />
                  <ambientLight intensity={1.1} />
                  <directionalLight position={[10, 15, 8]} intensity={1.5} castShadow />
                  <directionalLight position={[-8, 6, -5]} intensity={0.6} />

                  {/* Smooth Tactical Camera Controller */}
                  <TacticalCameraController targetCoord={currentWpt.coord} />

                  {/* Highway In The Sky Pathway Gates */}
                  <PathwayGates
                    waypoints={waypoints}
                    selectedIdx={selectedIdx}
                    onSelectWaypoint={setSelectedIdx}
                  />

                  {/* 3D Jet Aircraft Model */}
                  <TacticalJetAircraft
                    targetCoord={currentWpt.coord}
                    pitchDeg={currentWpt.pitchDeg}
                    rollDeg={currentWpt.rollDeg}
                    courseHeading={currentWpt.courseHeading}
                  />

                  <OrbitControls
                    autoRotate={autoRotate}
                    autoRotateSpeed={0.8}
                    enablePan={false}
                    minDistance={3.5}
                    maxDistance={12}
                    maxPolarAngle={Math.PI / 2 - 0.05}
                  />
                </Canvas>
              </Suspense>
            ) : (
              <SyntheticVisionFallback
                waypoints={waypoints}
                selectedIdx={selectedIdx}
                onSelectWaypoint={setSelectedIdx}
              />
            )}
          </div>

          {/* Bottom HUD Altimeter & Controls */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Altimeter Telemetry Pill */}
            <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#B9E7E6] px-3.5 py-1.5 rounded-full shadow-sm font-mono text-xs text-[#0c282d]">
              <Plane className="w-4 h-4 text-[#0891b2]" />
              <span className="font-bold text-[#0891b2]">{currentWpt.flightLevel}</span>
              <span className="text-[#527d85]">({currentWpt.altitudeFeet.toLocaleString()} FT ASL)</span>
            </div>

            {/* View / Auto-Pilot Toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-[#B9E7E6] px-3 py-1.5 rounded-full shadow-sm font-mono text-xs text-[#2d5f68] hover:bg-[#E2F4F3] transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#0891b2] ${autoRotate ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">AP ORBIT:</span>
              <span className="font-bold">{autoRotate ? 'ON' : 'MANUAL'}</span>
            </button>
          </div>
        </div>

        {/* Master Detail Card: Pilot EFB (Electronic Flight Bag) Tablet (Right 5 Cols) */}
        <Card className="lg:col-span-5 rounded-3xl border border-[#B9E7E6] bg-white shadow-xl flex flex-col justify-between overflow-hidden">
          <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full gap-6">
            <div className="flex flex-col gap-4">
              {/* EFB Header Row */}
              <div className="flex items-center justify-between border-b border-[#B9E7E6]/60 pb-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#E2F4F3] hover:bg-[#B9E7E6] text-[#0891b2] border border-[#B9E7E6] font-mono text-xs px-2.5 py-1">
                    <Radio className="w-3 h-3 mr-1 text-[#0891b2]" />
                    {currentWpt.fixCode}
                  </Badge>
                  <span className="font-mono text-xs text-[#527d85] font-semibold">
                    LEG 0{currentWpt.order} OF 05
                  </span>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {currentWpt.status}
                </Badge>
              </div>

              {/* Waypoint Identity & Flight Phase */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0891b2] tracking-wider uppercase">
                  <span>{currentWpt.flightPhase}</span>
                  <span>•</span>
                  <span>{currentWpt.flightLevel}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#0c282d] tracking-tight">
                  {currentWpt.degree}
                </h3>
                <h4 className="text-base font-semibold text-[#2d5f68]">
                  {currentWpt.institution}
                </h4>
              </div>

              {/* Flight Period Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E2F4F3]/70 border border-[#B9E7E6] text-[#0c282d] font-mono text-xs w-fit">
                <Calendar className="w-3.5 h-3.5 text-[#0891b2]" />
                <span>FLIGHT PERIOD: {currentWpt.period}</span>
              </div>

              {/* Full Description with Zero Truncation */}
              <div className="bg-[#F8FCFC] border border-[#B9E7E6]/80 rounded-2xl p-4 text-[#2d5f68] text-sm leading-relaxed">
                {currentWpt.description}
              </div>

              {/* Tactical Avionics Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="rounded-xl border border-[#B9E7E6] bg-white p-2.5 flex flex-col">
                  <span className="text-[10px] font-mono text-[#527d85]">TRUE AIRSPEED</span>
                  <span className="text-sm font-mono font-bold text-[#0c282d]">{currentWpt.airspeedKnots} KT</span>
                </div>
                <div className="rounded-xl border border-[#B9E7E6] bg-white p-2.5 flex flex-col">
                  <span className="text-[10px] font-mono text-[#527d85]">MAGNETIC TRACK</span>
                  <span className="text-sm font-mono font-bold text-[#0c282d]">{String(currentWpt.courseHeading).padStart(3, '0')}°</span>
                </div>
                <div className="rounded-xl border border-[#B9E7E6] bg-white p-2.5 flex flex-col">
                  <span className="text-[10px] font-mono text-[#527d85]">CORRIDOR</span>
                  <span className="text-sm font-mono font-bold text-[#0891b2]">IFR EN-RT</span>
                </div>
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="pt-4 border-t border-[#B9E7E6]/60 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="border-[#B9E7E6] text-[#0c282d] hover:bg-[#E2F4F3] font-mono text-xs rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1 text-[#0891b2]" />
                Prev Waypoint
              </Button>

              {/* 5-Step Waypoint Indicator */}
              <div className="flex items-center gap-1.5">
                {waypoints.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === selectedIdx ? 'w-6 bg-[#0891b2]' : 'w-2 bg-[#B9E7E6] hover:bg-[#6FD4E1]'
                    }`}
                    aria-label={`Jump to waypoint ${i + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="border-[#B9E7E6] text-[#0c282d] hover:bg-[#E2F4F3] font-mono text-xs rounded-xl"
              >
                Next Waypoint
                <ChevronRight className="w-4 h-4 ml-1 text-[#0891b2]" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom ATC Flight Plan Strip Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {waypoints.map((wpt, idx) => {
          const isSelected = idx === selectedIdx;

          return (
            <button
              key={wpt.id}
              onClick={() => setSelectedIdx(idx)}
              className={`rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-300 border flex flex-col justify-between gap-2 shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-br from-[#6FD4E1]/30 via-[#B9E7E6]/40 to-white border-[#0891b2] ring-2 ring-[#0891b2]/30 scale-[1.02]'
                  : 'bg-white/80 hover:bg-[#E2F4F3]/50 border-[#B9E7E6] text-[#2d5f68]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-[#0891b2] text-white' : 'bg-[#E2F4F3] text-[#0891b2]'
                }`}>
                  {wpt.fixCode}
                </span>
                <span className="text-xs font-mono font-bold text-[#0891b2]">{wpt.flightLevel}</span>
              </div>

              <div>
                <h5 className="font-bold text-xs sm:text-sm text-[#0c282d] line-clamp-1">
                  {wpt.degree}
                </h5>
                <p className="text-[11px] font-mono text-[#527d85] line-clamp-1">
                  {wpt.institution}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#527d85] pt-1 border-t border-[#B9E7E6]/40">
                <span>{wpt.period}</span>
                {isSelected && <ArrowUpRight className="w-3 h-3 text-[#0891b2]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
