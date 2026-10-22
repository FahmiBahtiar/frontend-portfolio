'use client';

import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  Camera,
  CheckCircle2,
  Calendar,
  Radio,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Navigation,
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
  legDistanceNm: number;
  courseHeading: number;
  flightPhase: string;
  fixType: 'IAF' | 'IF' | 'FAF' | 'CRZ' | 'DEST';
  degree: string;
  institution: string;
  period: string;
  status: string;
  description: string;
  tProgress: number;
  coord: [number, number, number];
}

// ── Long Scenic Mountain Corridor Path ───────────────────────────────────────
// Weaves through valleys, mountain spurs, saddle passes, and alpine ridges
export const FLIGHT_CORRIDOR_POINTS: [number, number, number][] = [
  [-5.8, 0.85, -4.2], // 0: DMK 01 Departure Lake
  [-4.2, 1.25, -1.0], // 1: West valley canyon
  [-3.2, 1.65, 2.8],  // 2: Mountain spur sweeping turn
  [-1.8, 1.95, 1.5],  // 3: DMN 02 Canyon River Pass
  [-0.4, 2.30, -2.2], // 4: North basin climbing turn
  [0.8, 2.70, 0.2],   // 5: RUS 03 Continental Divide Ridgeline
  [2.2, 3.10, 3.0],   // 6: East cirque sweeping pass
  [3.6, 3.35, 0.6],   // 7: BNR 04 Glacier Valley Waypoint
  [4.6, 3.65, -2.6],  // 8: High alpine cruising bank
  [5.8, 3.90, -0.5],  // 9: UDN 05 Summit Approach Destination
];

const DEFAULT_WAYPOINTS: WaypointLeg[] = [
  {
    id: 'wpt-01-demak',
    order: 1,
    fixCode: 'DMK 01',
    waypointName: 'DEMAK VOR',
    flightLevel: 'FL040',
    altitudeFeet: 4000,
    legDistanceNm: 28.5,
    courseHeading: 48,
    flightPhase: 'DEPARTURE & INITIAL CLIMB',
    fixType: 'IAF',
    degree: 'Elementary School',
    institution: 'MI Negeri 1 Demak',
    period: '2010 - 2018',
    status: 'Cleared & Complete',
    description:
      'Building strong academic foundation and character development. Active in journey, survival, and exploration clubs.',
    tProgress: 0.02,
    coord: [-5.8, 0.85, -4.2],
  },
  {
    id: 'wpt-02-smpn2',
    order: 2,
    fixCode: 'DMN 02',
    waypointName: 'SMPN2 FIX',
    flightLevel: 'FL120',
    altitudeFeet: 12000,
    legDistanceNm: 24.2,
    courseHeading: 58,
    flightPhase: 'EN-ROUTE MOUNTAIN PASS',
    fixType: 'IF',
    degree: 'Junior High School',
    institution: 'SMP Negeri 2 Demak',
    period: '2016 - 2019',
    status: 'Cleared & Complete',
    description:
      'Initiated programming journey and algorithmic foundations. First explorations into logic, web development, and digital problem solving.',
    tProgress: 0.34,
    coord: [-1.8, 1.95, 1.5],
  },
  {
    id: 'wpt-03-kudus',
    order: 3,
    fixCode: 'RUS 03',
    waypointName: 'KUDUS RIDGE',
    flightLevel: 'FL240',
    altitudeFeet: 24000,
    legDistanceNm: 31.0,
    courseHeading: 72,
    flightPhase: 'TRANSITION RIDGELINE',
    fixType: 'FAF',
    degree: 'Senior High School',
    institution: 'SMK Raden Umar Said Kudus',
    period: '2019 - 2022',
    status: 'Cleared & Complete',
    description:
      'Deep dive into modern software engineering, 3D graphics pipeline, animation, and responsive web applications at Raden Umar Said.',
    tProgress: 0.58,
    coord: [0.8, 2.70, 0.2],
  },
  {
    id: 'wpt-04-binar',
    order: 4,
    fixCode: 'BNR 04',
    waypointName: 'BINAR TRANSIT',
    flightLevel: 'FL320',
    altitudeFeet: 32000,
    legDistanceNm: 26.5,
    courseHeading: 84,
    flightPhase: 'HIGH ALPINE CRUISE',
    fixType: 'CRZ',
    degree: 'Djarum Foundation Scholarship',
    institution: 'Binar Academy',
    period: '2021 - 2021',
    status: 'Cleared & Complete',
    description:
      'Specialized intensive computer science scholarship. Mastery in full-stack architecture, clean code principles, and collaborative agile engineering.',
    tProgress: 0.79,
    coord: [3.6, 3.35, 0.6],
  },
  {
    id: 'wpt-05-udinus',
    order: 5,
    fixCode: 'UDN 05',
    waypointName: 'SEMARANG ILS',
    flightLevel: 'FL380',
    altitudeFeet: 38000,
    legDistanceNm: 38.0,
    courseHeading: 90,
    flightPhase: 'TERMINAL SUMMIT & ADVANCED OPS',
    fixType: 'DEST',
    degree: 'Bachelor Degree (Informatics)',
    institution: 'Dian Nuswantoro University',
    period: '2022 - 2026',
    status: 'Active En-Route',
    description:
      'Pursuing Bachelor of Computer Science. Researching distributed systems, cloud infrastructure, AI agents, and high-performance interactive 3D web technologies.',
    tProgress: 0.98,
    coord: [5.8, 3.90, -0.5],
  },
];

