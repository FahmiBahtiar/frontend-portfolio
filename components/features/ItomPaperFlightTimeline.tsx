'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Calendar,
  Award,
  Sparkles,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Education } from '@/lib/types/admin';
import { FALLBACK_EDUCATION_RECORDS } from '@/lib/fallback-data';

// ── Cloud Texture Assets (from itomdev.com/about) ───────────────────────────
const CLOUD_TEXTURES = [
  '/textures/clouds/1131c3eb-dfae-423f-924b-ff39d8ccd6dc.webp',
  '/textures/clouds/254b8ec8-d6f7-4275-956f-7bab65b2ce2d.webp',
  '/textures/clouds/2cc88dd1-483c-466d-b07e-f8308c61ccbe.webp',
  '/textures/clouds/5606fcc0-3252-447d-a58a-7bcbac73229a.webp',
  '/textures/clouds/7882dc72-3d01-41fb-ac0e-d07b0184ebc1.webp',
  '/textures/clouds/9b2ca72f-7bd0-473b-ba6e-dd9e0eb79d35.webp',
  '/textures/clouds/c83293c6-d90c-4a32-8d9d-5ac9af7e2296.webp',
  '/textures/clouds/f6e358bc-d27c-41dd-95f4-6787a835c41e.webp',
];

const CLOUD_ASPECT_RATIOS: Record<string, number> = {
  '1131c3eb-dfae-423f-924b-ff39d8ccd6dc.webp': 1.894,
  '254b8ec8-d6f7-4275-956f-7bab65b2ce2d.webp': 2.459,
  '2cc88dd1-483c-466d-b07e-f8308c61ccbe.webp': 3.577,
  '5606fcc0-3252-447d-a58a-7bcbac73229a.webp': 1.794,
  '7882dc72-3d01-41fb-ac0e-d07b0184ebc1.webp': 1.997,
  '9b2ca72f-7bd0-473b-ba6e-dd9e0eb79d35.webp': 1.905,
  'c83293c6-d90c-4a32-8d9d-5ac9af7e2296.webp': 3.0,
  'f6e358bc-d27c-41dd-95f4-6787a835c41e.webp': 1.875,
};

// ── Milestone Structure ─────────────────────────────────────────────────────
export interface ItomMilestone {
  id: string;
  order: number;
  fixCode: string;
  zDistance: number; // Z position in world space
  degree: string;
  institution: string;
  period: string;
  highlight: string;
  description: string;
  color: string;
}

export const DEFAULT_ITOM_MILESTONES: ItomMilestone[] = [
  {
    id: 'c6de5eac-280b-420d-a48f-31bb5d36e729',
    order: 1,
    fixCode: 'DMK 01',
    zDistance: -18,
    degree: 'Elementary School',
    institution: 'MI Negeri 1 Demak',
    period: '2010 – 2018',
    highlight: 'Top 10 Student',
    description:
      'Building strong academic foundation and character development. Active in journey and survival club, sparking a lifelong fascination with aviation, mathematics, and exploration.',
    color: '#0891b2',
  },
  {
    id: '03e13fb8-0688-4df4-b2fc-7f287b8ddabb',
    order: 2,
    fixCode: 'DMN 02',
    zDistance: -58,
    degree: 'Junior High School',
    institution: 'SMP Negeri 2 Demak',
    period: '2016 – 2019',
    highlight: 'Honor Roll Graduate',
    description:
      'Initiated self-taught programming journey with fundamental algorithms, logic systems, and early software experiments while consistently maintaining academic excellence.',
    color: '#059669',
  },
  {
    id: '12495985-a7eb-4fd9-a7d2-273c9d7028db',
    order: 3,
    fixCode: 'BNR 03',
    zDistance: -98,
    degree: 'Tech Scholarship',
    institution: 'Binar Academy',
    period: '2021 – 2021',
    highlight: 'Djarum Foundation Scholar',
    description:
      'Awarded prestigious Djarum Foundation scholarship for intensive full-stack engineering, studying agile paradigms, cloud architectures, and modern web application development.',
    color: '#d97706',
  },
  {
    id: '41f518cd-38da-4d95-8314-5c943a55d10e',
    order: 4,
    fixCode: 'RUS 04',
    zDistance: -138,
    degree: 'Vocational High School',
    institution: 'SMK Raden Umar Said',
    period: '2019 – 2022',
    highlight: 'Software Engineering Major',
    description:
      'Graduated from the renowned creative and tech academy SMK Raden Umar Said. Specialized in backend infrastructure, relational databases, security models, and high-performance APIs.',
    color: '#7c3aed',
  },
  {
    id: '691a3904-f1ba-440d-a650-f77e17c495c2',
    order: 5,
    fixCode: 'UDN 05',
    zDistance: -178,
    degree: 'Bachelor of Computer Science',
    institution: 'Dian Nuswantoro University',
    period: '2022 – 2026',
    highlight: 'Active • Informatics Engineering',
    description:
      'Pursuing Bachelor Degree in Informatics Engineering with focus on distributed systems, data science, and cloud networking. Merging aviation telemetry with autonomous AI pipelines.',
    color: '#2563eb',
  },
];

