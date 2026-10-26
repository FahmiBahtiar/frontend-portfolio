'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  RotateCcw,
  Plane,
  Mouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Education } from '@/lib/types/admin';

// ── Cloud Texture Assets ─────────────────────────────────────────────────────
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

// ── Milestone Structure (3D Flight Path Waypoints) ──────────────────────────
export interface MilestoneRecord {
  id: string;
  order: number;
  fixCode: string;
  zDistance: number; // World Z position in 3D space
  targetScroll: number; // Flight progress coordinate
  institution: string;
  degree: string;
  period: string;
  description: string;
  badge: string;
  color: string;
}

// ── Low-Poly Origami Paper Airplane ──────────────────────────────────────────
function PaperAirplane({
  color = '#fcfbfa',
  scale = 0.55,
}: {
  color?: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, -1.6,
      -1.25, 0.06, 0.35,
      1.25, 0.06, 0.35,
      0, 0.16, -0.5,
      0, 0.13, 0.55,
      -0.32, 0.09, 0.85,
      0.32, 0.09, 0.85,
      0, 0.11, 0.65,
      0, -0.02, -1.6,
      -1.25, -0.02, 0.35,
      1.25, -0.02, 0.35,
      0, 0, 0.55,
    ]);

    const indices = [
      0, 1, 3,  1, 4, 3,  1, 5, 4,  5, 7, 4,
      0, 3, 2,  3, 4, 2,  4, 6, 2,  4, 7, 6,
      8, 11, 9,  8, 10, 11,
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
        <Edges linewidth={2} threshold={15} color="#2b2b2b" />
      </mesh>

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
        <lineBasicMaterial color="#2b2b2b" linewidth={2} />
      </line>
    </group>
  );
}