// Preload 3D assets
if (typeof window !== 'undefined') {
  useGLTF.preload('/models/aircraft/jet.glb');
  useGLTF.preload('/models/terrain/puncak_jaya.glb');
}

// ── Realistic 3D Mountain Terrain ───────────────────────────────────────────
function ForeFlightTerrain() {
  const gltf = useGLTF('/models/terrain/puncak_jaya.glb');

  const sceneClone = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geom = mesh.geometry.clone();
        const pos = geom.attributes.position;
        const colors: number[] = [];

        // Dynamic elevation shading: valley deep teal to rocky ridge to snow peak
        const valleyColor = new THREE.Color('#2d636f');
        const ridgeColor = new THREE.Color('#789da6');
        const snowColor = new THREE.Color('#ffffff');

        for (let i = 0; i < pos.count; i++) {
          const zNorm = THREE.MathUtils.clamp(pos.getZ(i) / 3805.3, 0, 1);
          let c: THREE.Color;
          if (zNorm < 0.45) {
            c = new THREE.Color().lerpColors(valleyColor, ridgeColor, zNorm / 0.45);
          } else {
            c = new THREE.Color().lerpColors(ridgeColor, snowColor, (zNorm - 0.45) / 0.55);
          }
          colors.push(c.r, c.g, c.b);
        }

        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        mesh.geometry = geom;
        mesh.material = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.75,
          metalness: 0.1,
          flatShading: false,
        });
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf.scene]);

  return (
    <group position={[0, -0.15, 0]}>
      {/* High-Definition Relief Shaded Mountain Mesh */}
      <primitive
        object={sceneClone}
        scale={[0.00034, 0.00034, 0.00042]}
        rotation={[-Math.PI / 2, 0, -0.22]}
      />
    </group>
  );
}

// ── Sleek Compact Waypoint Canvas Sprite (Never Balloons, Zero Network) ─────
function WaypointSprite({
  text,
  isSelected,
}: {
  text: string;
  isSelected: boolean;
}) {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 140, 48);

    // Rounded pill background
    ctx.fillStyle = isSelected ? '#0891b2' : 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = isSelected ? '#ffffff' : '#B9E7E6';
    ctx.lineWidth = 3;

    const r = 14;
    ctx.beginPath();
    ctx.moveTo(r, 3);
    ctx.lineTo(140 - r, 3);
    ctx.quadraticCurveTo(140 - 3, 3, 140 - 3, r);
    ctx.lineTo(140 - 3, 48 - r);
    ctx.quadraticCurveTo(140 - 3, 48 - 3, 140 - r, 48 - 3);
    ctx.lineTo(r, 48 - 3);
    ctx.quadraticCurveTo(3, 48 - 3, 3, 48 - r);
    ctx.lineTo(3, r);
    ctx.quadraticCurveTo(3, 3, r, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text in bold monospace
    ctx.fillStyle = isSelected ? '#ffffff' : '#0c282d';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 70, 25);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text, isSelected]);

  if (!texture) return null;

  return (
    <sprite
      position={[0, isSelected ? 0.44 : 0.34, 0]}
      scale={isSelected ? [0.62, 0.22, 1] : [0.46, 0.16, 1]}
    >
      <spriteMaterial map={texture} depthTest={false} transparent />
    </sprite>
  );
}

