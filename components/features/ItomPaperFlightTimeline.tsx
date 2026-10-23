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

// ── Milestone Structure (ITom Architecture) ────────────────────────────────
export interface PartingMilestone {
  id: string;
  order: number;
  fixCode: string;
  zDistance: number; // World Z position where this milestone sits
  titleLeft: string; // Left side of title (parts to -X)
  titleRight: string; // Right side of title (parts to +X)
  mottoLine1: string; // Top subtitle (parts right)
  mottoLine2: string; // Bottom subtitle (parts left)
  tagBadge: string; // Honor badge
  hasAvatar?: boolean; // Milestone 1 includes ITom avatar on cloud
  color: string;
}

export const DEFAULT_PARTING_MILESTONES: PartingMilestone[] = [
  {
    id: 'm1',
    order: 1,
    fixCode: 'DMK 01',
    zDistance: -20,
    titleLeft: 'FAHMI BAHTIAR',
    titleRight: '(BLIMBING)',
    mottoLine1: '"Elementary School • MI Negeri 1 Demak"',
    mottoLine2: 'Building strong foundations & journey club',
    tagBadge: '★ Top 10 Student (2010 – 2018)',
    hasAvatar: true,
    color: '#0891b2',
  },
  {
    id: 'm2',
    order: 2,
    fixCode: 'DMN 02',
    zDistance: -60,
    titleLeft: 'SMP NEGERI 2',
    titleRight: 'DEMAK (2016 – 2019)',
    mottoLine1: '"Junior High School Education"',
    mottoLine2: 'Started self-taught programming & algorithms',
    tagBadge: '★ Honor Roll Graduate',
    hasAvatar: false,
    color: '#059669',
  },
  {
    id: 'm3',
    order: 3,
    fixCode: 'BNR 03',
    zDistance: -100,
    titleLeft: 'BINAR ACADEMY',
    titleRight: 'TECH SCHOLAR (2021)',
    mottoLine1: '"Djarum Foundation Scholarship"',
    mottoLine2: 'Full-stack engineering, agile & cloud systems',
    tagBadge: '★ Djarum Foundation Scholar',
    hasAvatar: false,
    color: '#d97706',
  },
  {
    id: 'm4',
    order: 4,
    fixCode: 'RUS 04',
    zDistance: -140,
    titleLeft: 'SMK RADEN UMAR SAID',
    titleRight: 'SOFTWARE ENG (2019 – 2022)',
    mottoLine1: '"Vocational Academy of Excellence"',
    mottoLine2: 'Backend infrastructure, databases & high-perf APIs',
    tagBadge: '★ Software Engineering Major',
    hasAvatar: false,
    color: '#7c3aed',
  },
  {
    id: 'm5',
    order: 5,
    fixCode: 'UDN 05',
    zDistance: -180,
    titleLeft: 'DIAN NUSWANTORO',
    titleRight: 'UNIVERSITY (2022 – 2026)',
    mottoLine1: '"Bachelor of Computer Science"',
    mottoLine2: 'Distributed systems, data science & autonomous AI',
    tagBadge: '★ Active • Informatics Engineering',
    hasAvatar: false,
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

// ── Canvas Texture Text Sprite Generator (Zero Network, 1ms Render) ───────────
function useTextTexture({
  text,
  fontSize = 38,
  color = '#1a1a1a',
  strokeColor = '#ffffff',
  strokeWidth = 4,
  fontFamily = 'Impact, sans-serif',
  width = 512,
  height = 128,
}: {
  text: string;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontFamily?: string;
  width?: number;
  height?: number;
}) {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, width, height);

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = 'round';
      ctx.strokeText(text, width / 2, height / 2);
    }

    ctx.fillStyle = color;
    ctx.fillText(text, width / 2, height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text, fontSize, color, strokeColor, strokeWidth, fontFamily, width, height]);
}