// ── Lightweight High-Fidelity 3D Card Texture (1024x600 Retina) ──────────────
function use3DCardTexture(milestone: MilestoneRecord) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const canvasW = 1024;
    const canvasH = 600;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasW, canvasH);

    // 1. Crisp White Card with Rounded Corners
    const pad = 12;
    const cardX = pad;
    const cardY = pad;
    const cardW = canvasW - pad * 2;
    const cardH = canvasH - pad * 2;
    const r = 22;

    // Card white background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(cardX, cardY, cardW, cardH, r);
    } else {
      ctx.rect(cardX, cardY, cardW, cardH);
    }
    ctx.fill();

    // Solid accent card border
    ctx.strokeStyle = milestone.color;
    ctx.lineWidth = 7;
    ctx.stroke();

    // Top Accent Strip
    ctx.fillStyle = milestone.color;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(cardX, cardY, cardW, 10, [r, r, 0, 0]);
    } else {
      ctx.rect(cardX, cardY, cardW, 10);
    }
    ctx.fill();

    // 2. Header Row: Checkpoint Tag & Period
    const cpText = `CHECKPOINT #0${milestone.order} • EDUCATION MILESTONE`;
    ctx.font = 'bold 18px monospace';
    const cpMetrics = ctx.measureText(cpText);
    const cpW = cpMetrics.width + 30;
    ctx.fillStyle = milestone.color + '20';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(35, 36, cpW, 33, 9);
    } else {
      ctx.rect(35, 36, cpW, 33);
    }
    ctx.fill();
    ctx.fillStyle = milestone.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(cpText, 50, 52);

    // Period Pill
    const yrText = milestone.period;
    ctx.font = 'bold 18px monospace';
    const yrMetrics = ctx.measureText(yrText);
    const yrW = yrMetrics.width + 30;
    const yrX = canvasW - 35 - yrW;
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(yrX, 36, yrW, 33, 9);
    } else {
      ctx.rect(yrX, 36, yrW, 33);
    }
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'left';
    ctx.fillText(yrText, yrX + 15, 52);

    // Horizontal dashed divider line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(35, 86);
    ctx.lineTo(canvasW - 35, 86);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Central Content: Big Bold Heading & Subtitle
    ctx.textAlign = 'center';
    let instFontSize = 46;
    ctx.font = `bold ${instFontSize}px "CabinSketch", Impact, sans-serif`;
    let instW = ctx.measureText(milestone.institution).width;
    while (instW > canvasW - 100 && instFontSize > 24) {
      instFontSize -= 1;
      ctx.font = `bold ${instFontSize}px "CabinSketch", Impact, sans-serif`;
      instW = ctx.measureText(milestone.institution).width;
    }
    ctx.fillStyle = '#0c282d';
    ctx.fillText(milestone.institution, canvasW / 2, 160);

    // Degree / Major
    ctx.font = 'bold 28px "CabinSketch", sans-serif';
    ctx.fillStyle = milestone.color;
    ctx.fillText(milestone.degree, canvasW / 2, 218);

    // Description text card (inner panel)
    const descY = 258;
    const descH = 148;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(50, descY, canvasW - 100, descH, 12);
    } else {
      ctx.rect(50, descY, canvasW - 100, descH);
    }
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 29px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';

    // Word wrap description to comfortable lines
    const words = milestone.description.split(' ');
    const lines: string[] = [];
    let curLine = '';
    for (const w of words) {
      const test = (curLine + ' ' + w).trim();
      if (ctx.measureText(test).width < canvasW - 140) {
        curLine = test;
      } else {
        if (curLine) lines.push(curLine);
        curLine = w;
      }
    }
    if (curLine) lines.push(curLine);

    const lineH = 38;
    const startY = descY + (descH - (lines.length - 1) * lineH) / 2;
    lines.forEach((line, idx) => {
      ctx.fillText(line, canvasW / 2, startY + idx * lineH);
    });

    // 4. Footer Row: Badge & Pass-through Cue
    const badgeText = milestone.badge;
    ctx.font = 'bold 19px monospace';
    const bMetrics = ctx.measureText(badgeText);
    const bW = bMetrics.width + 34;
    ctx.fillStyle = milestone.color;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(35, canvasH - 85, bW, 39, 10);
    } else {
      ctx.rect(35, canvasH - 85, bW, 39);
    }
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, 52, canvasH - 65);

    // Right Fly-through cue
    const cueText = 'Scroll or autoplay to fly through →';
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#0891b2';
    ctx.textAlign = 'right';
    ctx.fillText(cueText, canvasW - 42, canvasH - 65);

    // Create 3D Texture with Anisotropy for sharp view from afar
    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 4;
    tex.needsUpdate = true;

    setTexture(tex);
  }, [milestone]);

  return texture;
}