// ── 3D Flight Corridor Curtain (ForeFlight Vertical Terrain Projection) ─────
function ForeFlightTerrainCurtain({
  curve,
  waypoints,
  selectedIdx,
  onSelectWaypoint,
}: {
  curve: THREE.CatmullRomCurve3;
  waypoints: WaypointLeg[];
  selectedIdx: number;
  onSelectWaypoint: (idx: number) => void;
}) {
  // Generate curtain ribbon geometry connecting winding flight path down to terrain
  const curtainGeometry = useMemo(() => {
    const segments = 120;
    const points = curve.getPoints(segments);
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const topColor = new THREE.Color('#06b6d4'); // Vibrant cyan
    const bottomColor = new THREE.Color('#d946ef'); // ForeFlight magenta/purple

    const groundBaseY = 0.25;

    for (let i = 0; i <= segments; i++) {
      const pt = points[i];
      // Top vertex (flight trajectory)
      vertices.push(pt.x, pt.y, pt.z);
      colors.push(topColor.r, topColor.g, topColor.b);

      // Bottom vertex (terrain baseline)
      vertices.push(pt.x, groundBaseY, pt.z);
      colors.push(bottomColor.r, bottomColor.g, bottomColor.b);
    }

    for (let i = 0; i < segments; i++) {
      const i2 = i * 2;
      indices.push(i2, i2 + 1, i2 + 2);
      indices.push(i2 + 2, i2 + 1, i2 + 3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [curve]);

  // Corridor spline line
  const splineLineGeometry = useMemo(() => {
    const pts = curve.getPoints(160);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [curve]);

  return (
    <group>
      {/* ForeFlight Signature Vertical Projection Curtain */}
      <mesh geometry={curtainGeometry}>
        <meshBasicMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </mesh>

      {/* Luminous Top Trajectory Spline Line */}
      <primitive
        object={
          new THREE.Line(
            splineLineGeometry,
            new THREE.LineBasicMaterial({
              color: '#0891b2',
              linewidth: 4,
            })
          )
        }
      />

      {/* Sleek Checkpoints (Nav Ring Gates + Compact Micro-Badges) */}
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
            {/* 3D Glowing Nav Ring Gate (Plane flies through) */}
            <mesh rotation={[0, -THREE.MathUtils.degToRad(wpt.courseHeading - 90), 0]}>
              <torusGeometry args={[isSelected ? 0.32 : 0.24, 0.016, 16, 32]} />
              <meshBasicMaterial
                color={isSelected ? '#0891b2' : '#6FD4E1'}
                side={THREE.DoubleSide}
                transparent
                opacity={isSelected ? 0.95 : 0.55}
              />
            </mesh>

            {/* Center Beacon Node */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.08 : 0.05, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#0891b2' : '#6FD4E1'}
                emissive={isSelected ? '#0891b2' : '#6FD4E1'}
                emissiveIntensity={isSelected ? 1.0 : 0.4}
              />
            </mesh>

            {/* Slender Laser Anchor Line to Ground */}
            <line>
              <bufferGeometry
                attach="geometry"
                {...new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(0, -y + 0.25, 0),
                ])}
              />
              <lineBasicMaterial attach="material" color="#0891b2" transparent opacity={0.35} />
            </line>

            {/* Sleek Compact Micro-Badge Sprite (Physical Size, Never Balloons) */}
            <WaypointSprite text={wpt.fixCode} isSelected={isSelected} />
          </group>
        );
      })}
    </group>
  );
}