// ── Authentic ITom Low-Poly Origami Paper Airplane ───────────────────────────
function PaperAirplane({
  color = '#fcfbfa',
  scale = 0.95,
}: {
  color?: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Exact BufferGeometry from ITomPoland/portfolio-itom/PaperAirplane.jsx
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Main Body Top
      0, 0, -1.6,          // 0: Nose tip
      -1.25, 0.06, 0.35,   // 1: Left wing tip
      1.25, 0.06, 0.35,    // 2: Right wing tip
      0, 0.16, -0.5,       // 3: Front crease fold
      0, 0.13, 0.55,       // 4: Back crease fold
      -0.32, 0.09, 0.85,   // 5: Left tail
      0.32, 0.09, 0.85,    // 6: Right tail
      0, 0.11, 0.65,       // 7: Tail center top
      // Underside
      0, -0.02, -1.6,      // 8: Nose bottom
      -1.25, -0.02, 0.35,  // 9: Left wing bottom
      1.25, -0.02, 0.35,   // 10: Right wing bottom
      0, 0, 0.55,          // 11: Tail bottom
    ]);

    const indices = [
      // Top surface
      0, 1, 3,  1, 4, 3,  1, 5, 4,  5, 7, 4,
      0, 3, 2,  3, 4, 2,  4, 6, 2,  4, 7, 6,
      // Bottom surface
      8, 11, 9,  8, 10, 11,
      // Side connections
      0, 8, 1,  8, 9, 1,  1, 9, 5,
      0, 2, 8,  8, 2, 10,  2, 6, 10,
      5, 9, 11,  5, 11, 7,
      6, 7, 11,  6, 11, 10,
    ];

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group scale={scale}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
        {/* Origami fold edge outlines */}
        <Edges linewidth={2} threshold={15} color="#444444" />
      </mesh>

      {/* Center spine ridge fold line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                0, 0, -1.6,
                0, 0.16, -0.5,
                0, 0.13, 0.55,
                0, 0.11, 0.65,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#444444" linewidth={2} />
      </line>
    </group>
  );
}

// ── In-Sky 3D CanvasTexture Milestone Banner (Instant Zero-Network) ──────────
function InSkyMilestoneGate({
  milestone,
  scrollRef,
  onSelect,
}: {
  milestone: ItomMilestone;
  scrollRef: React.MutableRefObject<number>;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bannerMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const currentOpacity = useRef(0);

  // Generate crisp 2D canvas texture with dashed border & typography
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 640, 360);

    // Sketch card background with dashed outline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = milestone.color;
    ctx.lineWidth = 5;
    ctx.setLineDash([14, 8]);

    const r = 28;
    ctx.beginPath();
    ctx.moveTo(r, 8);
    ctx.lineTo(640 - r, 8);
    ctx.quadraticCurveTo(640 - 8, 8, 640 - 8, r);
    ctx.lineTo(640 - 8, 360 - r);
    ctx.quadraticCurveTo(640 - 8, 360 - 8, 640 - r, 360 - 8);
    ctx.lineTo(r, 360 - 8);
    ctx.quadraticCurveTo(8, 360 - 8, 8, 360 - r);
    ctx.lineTo(8, r);
    ctx.quadraticCurveTo(8, 8, r, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Checkpoint Tag
    ctx.setLineDash([]);
    ctx.fillStyle = milestone.color;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `CHECKPOINT #${milestone.order.toString().padStart(2, '0')} • ${milestone.fixCode}`,
      320,
      54
    );

    // Main Institution Title
    ctx.fillStyle = '#0c282d';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(milestone.institution, 320, 118);

    // Degree & Period
    ctx.fillStyle = '#2d5f68';
    ctx.font = '600 24px sans-serif';
    ctx.fillText(`${milestone.degree} (${milestone.period})`, 320, 170);

    // Highlight Honor Box
    ctx.fillStyle = '#E2F4F3';
    ctx.fillRect(140, 208, 360, 44);
    ctx.strokeStyle = '#B9E7E6';
    ctx.lineWidth = 2;
    ctx.strokeRect(140, 208, 360, 44);

    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`★ ${milestone.highlight}`, 320, 237);

    // Narrative preview
    ctx.fillStyle = '#527d85';
    ctx.font = '18px sans-serif';
    const preview =
      milestone.description.length > 56
        ? milestone.description.slice(0, 56) + '...'
        : milestone.description;
    ctx.fillText(preview, 320, 296);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [milestone]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const scrollZ = scrollRef.current || 0;
    // Relative distance to camera
    const relZ = scrollZ + milestone.zDistance;

    // Smooth proximity fade (ITom StoryMilestone.jsx formula)
    let targetOp = 0;
    if (relZ < -55) {
      targetOp = 0;
    } else if (relZ >= -55 && relZ <= -20) {
      targetOp = (relZ - -55) / 35;
    } else if (relZ > -20 && relZ < -4) {
      targetOp = 1.0;
    } else if (relZ >= -4 && relZ <= 8) {
      targetOp = 1.0 - (relZ - -4) / 12;
    } else {
      targetOp = 0;
    }

    currentOpacity.current = THREE.MathUtils.damp(
      currentOpacity.current,
      Math.max(0, Math.min(1, targetOp)),
      6.0,
      delta
    );

    const op = currentOpacity.current;
    const s = 0.85 + op * 0.18;
    groupRef.current.scale.set(s, s, s);

    if (bannerMatRef.current) bannerMatRef.current.opacity = op * 0.95;
    if (ringMatRef.current) ringMatRef.current.opacity = op * 0.75;
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0.45, milestone.zDistance]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* 3D Nav Ring Gate (Plane flies through) */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.2, 0.035, 16, 48]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={milestone.color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2D Canvas Texture Milestone Banner */}
      {texture && (
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[6.4, 3.6]} />
          <meshBasicMaterial
            ref={bannerMatRef}
            map={texture}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// ── Single Floating Cloud (Non-Suspending Direct Texture Loading) ─────────────
function SingleCloud({
  position,
  scale = 1.0,
  baseOpacity = 0.75,
  texture,
  fileName,
  driftSpeed = 0.5,
  driftAmount = 0.8,
  bobAmount = 0.15,
  timeOffset = 0,
  scrollRef,
}: {
  position: [number, number, number];
  scale?: number;
  baseOpacity?: number;
  texture: THREE.Texture;
  fileName: string;
  driftSpeed?: number;
  driftAmount?: number;
  bobAmount?: number;
  timeOffset?: number;
  scrollRef: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const basePos = useRef(position);

  const aspect = CLOUD_ASPECT_RATIOS[fileName] || 2.0;
  const width = 3.8 * scale;
  const height = width / aspect;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const currentScroll = scrollRef.current || 0;

    // World Z position relative to camera
    const worldZ = currentScroll + basePos.current[2];

    // ITom Cloud Evasion: As clouds approach camera, they glide outward to clear flight view
    const evasionStart = -45;
    const evasionEnd = -6;
    let evasionFactor = 0;

    if (worldZ > evasionStart && worldZ < evasionEnd) {
      evasionFactor = (worldZ - evasionStart) / (evasionEnd - evasionStart);
      evasionFactor = evasionFactor * evasionFactor * (3 - 2 * evasionFactor);
    } else if (worldZ >= evasionEnd) {
      evasionFactor = 1;
    }

    const dirX = basePos.current[0] >= 0 ? 1 : -1;
    const evasionX = evasionFactor * 8.5 * dirX;

    // Organic drift & bobbing
    const driftX = Math.sin(time * driftSpeed + timeOffset) * driftAmount;
    const driftY = Math.sin(time * driftSpeed * 0.7 + timeOffset + 1.5) * bobAmount;

    meshRef.current.position.x = basePos.current[0] + driftX + evasionX;
    meshRef.current.position.y = basePos.current[1] + driftY;
    meshRef.current.position.z = basePos.current[2];

    // Fade out smoothly once cloud passes behind camera
    if (materialRef.current) {
      if (worldZ > -1) {
        materialRef.current.opacity = Math.max(0, baseOpacity * (1 - (worldZ + 1) / 8));
      } else if (worldZ < -160) {
        materialRef.current.opacity = Math.max(0, baseOpacity * (1 - (-160 - worldZ) / 40));
      } else {
        materialRef.current.opacity = baseOpacity;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={baseOpacity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Infinite Sky World (Clouds + Story Milestones + Moving Group) ─────────────
function InfiniteSkyWorld({
  milestones,
  scrollRef,
  onSelectMilestone,
}: {
  milestones: ItomMilestone[];
  scrollRef: React.MutableRefObject<number>;
  onSelectMilestone: (idx: number) => void;
}) {
  const worldGroupRef = useRef<THREE.Group>(null);

  // Synchronous texture loading via THREE.TextureLoader (NEVER suspends)
  const textures = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const loader = new THREE.TextureLoader();
    return CLOUD_TEXTURES.map((url) => {
      const tex = loader.load(url);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      return tex;
    });
  }, []);

  // Generate repeatable cloud layout matching ITom SkyChunk
  const cloudList = useMemo(() => {
    const list: Array<{
      id: string;
      position: [number, number, number];
      scale: number;
      texIndex: number;
      baseOpacity: number;
      driftSpeed: number;
      driftAmount: number;
      bobAmount: number;
      timeOffset: number;
    }> = [];

    // Distribute clouds along Z = 0 down to -220
    const totalZSegments = 11;
    for (let seg = 0; seg < totalZSegments; seg++) {
      const segZ = -seg * 20 - 5;
      const countInSeg = 4;
      for (let i = 0; i < countInSeg; i++) {
        const seed = seg * 17 + i * 31;
        const xSide = (i % 2 === 0 ? 1 : -1) * (3.6 + ((seed % 10) / 10) * 5.2);
        const yHeight = -2.4 + ((seed * 7) % 10) * 0.6;
        const zPos = segZ - ((seed * 3) % 15);
        const texIdx = (seg + i) % CLOUD_TEXTURES.length;

        list.push({
          id: `cloud-${seg}-${i}`,
          position: [xSide, yHeight, zPos],
          scale: 0.95 + ((seed % 5) / 5) * 0.75,
          texIndex: texIdx,
          baseOpacity: 0.65 + ((seed % 4) / 4) * 0.25,
          driftSpeed: 0.35 + ((seed % 3) / 3) * 0.4,
          driftAmount: 0.4 + ((seed % 6) / 6) * 0.6,
          bobAmount: 0.1 + ((seed % 4) / 4) * 0.15,
          timeOffset: (seed % 10) * 0.6,
        });
      }
    }
    return list;
  }, []);

  useFrame(() => {
    if (worldGroupRef.current) {
      // Move entire world group toward camera with scroll progress!
      worldGroupRef.current.position.z = scrollRef.current || 0;
    }
  });

  return (
    <group ref={worldGroupRef}>
      {/* 3D Story Milestone Gates */}
      {milestones.map((m, idx) => (
        <InSkyMilestoneGate
          key={m.id}
          milestone={m}
          scrollRef={scrollRef}
          onSelect={() => onSelectMilestone(idx)}
        />
      ))}

      {/* Floating Paper Clouds */}
      {textures.length > 0 &&
        cloudList.map((c) => (
          <SingleCloud
            key={c.id}
            position={c.position}
            scale={c.scale}
            baseOpacity={c.baseOpacity}
            texture={textures[c.texIndex]}
            fileName={CLOUD_TEXTURES[c.texIndex].split('/').pop() || ''}
            driftSpeed={c.driftSpeed}
            driftAmount={c.driftAmount}
            bobAmount={c.bobAmount}
            timeOffset={c.timeOffset}
            scrollRef={scrollRef}
          />
        ))}
    </group>
  );
}

// ── Flight Cockpit Rig (Camera + Maneuvering Paper Airplane) ─────────────────
function CockpitFlightRig({
  scrollRef,
  scrollVelocityRef,
}: {
  scrollRef: React.MutableRefObject<number>;
  scrollVelocityRef: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const airplaneRef = useRef<THREE.Group>(null);
  const currentBank = useRef(0);
  const currentPitch = useRef(0);

  useFrame((state, delta) => {
    const scrollZ = scrollRef.current || 0;
    const vel = scrollVelocityRef.current || 0;
    const time = state.clock.elapsedTime;

    // Chunk progress (0 to 1 every 40 units)
    const chunkProgress = (((scrollZ % 40) + 40) % 40) / 40;

    // Dynamic flight banking & pitching maneuver curve (matches ITom AboutRoom.jsx)
    let bankAngle = Math.sin(chunkProgress * Math.PI * 2) * 0.15;
    let pitchAngle = Math.sin(chunkProgress * Math.PI * 4) * 0.06;

    // React to manual scrolling velocity
    const velInfluence = Math.max(-0.25, Math.min(0.25, vel * 0.04));
    pitchAngle += velInfluence;

    // Smooth lerp for buttery momentum
    currentBank.current = THREE.MathUtils.damp(currentBank.current, bankAngle, 4.0, delta);
    currentPitch.current = THREE.MathUtils.damp(currentPitch.current, pitchAngle, 4.0, delta);

    // Apply subtle camera flight rotation
    camera.rotation.z = currentBank.current * 0.6;
    camera.rotation.x = currentPitch.current * 0.8;

    // Maneuver paper airplane in front of camera
    if (airplaneRef.current) {
      // Gentle swaying flight float
      const idleFloatY = Math.sin(time * 2.2) * 0.035;
      const idleFloatX = Math.sin(time * 1.4) * 0.04;

      airplaneRef.current.position.y = -0.15 + idleFloatY;
      airplaneRef.current.position.x = idleFloatX;

      // Authentic ITom paper airplane banking
      airplaneRef.current.rotation.x = currentPitch.current * 3.2 + 0.08;
      airplaneRef.current.rotation.z = -currentBank.current * 2.4;
      airplaneRef.current.rotation.y = -currentBank.current * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Paper airplane soaring right in front of camera view */}
      <group ref={airplaneRef} position={[0, -0.15, 0]}>
        <PaperAirplane color="#fcfbfa" scale={0.92} />
      </group>
    </group>
  );
}

// ── 2.5D Fallback for Non-WebGL Environments ─────────────────────────────────
function ItomSvgFallback({
  milestones,
  selectedIdx,
  onSelect,
}: {
  milestones: ItomMilestone[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) {
  const current = milestones[selectedIdx];

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden bg-[#87CEEB]">
      <div className="relative z-10 max-w-lg bg-white/95 p-6 rounded-2xl border-2 border-dashed border-[#0891b2] shadow-lg">
        <Badge className="bg-[#E2F4F3] text-[#0891b2] border border-[#B9E7E6] mb-3 font-mono">
          CHECKPOINT #{current.order.toString().padStart(2, '0')} • {current.period}
        </Badge>
        <h2 className="text-3xl font-serif font-bold text-[#0c282d] mb-1">
          {current.institution}
        </h2>
        <p className="text-sm font-semibold text-[#0891b2] mb-3">
          {current.degree} • ★ {current.highlight}
        </p>
        <p className="text-xs sm:text-sm text-[#2d5f68] leading-relaxed">
          {current.description}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-2">
        {milestones.map((m, i) => (
          <button
            key={m.id}
            onClick={() => onSelect(i)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
              i === selectedIdx
                ? 'bg-[#0891b2] text-white shadow-md'
                : 'bg-white/80 text-[#2d5f68] hover:bg-white'
            }`}
          >
            {m.fixCode}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Master Component: ItomPaperFlightTimeline ────────────────────────────────
export function ItomPaperFlightTimeline({
  educationRecords,
}: {
  educationRecords?: Education[];
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Momentum-based scroll system (exact physics from ITom AboutRoom.jsx)
  const scrollRef = useRef<number>(18); // Start at Milestone 1 (-18 -> scroll = 18)
  const scrollVelocityRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [webGLSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  // Merge dynamic database records with ITom milestones
  const milestones: ItomMilestone[] = useMemo(() => {
    const raw =
      educationRecords && educationRecords.length > 0
        ? educationRecords
        : FALLBACK_EDUCATION_RECORDS;

    return DEFAULT_ITOM_MILESTONES.map((m, idx) => {
      const matched = raw[idx];
      if (!matched) return m;
      return {
        ...m,
        degree: matched.degree || m.degree,
        institution: matched.institution || m.institution,
        period: matched.period || m.period,
        highlight: matched.gpa || m.highlight,
        description: matched.description || m.description,
      };
    });
  }, [educationRecords]);

  // Handle wheel scrolling over the canvas container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.025;
      scrollVelocityRef.current += delta;
      scrollVelocityRef.current = Math.max(-4.5, Math.min(4.5, scrollVelocityRef.current));
      setIsPlaying(false);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Momentum & Auto-Flight Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Autoplay cruise
      if (isPlaying) {
        scrollRef.current += delta * 12.0;
        // Loop back to start after milestone 5
        if (scrollRef.current > 195) {
          scrollRef.current = 15;
        }
      }

      // Momentum deceleration
      scrollRef.current += scrollVelocityRef.current * delta * 60;
      scrollVelocityRef.current *= 0.94; // Friction
      if (Math.abs(scrollVelocityRef.current) < 0.002) {
        scrollVelocityRef.current = 0;
      }

      // Bound flight range (Milestone 1 at ~18 to Milestone 5 at ~180)
      if (scrollRef.current < 5) scrollRef.current = 5;
      if (scrollRef.current > 200) scrollRef.current = 200;

      // Identify closest active milestone
      const currentScroll = scrollRef.current;
      let closestIdx = 0;
      let minDiff = Infinity;

      milestones.forEach((m, idx) => {
        const diff = Math.abs(currentScroll - Math.abs(m.zDistance));
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      setSelectedIdx(closestIdx);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, milestones]);

  const currentMilestone = milestones[selectedIdx];

  // Navigate to specific milestone
  const handleSelectMilestone = useCallback(
    (idx: number) => {
      setSelectedIdx(idx);
      scrollRef.current = Math.abs(milestones[idx].zDistance);
      scrollVelocityRef.current = 0;
      setIsPlaying(false);
    },
    [milestones]
  );

  const handleNext = () => {
    const nextIdx = selectedIdx < milestones.length - 1 ? selectedIdx + 1 : 0;
    handleSelectMilestone(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = selectedIdx > 0 ? selectedIdx - 1 : milestones.length - 1;
    handleSelectMilestone(prevIdx);
  };

  const handleContinueFlight = () => {
    setIsPlaying(true);
    scrollVelocityRef.current = 2.5;
  };

  // Progress percentage (0% to 100%)
  const flightPercentage = Math.round(
    Math.max(0, Math.min(100, ((scrollRef.current - 15) / (180 - 15)) * 100))
  );

  return (
    <div
      ref={containerRef}
      className="w-full relative rounded-3xl overflow-hidden border-2 border-[#B9E7E6] shadow-xl min-h-[640px] md:min-h-[720px] flex flex-col justify-between"
      style={{
        backgroundImage: `url('/textures/paper-texture.webp')`,
        backgroundColor: '#87CEEB',
        backgroundBlendMode: 'multiply',
        backgroundSize: 'cover',
      }}
    >
      {/* Top ITom Style Header */}
      <div className="relative z-20 px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/90 border border-black/10 flex items-center justify-center text-[#0c282d] shadow-sm">
            <Plane className="w-4 h-4 text-[#0891b2]" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm sm:text-base text-[#0c282d] tracking-wide">
              ITom Paper Flight
            </span>
            <span className="font-mono text-[10px] text-[#2d5f68] ml-2 tracking-widest uppercase">
              • Infinite Sky Journey
            </span>
          </div>
        </div>

        {/* Milestone Indicator */}
        <Badge className="bg-white/95 backdrop-blur-md text-[#0891b2] border border-[#B9E7E6] font-mono text-xs font-bold px-3 py-1 shadow-sm">
          MILESTONE {selectedIdx + 1} OF {milestones.length}
        </Badge>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {webGLSupported ? (
          <Canvas
            camera={{ position: [0, 0.3, 2.5], fov: 50, near: 0.1, far: 240 }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          >
            {/* Diffuse Lighting for Paper Craft Aesthetic */}
            <ambientLight intensity={1.2} color="#ffffff" />
            <directionalLight position={[-4, 8, 6]} intensity={1.4} color="#fffcf5" />
            <directionalLight position={[4, -4, -4]} intensity={0.4} color="#87CEEB" />

            {/* Cockpit Rig with Maneuvering Paper Airplane */}
            <CockpitFlightRig
              scrollRef={scrollRef}
              scrollVelocityRef={scrollVelocityRef}
            />

            {/* Infinite Sky World (Clouds + Story Milestones) */}
            <InfiniteSkyWorld
              milestones={milestones}
              scrollRef={scrollRef}
              onSelectMilestone={handleSelectMilestone}
            />
          </Canvas>
        ) : (
          <ItomSvgFallback
            milestones={milestones}
            selectedIdx={selectedIdx}
            onSelect={handleSelectMilestone}
          />
        )}
      </div>

      {/* Synchronized Editorial Story Card (Zero Truncation) */}
      <div className="relative z-10 p-6 sm:p-10 max-w-md lg:max-w-lg pointer-events-none mt-auto sm:my-auto">
        <div
          key={currentMilestone.id}
          className="bg-white/95 backdrop-blur-md border-2 border-dashed border-[#0891b2] p-6 sm:p-7 rounded-3xl shadow-2xl pointer-events-auto transition-all duration-300"
        >
          {/* Milestone Tag */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="font-mono text-xs font-bold tracking-widest text-[#0891b2] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              CHECKPOINT #{currentMilestone.order.toString().padStart(2, '0')} • {currentMilestone.fixCode}
            </span>
            <span className="font-mono text-xs text-[#527d85] font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0891b2]" />
              {currentMilestone.period}
            </span>
          </div>

          {/* Large Bold Editorial Headline */}
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c282d] tracking-tight leading-tight mb-2">
            {currentMilestone.institution}
          </h3>

          {/* Degree & Highlight Pill */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="font-mono text-sm font-semibold text-[#0891b2]">
              {currentMilestone.degree}
            </span>
            <span className="text-[#527d85]">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E2F4F3] text-[#0891b2] border border-[#B9E7E6]">
              <Award className="w-3 h-3" />
              {currentMilestone.highlight}
            </span>
          </div>

          {/* Full Narrative Description */}
          <p className="text-xs sm:text-sm text-[#2d5f68] leading-relaxed mb-5 font-normal">
            {currentMilestone.description}
          </p>

          {/* Flight Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#B9E7E6]/60">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrev}
                className="rounded-xl border-[#B9E7E6] text-[#2d5f68] hover:bg-[#E2F4F3] h-8 px-2.5 font-mono text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNext}
                className="rounded-xl border-[#B9E7E6] text-[#2d5f68] hover:bg-[#E2F4F3] h-8 px-2.5 font-mono text-xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={handleContinueFlight}
              className="bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-xl h-8 px-3.5 font-mono text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Fly Forward</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Flight Controller & Waypoint Quick-Selector */}
      <div className="relative z-20 p-4 sm:p-5 m-3 sm:m-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#B9E7E6] shadow-xl flex flex-col gap-3 pointer-events-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Autoplay & Reset */}
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
                  AUTOPLAY
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSelectMilestone(0)}
              className="text-[#527d85] hover:text-[#0c282d] font-mono text-xs rounded-xl h-8 px-2"
              title="Reset to departure"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>

            <span className="font-mono text-xs text-[#527d85] hidden sm:inline ml-1">
              Scroll wheel to fly!
            </span>
          </div>

          {/* Quick-Jump Milestone Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            {milestones.map((m, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMilestone(idx)}
                  className={`px-3 py-1 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#0891b2] text-white shadow-sm'
                      : 'bg-[#E2F4F3]/70 text-[#2d5f68] hover:bg-[#E2F4F3] border border-[#B9E7E6]/40'
                  }`}
                >
                  <span className="opacity-75 mr-1">0{m.order}</span>
                  <span>{m.institution.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Flight Scrubber Slider */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#527d85] font-semibold">START</span>
          <input
            type="range"
            min="15"
            max="185"
            step="0.5"
            value={scrollRef.current}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              scrollRef.current = val;
              scrollVelocityRef.current = 0;
              setIsPlaying(false);
            }}
            className="flex-1 h-2 bg-[#E2F4F3] rounded-lg appearance-none cursor-pointer accent-[#0891b2]"
          />
          <span className="font-mono text-[10px] text-[#527d85] font-semibold">
            {flightPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