// ── In-Sky 3D Milestone Boarding Pass Card Component ─────────────────────────
function InSky3DMilestoneCardMesh({
  milestone,
  scrollRef,
}: {
  milestone: MilestoneRecord;
  scrollRef: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cardTex = use3DCardTexture(milestone);

  // Proportional 3D world dimensions (11.2 units wide by 6.4 units tall)
  const cardW = 11.2;
  const cardH = 6.4;

  useFrame(() => {
    if (!groupRef.current || !meshRef.current) return;
    const scrollZ = scrollRef.current || 0;
    const relDist = scrollZ + milestone.zDistance;

    // Visibility range
    const isVis = relDist > -52 && relDist < 6.5;
    groupRef.current.visible = isVis;
    if (!isVis) return;

    // Pass-through dissolve mechanic ("di tabrak terus tembus gitu aja")
    let opacity = 1.0;
    let scale = 1.0;

    if (relDist < -22) {
      opacity = Math.max(0, (relDist - -52) / 30);
    } else if (relDist <= -3) {
      opacity = 1.0;
      scale = 1.0;
    } else if (relDist <= 3.5) {
      // Piercing straight through
      const t = (relDist - -3) / 6.5; // 0 to 1
      scale = 1.0 + t * 0.35;
      opacity = Math.max(0, 1 - t * t);
    } else {
      opacity = 0;
    }

    groupRef.current.scale.setScalar(scale);
    if (meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.45, milestone.zDistance]}>
      {cardTex && (
        <mesh ref={meshRef}>
          <planeGeometry args={[cardW, cardH]} />
          <meshBasicMaterial
            map={cardTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={true}
          />
        </mesh>
      )}
    </group>
  );
}

// ── Optimized Drifting Paper Cloud (With Distance Culling) ───────────────────
function DriftingPaperCloud({
  position,
  scale = 1.0,
  baseOpacity = 0.8,
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
  const width = 4.2 * scale;
  const height = width / aspect;

  useFrame((state) => {
    if (!meshRef.current) return;
    const currentScroll = scrollRef.current || 0;
    const worldZ = currentScroll + basePos.current[2];

    // Distance Culling: Skip matrix & material calculations if outside camera corridor
    if (worldZ > 8 || worldZ < -155) {
      if (meshRef.current.visible) meshRef.current.visible = false;
      return;
    }
    if (!meshRef.current.visible) meshRef.current.visible = true;

    const time = state.clock.elapsedTime;
    const driftX = Math.sin(time * driftSpeed + timeOffset) * driftAmount;
    const driftY = Math.sin(time * driftSpeed * 0.75 + timeOffset + 1.2) * bobAmount;

    meshRef.current.position.x = basePos.current[0] + driftX;
    meshRef.current.position.y = basePos.current[1] + driftY;
    meshRef.current.position.z = basePos.current[2];

    if (materialRef.current) {
      if (worldZ > 0) {
        materialRef.current.opacity = Math.max(0, baseOpacity * (1 - worldZ / 8));
      } else if (worldZ < -130) {
        materialRef.current.opacity = Math.max(0, baseOpacity * (1 - (-130 - worldZ) / 25));
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

// ── Infinite Sky World (Optimized 26-Cloud Layout) ───────────────────────────
function SkyFlightWorld({
  milestones,
  scrollRef,
}: {
  milestones: MilestoneRecord[];
  scrollRef: React.MutableRefObject<number>;
}) {
  const worldGroupRef = useRef<THREE.Group>(null);
  const [textures, setTextures] = useState<THREE.Texture[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loader = new THREE.TextureLoader();
    const loaded = CLOUD_TEXTURES.map((url) => {
      const tex = loader.load(url);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      return tex;
    });
    setTextures(loaded);
  }, []);

  // Optimized cloud collection (16 lateral framing + 10 ceiling clouds)
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

    // 1. Lateral border clouds (keeping center corridor open)
    const totalLateral = 16;
    for (let i = 0; i < totalLateral; i++) {
      const seed = i * 29 + 11;
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (5.4 + ((seed * 7) % 8) * 0.55);
      const y = ((seed * 13) % 7.5) - 3.2;
      const z = -((i * 12.5) % 190) - 6;
      const texIdx = i % CLOUD_TEXTURES.length;

      list.push({
        id: `cloud-${i}`,
        position: [x, y, z],
        scale: 1.0 + ((seed % 5) / 5) * 0.7,
        texIndex: texIdx,
        baseOpacity: 0.65 + ((seed % 4) / 4) * 0.25,
        driftSpeed: 0.3 + ((seed % 3) / 3) * 0.35,
        driftAmount: 0.4 + ((seed % 5) / 5) * 0.45,
        bobAmount: 0.1 + ((seed % 3) / 3) * 0.15,
        timeOffset: (seed % 10) * 0.628,
      });
    }

    // 2. Upper ceiling clouds
    const totalCeiling = 10;
    for (let j = 0; j < totalCeiling; j++) {
      const seed = j * 37 + 17;
      const z = -((j * 19.0) % 185) - 8;
      const dist = 4.2 - z;
      const factor = 0.65 + ((seed % 4) / 4) * 0.2;
      const y = 0.4 + Math.tan((26 * Math.PI) / 180) * dist * factor;
      const rawX = ((seed * 5) % 16) - 8;
      const x = rawX * (dist / 18);
      const texIdx = (j * 3) % CLOUD_TEXTURES.length;
      const scale = (1.1 + ((seed % 3) / 3) * 0.45) * (dist / 18);

      list.push({
        id: `cloud-top-${j}`,
        position: [x, y, z],
        scale: Math.max(0.9, scale),
        texIndex: texIdx,
        baseOpacity: 0.75 + ((seed % 3) / 3) * 0.15,
        driftSpeed: 0.32 + ((seed % 3) / 3) * 0.3,
        driftAmount: 0.5 + ((seed % 4) / 4) * 0.5,
        bobAmount: 0.1 + ((seed % 3) / 3) * 0.12,
        timeOffset: (seed % 8) * 0.785,
      });
    }

    return list;
  }, []);

  useFrame(() => {
    if (worldGroupRef.current) {
      worldGroupRef.current.position.z = scrollRef.current || 0;
    }
  });

  return (
    <group ref={worldGroupRef}>
      {/* 5 In-Sky 3D Milestone Cards */}
      {milestones.map((m) => (
        <InSky3DMilestoneCardMesh
          key={m.id}
          milestone={m}
          scrollRef={scrollRef}
        />
      ))}

      {/* Floating Paper Clouds */}
      {textures.length > 0 &&
        cloudList.map((c) => (
          <DriftingPaperCloud
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

// ── Unified Flight Physics Controller (Silky Smooth, Gentle Pacing) ─────────
function FlightPhysicsController({
  scrollRef,
  targetScrollRef,
  scrollVelocityRef,
  isPlaying,
  milestones,
  onMilestoneChange,
}: {
  scrollRef: React.MutableRefObject<number>;
  targetScrollRef: React.MutableRefObject<number>;
  scrollVelocityRef: React.MutableRefObject<number>;
  isPlaying: boolean;
  milestones: MilestoneRecord[];
  onMilestoneChange: (idx: number) => void;
}) {
  const lastActiveIdx = useRef(0);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);

    // Autoplay cruise: calm 2.8 units per second
    if (isPlaying) {
      targetScrollRef.current += clampedDelta * 2.8;
      if (targetScrollRef.current > 185) {
        targetScrollRef.current = 0;
        scrollRef.current = 0;
      }
    }

    // Silky-smooth damp interpolation (gentle 2.8 lambda for majestic glide)
    const prevScroll = scrollRef.current;
    scrollRef.current = THREE.MathUtils.damp(
      scrollRef.current,
      targetScrollRef.current,
      2.8,
      clampedDelta
    );

    // Smooth velocity for banking & tilt
    scrollVelocityRef.current = (scrollRef.current - prevScroll) / Math.max(0.001, clampedDelta);

    // Update milestone tab smoothly without spamming state
    const current = scrollRef.current;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < milestones.length; i++) {
      const diff = Math.abs(current - milestones[i].targetScroll);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    if (closestIdx !== lastActiveIdx.current) {
      lastActiveIdx.current = closestIdx;
      onMilestoneChange(closestIdx);
    }
  });

  return null;
}

// ── Maneuvering Paper Airplane Cockpit Rig ────────────────────────────────────
function ManeuveringPaperAirplane({
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

    const chunkProgress = (((scrollZ % 40) + 40) % 40) / 40;

    const bankAngle = Math.sin(chunkProgress * Math.PI * 2) * 0.15;
    let pitchAngle = Math.sin(chunkProgress * Math.PI * 4) * 0.05;

    const velInfluence = Math.max(-0.25, Math.min(0.25, vel * 0.02));
    pitchAngle += velInfluence;

    currentBank.current = THREE.MathUtils.damp(currentBank.current, bankAngle, 3.8, delta);
    currentPitch.current = THREE.MathUtils.damp(currentPitch.current, pitchAngle, 3.8, delta);

    camera.rotation.z = currentBank.current * 0.45;
    camera.rotation.x = currentPitch.current * 0.6;

    if (airplaneRef.current) {
      const idleFloatY = Math.sin(time * 2.2) * 0.03;
      const idleFloatX = Math.sin(time * 1.4) * 0.035;

      // Positioned comfortably in the lower third with ample clearance
      airplaneRef.current.position.y = -0.36 + idleFloatY;
      airplaneRef.current.position.x = idleFloatX;

      airplaneRef.current.rotation.x = currentPitch.current * 3.2 + 0.12;
      airplaneRef.current.rotation.z = -currentBank.current * 2.4;
      airplaneRef.current.rotation.y = -currentBank.current * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <group ref={airplaneRef} position={[0, -0.36, 1.1]}>
        <PaperAirplane color="#fcfbfa" scale={0.55} />
      </group>
    </group>
  );
}

// ── 2.5D Fallback for Non-WebGL Environments ─────────────────────────────────
function PaperSvgFallback({
  milestones,
  selectedIdx,
  onSelect,
}: {
  milestones: MilestoneRecord[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) {
  const current = milestones[selectedIdx] || milestones[0];
  if (!current) return null;

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden bg-[#87CEEB]">
      <div className="relative z-10 max-w-lg bg-white/95 p-6 rounded-2xl border-2 border-dashed border-[#0891b2] shadow-lg">
        <Badge className="bg-[#E2F4F3] text-[#0891b2] border border-[#B9E7E6] mb-3 font-mono">
          CHECKPOINT #{current.order.toString().padStart(2, '0')}
        </Badge>
        <h2 className="text-3xl font-serif font-bold text-[#0c282d] mb-1">
          {current.institution}
        </h2>
        <p className="text-sm font-semibold text-[#0891b2] mb-3">
          {current.degree} ({current.period})
        </p>
        <p className="text-xs sm:text-sm text-[#2d5f68] leading-relaxed mb-4">
          {current.description}
        </p>
        <Badge className="bg-[#0891b2] text-white font-mono text-xs">
          {current.badge}
        </Badge>
      </div>

      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-2">
        {milestones.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Jump to Milestone ${m.order}: ${m.institution}`}
            aria-current={i === selectedIdx ? 'step' : undefined}
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
  const [mounted, setMounted] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Actual rendered position in 3D world
  const scrollRef = useRef<number>(0);
  // Target position where user desires to fly (interpolated smoothly)
  const targetScrollRef = useRef<number>(0);
  // Velocity derivative for aerodynamic banking & pitch
  const scrollVelocityRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Viewport Intersection Observer: Sleeps WebGL when off-screen (0% GPU/CPU when idle on other sections!)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '120px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  const [webGLSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  const milestones: MilestoneRecord[] = useMemo(() => {
    if (!educationRecords || educationRecords.length === 0) return [];

    const sorted = [...educationRecords].sort((a, b) => (a.order || 0) - (b.order || 0));
    const colors = ['#0891b2', '#059669', '#d97706', '#7c3aed', '#0284c7'];
    const total = sorted.length;

    return sorted.map((record, idx) => {
      const scrollStep = total > 1 ? 160 / (total - 1) : 0;
      const targetScroll = idx * scrollStep;
      const zDistance = -18 - idx * 40;
      const codePrefix = String(idx + 1).padStart(2, '0');
      const degreeWords = record.degree ? record.degree.trim().split(/\s+/) : ['STEP'];
      const codeWord = degreeWords[0] ? degreeWords[0].slice(0, 5).toUpperCase() : 'STEP';
      const fixCode = `${codePrefix} ${codeWord}`;

      return {
        id: record.id || `m${idx + 1}`,
        order: record.order ?? idx + 1,
        fixCode,
        zDistance,
        targetScroll,
        institution: record.institution ? record.institution.toUpperCase() : '',
        degree: record.degree || '',
        period: record.period || '',
        description: record.description || '',
        badge: record.gpa ? `★ ${record.gpa}` : `★ Milestone ${idx + 1}`,
        color: colors[idx % colors.length],
      };
    });
  }, [educationRecords]);

  // ── Controlled, Perfectly Paced Scroll & Drag Physics ─────────────────────
  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    // 1. Mouse wheel / trackpad: smooth, measured, normalized pacing
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rawDelta = e.deltaY;
      const clampedDelta = Math.sign(rawDelta) * Math.min(80, Math.abs(rawDelta));
      const delta = clampedDelta * 0.012; // Calm, elegant glide
      targetScrollRef.current += delta;
      targetScrollRef.current = Math.max(0, Math.min(185, targetScrollRef.current));
      setIsPlaying(false);
    };

    // 2. Drag / Touch: smooth 1:1 proportional displacement
    let isDragging = false;
    let lastY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
      isDragging = true;
      lastY = e.clientY;
      setIsPlaying(false);
      try {
        container.setPointerCapture(e.pointerId);
      } catch {}
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dy = lastY - e.clientY;
      lastY = e.clientY;

      targetScrollRef.current += dy * 0.035;
      targetScrollRef.current = Math.max(0, Math.min(185, targetScrollRef.current));
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {}
        isDragging = false;
      }
    };

    // 3. Touch events for mobile touchscreens (iOS Safari / Android Chrome)
    let touchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
      if (e.touches.length === 1) {
        touchY = e.touches[0].clientY;
        setIsPlaying(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const dy = touchY - currentY;
        touchY = currentY;

        targetScrollRef.current += dy * 0.035;
        targetScrollRef.current = Math.max(0, Math.min(185, targetScrollRef.current));
      }
    };

    // 4. Keyboard arrow navigation (discrete step)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        targetScrollRef.current += 3.0;
        targetScrollRef.current = Math.max(0, Math.min(185, targetScrollRef.current));
        setIsPlaying(false);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        targetScrollRef.current -= 3.0;
        targetScrollRef.current = Math.max(0, Math.min(185, targetScrollRef.current));
        setIsPlaying(false);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted]);

  // Tab click navigation (smoothly glides straight to the target milestone!)
  const handleSelectMilestone = useCallback(
    (idx: number) => {
      setSelectedIdx(idx);
      if (milestones[idx]) {
        targetScrollRef.current = milestones[idx].targetScroll;
      }
      setIsPlaying(false);
    },
    [milestones]
  );

  const handleResetDeparture = useCallback(() => {
    setSelectedIdx(0);
    targetScrollRef.current = 0;
    scrollRef.current = 0;
    setIsPlaying(false);
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-full relative rounded-3xl overflow-hidden border-2 border-[#B9E7E6] shadow-xl min-h-[640px] md:min-h-[720px]"
        style={{
          backgroundImage: `url('/textures/paper-texture.webp')`,
          backgroundColor: '#87CEEB',
          backgroundBlendMode: 'multiply',
          backgroundSize: 'cover',
        }}
      />
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="w-full relative rounded-3xl overflow-hidden border border-[#B9E7E6] min-h-[400px] flex items-center justify-center bg-white/70 shadow-sm">
        <p className="font-mono text-sm text-[#527d85]">No education journey records available.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full relative rounded-3xl overflow-hidden border-2 border-[#B9E7E6] shadow-xl min-h-[640px] md:min-h-[720px] flex flex-col justify-between touch-none select-none"
      style={{
        backgroundImage: `url('/textures/paper-texture.webp')`,
        backgroundColor: '#87CEEB',
        backgroundBlendMode: 'multiply',
        backgroundSize: 'cover',
      }}
    >
      {/* Top Header */}
      <div className="relative z-20 px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/90 border border-black/10 flex items-center justify-center text-[#0c282d] shadow-sm">
            <Plane className="w-4 h-4 text-[#0891b2]" aria-hidden="true" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm sm:text-base text-[#0c282d] tracking-wide">
              Journey Timeline
            </span>
            <span className="font-mono text-[10px] text-[#2d5f68] ml-2 tracking-widest uppercase">
              • Infinite Sky Odyssey
            </span>
          </div>
        </div>

        {/* Milestone Indicator */}
        <Badge className="bg-white/95 backdrop-blur-md text-[#0891b2] border border-[#B9E7E6] font-mono text-xs font-bold px-3 py-1 shadow-sm">
          MILESTONE {selectedIdx + 1} OF {milestones.length}
        </Badge>
      </div>

      {/* 3D WebGL Canvas Layer (Frameloop automatically sleeps when off-screen to preserve 0% GPU when idle!) */}
      <div className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing">
        {webGLSupported ? (
          <Canvas
            className="w-full h-full"
            style={{ width: '100%', height: '100%', display: 'block' }}
            camera={{ position: [0, 0.4, 4.2], fov: 52, near: 0.1, far: 240 }}
            dpr={[1, 1.5]}
            frameloop={isInView ? 'always' : 'never'}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            role="img"
            aria-label="3D Paper Airplane Flight Journey Timeline through education milestones"
          >
            <ambientLight intensity={1.3} color="#ffffff" />
            <directionalLight position={[-4, 8, 6]} intensity={1.5} color="#fffcf5" />
            <directionalLight position={[4, -4, -4]} intensity={0.4} color="#87CEEB" />

            {/* Unified Frame-Locked Physics Controller */}
            <FlightPhysicsController
              scrollRef={scrollRef}
              targetScrollRef={targetScrollRef}
              scrollVelocityRef={scrollVelocityRef}
              isPlaying={isPlaying}
              milestones={milestones}
              onMilestoneChange={setSelectedIdx}
            />

            <ManeuveringPaperAirplane
              scrollRef={scrollRef}
              scrollVelocityRef={scrollVelocityRef}
            />

            <SkyFlightWorld
              milestones={milestones}
              scrollRef={scrollRef}
            />
          </Canvas>
        ) : (
          <PaperSvgFallback
            milestones={milestones}
            selectedIdx={selectedIdx}
            onSelect={handleSelectMilestone}
          />
        )}
      </div>

      {/* Floating Bottom Island Cards (Split into Left and Right Independent Cards) */}
      <div className="relative z-20 px-3 sm:px-6 pb-3 sm:pb-5 w-full flex items-center justify-between gap-3 pointer-events-none flex-wrap">
        {/* Left Card: Mode Selection (AUTOPLAY vs BY SCROLL) + Reset */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-[#B9E7E6] shadow-xl p-2 sm:p-2.5 flex items-center gap-2 pointer-events-auto">
          {/* Segmented Mode Control */}
          <div className="flex items-center p-1 rounded-xl bg-[#E2F4F3]/70 border border-[#B9E7E6]/70 shadow-inner">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Enable Autoplay flight mode"
              aria-pressed={isPlaying}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                isPlaying
                  ? 'bg-[#0891b2] text-white shadow-sm'
                  : 'text-[#2d5f68] hover:text-[#0c282d] hover:bg-white/60'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>AUTOPLAY</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              aria-label="Enable By Scroll flight mode"
              aria-pressed={!isPlaying}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                !isPlaying
                  ? 'bg-[#0891b2] text-white shadow-sm'
                  : 'text-[#2d5f68] hover:text-[#0c282d] hover:bg-white/60'
              }`}
            >
              <Mouse className="w-3.5 h-3.5" aria-hidden="true" />
              <span>BY SCROLL</span>
            </button>
          </div>

          {/* Reset Departure Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetDeparture}
            aria-label="Reset flight to departure"
            className="text-[#527d85] hover:text-[#0c282d] hover:bg-[#E2F4F3] font-mono text-xs rounded-xl h-8 px-2"
            title="Reset to departure"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>

          {isPlaying ? (
            <span className="font-mono text-xs text-[#0891b2] font-semibold hidden md:inline ml-1 pr-1 animate-pulse">
              Autoplay cruising...
            </span>
          ) : (
            <span className="font-mono text-xs text-[#527d85] hidden md:inline ml-1 pr-1">
              Scroll or drag to fly
            </span>
          )}
        </div>

        {/* Right Card: Quick-Jump Milestone Tabs */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-[#B9E7E6] shadow-xl p-2 sm:p-2.5 flex items-center gap-1.5 overflow-x-auto max-w-full pointer-events-auto">
          {milestones.map((m, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMilestone(idx)}
                aria-label={`Jump to Milestone ${m.order}: ${m.institution}`}
                aria-current={isSelected ? 'step' : undefined}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all ${
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
    </div>
  );
}