// ── 3D Aircraft with Dynamic Aerodynamic Banking ────────────────────────────
function TrackingAircraft({
  curve,
  progress,
}: {
  curve: THREE.CatmullRomCurve3;
  progress: number;
}) {
  const gltf = useGLTF('/models/aircraft/jet.glb');
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const bankRef = useRef(0);

  const sceneClone = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        // ForeFlight Signature Blue Jet Livery
        if (mesh.name === 'Object_4' || mesh.name === 'Object_24' || mesh.name === 'Object_39') {
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#0284c7', // ForeFlight Aviation Blue
            roughness: 0.25,
            metalness: 0.35,
          });
        }
      }
    });
    return clone;
  }, [gltf.scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Get position and tangent along the winding flight path
    const clampedProgress = Math.max(0.001, Math.min(0.999, progress));
    const currentPoint = curve.getPointAt(clampedProgress);
    const tangent = curve.getTangentAt(clampedProgress).normalize();

    groupRef.current.position.copy(currentPoint);

    // Look ahead along flight tangent (points local +Z forward)
    const lookTarget = currentPoint.clone().add(tangent);
    groupRef.current.lookAt(lookTarget);

    // Dynamic banking calculation (smoothly banks into turns)
    const nextProgress = Math.min(0.999, clampedProgress + 0.02);
    const nextTangent = curve.getTangentAt(nextProgress).normalize();
    const crossY = tangent.x * nextTangent.z - tangent.z * nextTangent.x;
    const targetBankRad = THREE.MathUtils.clamp(crossY * 65, -0.65, 0.65);

    // Smoothly interpolate banking roll around forward axis into the turn
    bankRef.current = THREE.MathUtils.damp(bankRef.current, targetBankRad, 4.5, delta);

    if (meshRef.current) {
      meshRef.current.rotation.z = bankRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        {/*
          Orientation Fix:
          jet.glb nose is at local -X, top is at +Y.
          Rotating by +Math.PI/2 (+90 deg) rotates -X into +Z (forward)!
          Top (+Y) stays UP (cockpit right side up, wings horizontal along X).
        */}
        <primitive
          object={sceneClone}
          scale={[0.042, 0.042, 0.042]}
          rotation={[0, Math.PI / 2, 0]}
        />

        {/* Twin Engine Contrail Trails positioned behind engines */}
        <group position={[-0.32, -0.02, -0.75]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.07, 1.4, 8]} />
            <meshBasicMaterial color="#6FD4E1" transparent opacity={0.5} />
          </mesh>
        </group>
        <group position={[0.32, -0.02, -0.75]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.07, 1.4, 8]} />
            <meshBasicMaterial color="#6FD4E1" transparent opacity={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ── Camera Controller (Chase vs Free Orbit) ─────────────────────────────────
function CameraFollower({
  curve,
  progress,
  cameraMode,
}: {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  cameraMode: 'chase' | 'orbit';
}) {
  const controlsRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useFrame((state, delta) => {
    const clampedProgress = Math.max(0.001, Math.min(0.999, progress));
    const currentPoint = curve.getPointAt(clampedProgress);
    const tangent = curve.getTangentAt(clampedProgress).normalize();

    if (cameraMode === 'chase') {
      // ForeFlight elevated chase camera gliding smoothly behind the jet
      const desiredPos = currentPoint.clone()
        .sub(tangent.clone().multiplyScalar(3.6))
        .add(new THREE.Vector3(0, 1.4, 0));

      state.camera.position.lerp(desiredPos, delta * 3.5);
      state.camera.lookAt(currentPoint.clone().add(tangent.clone().multiplyScalar(1.6)));
    }
  });

  if (cameraMode === 'orbit') {
    return (
      <OrbitControls
        ref={controlsRef}
        target={[0, 1.2, 0]}
        enablePan={false}
        minDistance={2.5}
        maxDistance={16}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    );
  }

  return null;
}

// ── 2.5D SVG Synthetic Vision Fallback ───────────────────────────────────────
function ForeFlightSvgFallback({
  waypoints,
  selectedIdx,
  progress,
  onSelectWaypoint,
}: {
  waypoints: WaypointLeg[];
  selectedIdx: number;
  progress: number;
  onSelectWaypoint: (idx: number) => void;
}) {
  const currentWpt = waypoints[selectedIdx];
  const aircraftX = 100 + progress * 600;
  const aircraftY = 380 - progress * 250;

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4 sm:p-6 select-none bg-gradient-to-b from-[#E2F4F3]/70 via-white to-[#F2FBFB] overflow-hidden">
      <svg viewBox="0 0 800 480" className="w-full h-full max-h-[460px]" fill="none">
        <defs>
          <linearGradient id="curtainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6FD4E1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="mountainBase" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#E2F4F3" />
            <stop offset="100%" stopColor="#B9E7E6" />
          </linearGradient>
        </defs>

        {/* Mountain Valley Silhouettes */}
        <path d="M 40 440 Q 220 300 400 390 Q 580 260 760 440 Z" fill="url(#mountainBase)" opacity="0.6" />
        <path d="M 0 440 Q 280 340 500 420 Q 650 320 800 440 Z" fill="url(#mountainBase)" opacity="0.4" />

        {/* Vertical Projection Curtain */}
        <path
          d="M 100 380 Q 250 320 400 240 T 700 130 L 700 420 L 100 420 Z"
          fill="url(#curtainGrad)"
        />

        {/* Flight Trajectory Spline Line */}
        <path
          d="M 100 380 Q 250 320 400 240 T 700 130"
          stroke="#0891b2"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Waypoints */}
        {waypoints.map((wpt, idx) => {
          const coords = [
            [100, 380],
            [230, 325],
            [370, 260],
            [520, 195],
            [680, 135],
          ];
          const [cx, cy] = coords[idx];
          const isSelected = idx === selectedIdx;

          return (
            <g
              key={wpt.id}
              onClick={() => onSelectWaypoint(idx)}
              className="cursor-pointer group"
            >
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 8 : 5}
                fill={isSelected ? '#0891b2' : '#FFFFFF'}
                stroke={isSelected ? '#FFFFFF' : '#0891b2'}
                strokeWidth={2}
              />
              <line x1={cx} y1={cy} x2={cx} y2={420} stroke="#0891b2" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              <text
                x={cx + 12}
                y={cy + 4}
                fill="#0c282d"
                fontFamily="monospace"
                fontSize={isSelected ? '12' : '10'}
                fontWeight={isSelected ? 'bold' : 'normal'}
              >
                {wpt.fixCode} ({wpt.altitudeFeet.toLocaleString()}&apos;)
              </text>
            </g>
          );
        })}

        {/* Live Aircraft Symbol */}
        <g transform={`translate(${aircraftX}, ${aircraftY})`}>
          <circle cx="0" cy="0" r="14" fill="#0891b2" fillOpacity="0.2" className="animate-ping" />
          <circle cx="0" cy="0" r="8" fill="#0891b2" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M -12 0 L 12 0 M 0 -12 L 0 12" stroke="#0891b2" strokeWidth="1.5" />
          <text x="14" y="4" fill="#0891b2" fontFamily="monospace" fontSize="11" fontWeight="bold">
            {currentWpt.fixCode} • {Math.round(4000 + progress * 34000).toLocaleString()}&apos; MSL
          </text>
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progress, setProgress] = useState(0.02);
  const [cameraMode, setCameraMode] = useState<'chase' | 'orbit'>('chase');

  const [webGLSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  // Merge dynamic education records
  const waypoints = useMemo(() => {
    const raw =
      educationRecords && educationRecords.length > 0
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

  // Construct long, winding 3D flight trajectory curve through mountain valleys
  const curve = useMemo(() => {
    const points = FLIGHT_CORRIDOR_POINTS.map((p) => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3);
  }, []);

  // Active tracking playback loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        const next = prev + delta * 0.04 * playbackSpeed;
        if (next >= 0.999) return 0.001; // Loop back smoothly
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  // Auto-sync selected milestone based on flight progress
  useEffect(() => {
    for (let i = waypoints.length - 1; i >= 0; i--) {
      if (progress >= waypoints[i].tProgress - 0.06) {
        setSelectedIdx(i);
        break;
      }
    }
  }, [progress, waypoints]);

  const currentWpt = waypoints[selectedIdx];
  const liveAltitude = Math.round(4000 + progress * 34000);
  const liveSpeedKnots = Math.round(180 + progress * 270);

  const handleSelectWaypoint = (idx: number) => {
    setSelectedIdx(idx);
    setProgress(waypoints[idx].tProgress);
  };

  const handlePrev = () => {
    const nextIdx = selectedIdx > 0 ? selectedIdx - 1 : waypoints.length - 1;
    handleSelectWaypoint(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = selectedIdx < waypoints.length - 1 ? selectedIdx + 1 : 0;
    handleSelectWaypoint(nextIdx);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Main 3D ForeFlight Stage & EFB Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 3D Synthetic Vision Viewport (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-[#B9E7E6] bg-gradient-to-b from-[#F2FBFB] via-white to-[#E2F4F3]/40 overflow-hidden shadow-xl relative min-h-[480px] md:min-h-[560px] flex flex-col">
          {/* Top ForeFlight Header Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Live Altitude MSL Pill (ForeFlight Signature) */}
            <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#B9E7E6] px-3.5 py-1.5 rounded-full shadow-sm text-xs font-mono text-[#0c282d]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#0891b2] text-sm">
                {liveAltitude.toLocaleString()}&apos; ALT MSL
              </span>
              <span className="text-[#527d85] hidden sm:inline">•</span>
              <span className="text-[#527d85] hidden sm:inline">{liveSpeedKnots} KT GS</span>
            </div>

            {/* Route Header Badge */}
            <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#B9E7E6] px-3.5 py-1.5 rounded-full shadow-sm text-xs font-mono text-[#2d5f68]">
              <Navigation className="w-3.5 h-3.5 text-[#0891b2]" />
              <span className="font-bold text-[#0c282d]">DMK ➔ UDN</span>
              <span className="text-[#527d85] hidden md:inline">• 3D ROUTE PREVIEW</span>
            </div>
          </div>

          {/* 3D Canvas / Synthetic Vision */}
          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing min-h-[400px]">
            {webGLSupported ? (
              <Canvas
                shadows
                camera={{ position: [5.5, 4.2, 8.5], fov: 46, near: 0.1, far: 100 }}
                dpr={[1, 2]}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
              >
                <color attach="background" args={['#dff2f5']} />
                <ambientLight intensity={0.75} />
                <directionalLight position={[12, 16, 9]} intensity={1.3} castShadow />
                <directionalLight position={[-9, 6, -6]} intensity={0.5} />

                <Suspense fallback={null}>
                  {/* 3D Realistic Mountain Valley Terrain */}
                  <ForeFlightTerrain />

                  {/* Vertical Projection Curtain (ForeFlight Signature) */}
                  <ForeFlightTerrainCurtain
                    curve={curve}
                    waypoints={waypoints}
                    selectedIdx={selectedIdx}
                    onSelectWaypoint={handleSelectWaypoint}
                  />

                  {/* Moving 3D Aircraft with Dynamic Banking */}
                  <TrackingAircraft curve={curve} progress={progress} />
                </Suspense>

                {/* Camera Follower & Orbit Controls */}
                <CameraFollower
                  curve={curve}
                  progress={progress}
                  cameraMode={cameraMode}
                />
              </Canvas>
            ) : (
              <ForeFlightSvgFallback
                waypoints={waypoints}
                selectedIdx={selectedIdx}
                progress={progress}
                onSelectWaypoint={handleSelectWaypoint}
              />
            )}
          </div>

          {/* Bottom Flight Tracking Playback Scrubber (ForeFlight Controller) */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-[#B9E7E6] p-3 sm:p-3.5 rounded-2xl shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              {/* Play / Pause Button */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="border-[#B9E7E6] text-[#0891b2] hover:bg-[#E2F4F3] font-mono text-xs rounded-xl h-8 px-3"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1 fill-current" />
                      PAUSE
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      TRACK
                    </>
                  )}
                </Button>

                {/* Speed Multiplier */}
                <div className="flex items-center gap-1 bg-[#E2F4F3]/60 p-0.5 rounded-lg border border-[#B9E7E6]/60">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                        playbackSpeed === spd
                          ? 'bg-[#0891b2] text-white'
                          : 'text-[#2d5f68] hover:bg-white/80'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera Mode Toggle */}
              <button
                onClick={() => setCameraMode(cameraMode === 'chase' ? 'orbit' : 'chase')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-[#B9E7E6] bg-white text-[#2d5f68] hover:bg-[#E2F4F3] font-mono text-xs font-semibold shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-[#0891b2]" />
                <span className="hidden sm:inline">VIEW:</span>
                <span className="font-bold text-[#0891b2]">
                  {cameraMode === 'chase' ? 'CHASE CAM' : 'FREE ORBIT'}
                </span>
              </button>
            </div>

            {/* Draggable Progress Scrubber */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#527d85] font-semibold">0%</span>
              <input
                type="range"
                min="0.001"
                max="0.999"
                step="0.001"
                value={progress}
                onChange={(e) => {
                  setProgress(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="flex-1 accent-[#0891b2] cursor-pointer h-1.5 bg-[#B9E7E6] rounded-lg"
              />
              <span className="font-mono text-[10px] text-[#527d85] font-semibold">100%</span>
            </div>
          </div>
        </div>

        {/* Right ForeFlight Route Drawer & Master Detail EFB (5 Cols) */}
        <Card className="lg:col-span-5 rounded-3xl border border-[#B9E7E6] bg-white shadow-xl flex flex-col justify-between overflow-hidden">
          <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full gap-6">
            <div className="flex flex-col gap-4">
              {/* Header Fix & Route Progress */}
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

              {/* Waypoint Phase & Altitude */}
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

              {/* Flight Period */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E2F4F3]/70 border border-[#B9E7E6] text-[#0c282d] font-mono text-xs w-fit">
                <Calendar className="w-3.5 h-3.5 text-[#0891b2]" />
                <span>FLIGHT PERIOD: {currentWpt.period}</span>
              </div>

              {/* Narrative Description (Zero Truncation) */}
              <div className="bg-[#F8FCFC] border border-[#B9E7E6]/80 rounded-2xl p-4 text-[#2d5f68] text-sm leading-relaxed">
                {currentWpt.description}
              </div>

              {/* ForeFlight Leg Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="rounded-xl border border-[#B9E7E6] bg-white p-2.5 flex flex-col">
                  <span className="text-[10px] font-mono text-[#527d85]">LEG DISTANCE</span>
                  <span className="text-sm font-mono font-bold text-[#0c282d]">
                    {currentWpt.legDistanceNm} NM
                  </span>
                </div>
                <div className="rounded-xl border border-[#B9E7E6] bg-white p-2.5 flex flex-col">
                  <span className="text-[10px] font-mono text-[#527d85]">FIX TYPE</span>
                  <span className="text-sm font-mono font-bold text-[#0891b2]">
                    {currentWpt.fixType}
                  </span>
                </div>
                <div className="rounded-xl border border-[#B9E7E6] bg-white p-2.5 flex flex-col">
                  <span className="text-[10px] font-mono text-[#527d85]">BEARING</span>
                  <span className="text-sm font-mono font-bold text-[#0c282d]">
                    {String(currentWpt.courseHeading).padStart(3, '0')}°
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="pt-4 border-t border-[#B9E7E6]/60 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="border-[#B9E7E6] text-[#0c282d] hover:bg-[#E2F4F3] font-mono text-xs rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1 text-[#0891b2]" />
                Prev Fix
              </Button>

              {/* 5-Step Waypoint Indicator */}
              <div className="flex items-center gap-1.5">
                {waypoints.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectWaypoint(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === selectedIdx
                        ? 'w-6 bg-[#0891b2]'
                        : 'w-2 bg-[#B9E7E6] hover:bg-[#6FD4E1]'
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
                Next Fix
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
              onClick={() => handleSelectWaypoint(idx)}
              className={`rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-300 border flex flex-col justify-between gap-2 shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-br from-[#6FD4E1]/30 via-[#B9E7E6]/40 to-white border-[#0891b2] ring-2 ring-[#0891b2]/30 scale-[1.02]'
                  : 'bg-white/80 hover:bg-[#E2F4F3]/50 border-[#B9E7E6] text-[#2d5f68]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#0891b2] text-white' : 'bg-[#E2F4F3] text-[#0891b2]'
                  }`}
                >
                  {wpt.fixCode}
                </span>
                <span className="text-xs font-mono font-bold text-[#0891b2]">
                  {wpt.flightLevel}
                </span>
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