// ── In-Sky Parting Milestone Component (Parts Away When Approached!) ──────────
function PartingStoryMilestone({
  milestone,
  scrollRef,
  avatarTexture,
}: {
  milestone: PartingMilestone;
  scrollRef: React.MutableRefObject<number>;
  avatarTexture: THREE.Texture | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftTitleRef = useRef<THREE.Mesh>(null);
  const rightTitleRef = useRef<THREE.Mesh>(null);
  const motto1Ref = useRef<THREE.Mesh>(null);
  const motto2Ref = useRef<THREE.Mesh>(null);
  const badgeRef = useRef<THREE.Mesh>(null);
  const avatarMeshRef = useRef<THREE.Mesh>(null);

  // Generate canvas textures for parting typography
  const titleLeftTex = useTextTexture({
    text: milestone.titleLeft,
    fontSize: 42,
    color: '#0c282d',
    strokeColor: '#ffffff',
    strokeWidth: 6,
    fontFamily: '"CabinSketch", Impact, sans-serif',
    width: 600,
    height: 120,
  });

  const titleRightTex = useTextTexture({
    text: milestone.titleRight,
    fontSize: 34,
    color: milestone.color,
    strokeColor: '#ffffff',
    strokeWidth: 5,
    fontFamily: '"CabinSketch", sans-serif',
    width: 500,
    height: 120,
  });

  const motto1Tex = useTextTexture({
    text: milestone.mottoLine1,
    fontSize: 26,
    color: '#2d5f68',
    strokeColor: '#ffffff',
    strokeWidth: 4,
    fontFamily: 'sans-serif',
    width: 600,
    height: 80,
  });

  const motto2Tex = useTextTexture({
    text: milestone.mottoLine2,
    fontSize: 24,
    color: '#527d85',
    strokeColor: '#ffffff',
    strokeWidth: 4,
    fontFamily: 'sans-serif',
    width: 600,
    height: 80,
  });

  const badgeTex = useTextTexture({
    text: milestone.tagBadge,
    fontSize: 24,
    color: '#0891b2',
    strokeColor: '#ffffff',
    strokeWidth: 4,
    fontFamily: 'monospace',
    width: 500,
    height: 80,
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const scrollZ = scrollRef.current || 0;

    // Relative distance of this milestone to the camera plane
    const distanceZ = scrollZ + milestone.zDistance;

    // Visibility cull: hide if far ahead or passed behind
    groupRef.current.visible = distanceZ > -55 && distanceZ < 15;
    if (!groupRef.current.visible) return;

    // ── THE ITOM PARTING SPREAD MECHANIC ──────────────────────────────────────
    // When far away (distanceZ < -16): elements are centered together
    // As the plane approaches (-16 to -1.5): elements smoothly part to the sides!
    const spreadStart = -16;
    const spreadEnd = -1.5;
    let spreadFactor = 0;

    if (distanceZ > spreadStart && distanceZ < spreadEnd) {
      spreadFactor = (distanceZ - spreadStart) / (spreadEnd - spreadStart);
      spreadFactor = Math.min(1, Math.max(0, spreadFactor));
      spreadFactor = spreadFactor * spreadFactor; // ease-in
    } else if (distanceZ >= spreadEnd) {
      spreadFactor = 1;
    }

    const maxSpread = 7.2; // lateral distance elements disperse outward

    // Left Title: moves to the left (-X)
    if (leftTitleRef.current) {
      leftTitleRef.current.position.x = -1.4 - spreadFactor * maxSpread * 0.75;
    }

    // Right Title: moves to the right (+X)
    if (rightTitleRef.current) {
      rightTitleRef.current.position.x = 1.4 + spreadFactor * maxSpread * 0.7;
    }

    // Avatar on Cloud: parts upward and slightly to the left, bobbing gently
    if (avatarMeshRef.current) {
      const baseY = 2.6;
      avatarMeshRef.current.position.y =
        baseY + Math.sin(time * 0.9) * 0.15 + spreadFactor * 1.8;
      avatarMeshRef.current.position.x = -spreadFactor * maxSpread * 0.25;
    }

    // Subtitle Line 1: spreads right (+X)
    if (motto1Ref.current) {
      motto1Ref.current.position.x = 1.2 + spreadFactor * maxSpread * 0.65;
    }

    // Subtitle Line 2: spreads left (-X)
    if (motto2Ref.current) {
      motto2Ref.current.position.x = -1.2 - spreadFactor * maxSpread * 0.65;
    }

    // Badge: spreads downward and right
    if (badgeRef.current) {
      badgeRef.current.position.x = 1.2 + spreadFactor * maxSpread * 0.5;
      badgeRef.current.position.y = -0.9 - spreadFactor * 0.9;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, milestone.zDistance]}>
      {/* Avatar on Cloud (for Milestone 1, exact ITom reference!) */}
      {milestone.hasAvatar && avatarTexture && (
        <mesh ref={avatarMeshRef} position={[0, 2.6, 0]}>
          <planeGeometry args={[5.2, 2.6]} />
          <meshBasicMaterial
            map={avatarTexture}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main Title Left (Spreads Left!) */}
      {titleLeftTex && (
        <mesh ref={leftTitleRef} position={[-1.4, 1.4, 0.1]}>
          <planeGeometry args={[5.4, 1.1]} />
          <meshBasicMaterial
            map={titleLeftTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main Title Right (Spreads Right!) */}
      {titleRightTex && (
        <mesh ref={rightTitleRef} position={[1.4, 1.1, 0.1]}>
          <planeGeometry args={[4.4, 1.0]} />
          <meshBasicMaterial
            map={titleRightTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Motto Line 1 (Spreads Right!) */}
      {motto1Tex && (
        <mesh ref={motto1Ref} position={[1.2, 0.2, 0.1]}>
          <planeGeometry args={[5.2, 0.7]} />
          <meshBasicMaterial
            map={motto1Tex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Motto Line 2 (Spreads Left!) */}
      {motto2Tex && (
        <mesh ref={motto2Ref} position={[-1.2, -0.4, 0.1]}>
          <planeGeometry args={[5.4, 0.7]} />
          <meshBasicMaterial
            map={motto2Tex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Honor Tag Badge (Spreads Right/Down!) */}
      {badgeTex && (
        <mesh ref={badgeRef} position={[1.2, -1.0, 0.1]}>
          <planeGeometry args={[4.4, 0.7]} />
          <meshBasicMaterial
            map={badgeTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// ── Continuously Floating & Evasive Paper Cloud ──────────────────────────────
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
    const time = state.clock.elapsedTime;
    const currentScroll = scrollRef.current || 0;

    // World Z position relative to camera
    const worldZ = currentScroll + basePos.current[2];

    // ITom Cloud Evasion: As clouds approach camera, they glide outward to clear flight view
    const evasionStart = -50;
    const evasionEnd = -6;
    let evasionFactor = 0;

    if (worldZ > evasionStart && worldZ < evasionEnd) {
      evasionFactor = (worldZ - evasionStart) / (evasionEnd - evasionStart);
      evasionFactor = evasionFactor * evasionFactor * (3 - 2 * evasionFactor);
    } else if (worldZ >= evasionEnd) {
      evasionFactor = 1;
    }

    const dirX = basePos.current[0] >= 0 ? 1 : -1;
    const evasionX = evasionFactor * 10.0 * dirX;

    // CONTINUOUS CLOUD DRIFT: Runs always even when the airplane stops!
    const driftX = Math.sin(time * driftSpeed + timeOffset) * driftAmount;
    const driftY = Math.sin(time * driftSpeed * 0.75 + timeOffset + 1.2) * bobAmount;

    meshRef.current.position.x = basePos.current[0] + driftX + evasionX;
    meshRef.current.position.y = basePos.current[1] + driftY;
    meshRef.current.position.z = basePos.current[2];

    // Fade out smoothly once cloud passes behind camera
    if (materialRef.current) {
      if (worldZ > 0) {
        materialRef.current.opacity = Math.max(0, baseOpacity * (1 - worldZ / 10));
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

// ── Infinite Sky World (Clouds + Parting Story Milestones) ───────────────────
function SkyFlightWorld({
  milestones,
  scrollRef,
}: {
  milestones: PartingMilestone[];
  scrollRef: React.MutableRefObject<number>;
}) {
  const worldGroupRef = useRef<THREE.Group>(null);

  // Synchronous texture loading via THREE.TextureLoader (NEVER suspends!)
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

  const avatarTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/textures/about/awatarnachmurce.webp');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Generate 48 clouds distributed along the flight corridor
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

    const totalZSegments = 12;
    for (let seg = 0; seg < totalZSegments; seg++) {
      const segZ = -seg * 18 - 4;
      const countInSeg = 4;
      for (let i = 0; i < countInSeg; i++) {
        const seed = seg * 19 + i * 29;
        const xSide = (i % 2 === 0 ? 1 : -1) * (3.8 + ((seed % 10) / 10) * 5.4);
        const yHeight = -2.6 + ((seed * 7) % 10) * 0.7;
        const zPos = segZ - ((seed * 3) % 14);
        const texIdx = (seg + i) % CLOUD_TEXTURES.length;

        list.push({
          id: `cloud-${seg}-${i}`,
          position: [xSide, yHeight, zPos],
          scale: 0.9 + ((seed % 5) / 5) * 0.75,
          texIndex: texIdx,
          baseOpacity: 0.7 + ((seed % 4) / 4) * 0.25,
          driftSpeed: 0.35 + ((seed % 3) / 3) * 0.45,
          driftAmount: 0.5 + ((seed % 6) / 6) * 0.7,
          bobAmount: 0.12 + ((seed % 4) / 4) * 0.18,
          timeOffset: (seed % 10) * 0.65,
        });
      }
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
      {/* 5 In-Sky Parting Milestones */}
      {milestones.map((m) => (
        <PartingStoryMilestone
          key={m.id}
          milestone={m}
          scrollRef={scrollRef}
          avatarTexture={avatarTexture}
        />
      ))}

      {/* Floating Paper Clouds (Continuous Drift!) */}
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

// ── Maneuvering Paper Airplane Cockpit Rig (Camera Pulled Back!) ───────────────
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

    // Chunk progress (0 to 1 every 40 units)
    const chunkProgress = (((scrollZ % 40) + 40) % 40) / 40;

    // Dynamic flight banking & pitching maneuver curve
    let bankAngle = Math.sin(chunkProgress * Math.PI * 2) * 0.18;
    let pitchAngle = Math.sin(chunkProgress * Math.PI * 4) * 0.07;

    const velInfluence = Math.max(-0.25, Math.min(0.25, vel * 0.04));
    pitchAngle += velInfluence;

    currentBank.current = THREE.MathUtils.damp(currentBank.current, bankAngle, 4.0, delta);
    currentPitch.current = THREE.MathUtils.damp(currentPitch.current, pitchAngle, 4.0, delta);

    camera.rotation.z = currentBank.current * 0.45;
    camera.rotation.x = currentPitch.current * 0.6;

    if (airplaneRef.current) {
      // Gentle swaying flight float (runs always!)
      const idleFloatY = Math.sin(time * 2.2) * 0.04;
      const idleFloatX = Math.sin(time * 1.4) * 0.05;

      airplaneRef.current.position.y = -0.2 + idleFloatY;
      airplaneRef.current.position.x = idleFloatX;

      airplaneRef.current.rotation.x = currentPitch.current * 3.2 + 0.12;
      airplaneRef.current.rotation.z = -currentBank.current * 2.4;
      airplaneRef.current.rotation.y = -currentBank.current * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Paper airplane positioned with ample breathing room in camera view */}
      <group ref={airplaneRef} position={[0, -0.2, 1.8]} scale={1.05}>
        <PaperAirplane color="#fcfbfa" scale={0.92} />
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
  milestones: PartingMilestone[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) {
  const current = milestones[selectedIdx];

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden bg-[#87CEEB]">
      <div className="relative z-10 max-w-lg bg-white/95 p-6 rounded-2xl border-2 border-dashed border-[#0891b2] shadow-lg">
        <Badge className="bg-[#E2F4F3] text-[#0891b2] border border-[#B9E7E6] mb-3 font-mono">
          CHECKPOINT #{current.order.toString().padStart(2, '0')}
        </Badge>
        <h2 className="text-3xl font-serif font-bold text-[#0c282d] mb-1">
          {current.titleLeft} {current.titleRight}
        </h2>
        <p className="text-sm font-semibold text-[#0891b2] mb-3">
          {current.mottoLine1}
        </p>
        <p className="text-xs sm:text-sm text-[#2d5f68] leading-relaxed">
          {current.mottoLine2}
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

  // Momentum-based scroll system: start at 2 (Milestone 1 directly ahead)
  const scrollRef = useRef<number>(2);
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

  // Merge dynamic database records with parting milestones
  const milestones: PartingMilestone[] = useMemo(() => {
    const raw =
      educationRecords && educationRecords.length > 0
        ? educationRecords
        : FALLBACK_EDUCATION_RECORDS;

    return DEFAULT_PARTING_MILESTONES.map((m, idx) => {
      const matched = raw[idx];
      if (!matched) return m;
      return {
        ...m,
        titleLeft: matched.institution ? matched.institution.split(' ').slice(0, 3).join(' ') : m.titleLeft,
        titleRight: matched.period ? `(${matched.period})` : m.titleRight,
        mottoLine1: matched.degree ? `"${matched.degree}"` : m.mottoLine1,
        mottoLine2: matched.description || m.mottoLine2,
        tagBadge: matched.gpa ? `★ ${matched.gpa}` : m.tagBadge,
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
        if (scrollRef.current > 188) {
          scrollRef.current = 2;
        }
      }

      // Momentum deceleration
      scrollRef.current += scrollVelocityRef.current * delta * 60;
      scrollVelocityRef.current *= 0.94; // Friction
      if (Math.abs(scrollVelocityRef.current) < 0.002) {
        scrollVelocityRef.current = 0;
      }

      // Bound flight range (Milestone 1 at ~0 to Milestone 5 at ~185)
      if (scrollRef.current < 0) scrollRef.current = 0;
      if (scrollRef.current > 190) scrollRef.current = 190;

      // Identify closest active milestone
      const currentScroll = scrollRef.current;
      let closestIdx = 0;
      let minDiff = Infinity;

      milestones.forEach((m, idx) => {
        // Milestone is in focus when scroll is ~18 units before it passes
        const targetScroll = Math.abs(m.zDistance) - 18;
        const diff = Math.abs(currentScroll - targetScroll);
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

  // Navigate to specific milestone
  const handleSelectMilestone = useCallback(
    (idx: number) => {
      setSelectedIdx(idx);
      // Place plane 18 units before milestone so content is right ahead and parts as you fly
      const targetScroll = Math.max(0, Math.abs(milestones[idx].zDistance) - 18);
      scrollRef.current = targetScroll;
      scrollVelocityRef.current = 0;
      setIsPlaying(false);
    },
    [milestones]
  );

  // Progress percentage (0% to 100%)
  const flightPercentage = Math.round(
    Math.max(0, Math.min(100, (scrollRef.current / 165) * 100))
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

      {/* 3D WebGL Canvas Layer (Wider Perspective, Pulled-Back Camera!) */}
      <div className="absolute inset-0 z-0">
        {webGLSupported ? (
          <Canvas
            camera={{ position: [0, 0.8, 5.0], fov: 48, near: 0.1, far: 240 }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          >
            {/* Diffuse Lighting for Paper Craft Aesthetic */}
            <ambientLight intensity={1.3} color="#ffffff" />
            <directionalLight position={[-4, 8, 6]} intensity={1.5} color="#fffcf5" />
            <directionalLight position={[4, -4, -4]} intensity={0.4} color="#87CEEB" />

            {/* Maneuvering Paper Airplane Cockpit Rig */}
            <ManeuveringPaperAirplane
              scrollRef={scrollRef}
              scrollVelocityRef={scrollVelocityRef}
            />

            {/* Infinite Sky World (Continuous Floating Clouds + Parting Milestones) */}
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

      {/* Note: Left 2D Detail Card has been removed per user instruction! Content parts in-sky! */}

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
                  <span>{m.titleLeft.split(' ')[0]}</span>
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
