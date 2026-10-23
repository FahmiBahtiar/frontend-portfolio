'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
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
  textureAsset?: string; // Cloud island or avatar asset
  color: string;
}

export const DEFAULT_PARTING_MILESTONES: PartingMilestone[] = [
  {
    id: 'm1',
    order: 1,
    fixCode: 'FAHMI 01',
    zDistance: -18,
    titleLeft: 'FAHMI BAHTIAR',
    titleRight: '(BLIMBING)',
    mottoLine1: '"Elementary School • MI Negeri 1 Demak"',
    mottoLine2: 'Building strong foundations & journey club',
    tagBadge: '★ Top 10 Student (2010 – 2018)',
    textureAsset: '/textures/about/awatarnachmurce.webp',
    color: '#0891b2',
  },
  {
    id: 'm2',
    order: 2,
    fixCode: 'SMP 02',
    zDistance: -58,
    titleLeft: 'SMP NEGERI 2',
    titleRight: 'DEMAK (2016 – 2019)',
    mottoLine1: '"Junior High School Education"',
    mottoLine2: 'Started self-taught programming & algorithms',
    tagBadge: '★ Honor Roll Graduate',
    textureAsset: '/textures/about/uowyspa.webp',
    color: '#059669',
  },
  {
    id: 'm3',
    order: 3,
    fixCode: 'BINAR 03',
    zDistance: -98,
    titleLeft: 'BINAR ACADEMY',
    titleRight: 'TECH SCHOLAR (2021)',
    mottoLine1: '"Djarum Foundation Scholarship"',
    mottoLine2: 'Full-stack engineering, agile & cloud systems',
    tagBadge: '★ Djarum Foundation Scholar',
    textureAsset: '/textures/about/freelancewyspa.webp',
    color: '#d97706',
  },
  {
    id: 'm4',
    order: 4,
    fixCode: 'RUS 04',
    zDistance: -138,
    titleLeft: 'SMK RADEN UMAR SAID',
    titleRight: 'SOFTWARE ENG (2019 – 2022)',
    mottoLine1: '"Vocational Academy of Excellence"',
    mottoLine2: 'Backend infrastructure, databases & high-perf APIs',
    tagBadge: '★ Software Engineering Major',
    textureAsset: '/textures/about/uowyspa.webp',
    color: '#7c3aed',
  },
  {
    id: 'm5',
    order: 5,
    fixCode: 'UDINUS 05',
    zDistance: -178,
    titleLeft: 'DIAN NUSWANTORO',
    titleRight: 'UNIVERSITY (2022 – 2026)',
    mottoLine1: '"Bachelor of Computer Science"',
    mottoLine2: 'Distributed systems, data science & autonomous AI',
    tagBadge: '★ Active • Informatics Engineering',
    textureAsset: '/textures/about/awatarnachmurce.webp',
    color: '#2563eb',
  },
];

// ── Authentic ITom Low-Poly Origami Paper Airplane (Scale: 0.52 Nimble) ───────
function PaperAirplane({
  color = '#fcfbfa',
  scale = 0.52,
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
        {/* Origami fold edge outlines */}
        <Edges linewidth={2} threshold={15} color="#2b2b2b" />
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
        <lineBasicMaterial color="#2b2b2b" linewidth={2} />
      </line>
    </group>
  );
}

// ── Ultra-Sharp 4K CanvasTexture Text Sprite (Zero Suspense, Instant 1ms) ─────
function useUltraSharpTextTexture({
  text,
  fontSize = 90,
  color = '#0c282d',
  strokeColor = '#ffffff',
  strokeWidth = 12,
  fontFamily = 'Impact, sans-serif',
  isBold = true,
  backgroundColor,
  backgroundBorder,
  width = 2048,
  height = 256,
}: {
  text: string;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontFamily?: string;
  isBold?: boolean;
  backgroundColor?: string;
  backgroundBorder?: string;
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

    // Dynamic auto-scaling font size to ensure ZERO clipping
    let currentFontSize = fontSize;
    ctx.font = `${isBold ? 'bold ' : ''}${currentFontSize}px ${fontFamily}`;
    let textW = ctx.measureText(text).width;
    while (textW > width - 160 && currentFontSize > 28) {
      currentFontSize -= 2;
      ctx.font = `${isBold ? 'bold ' : ''}${currentFontSize}px ${fontFamily}`;
      textW = ctx.measureText(text).width;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Optional high-contrast pill backdrop for pristine readability
    if (backgroundColor) {
      const padX = 42;
      const padY = 18;
      const bgW = Math.min(width - 24, textW + padX * 2);
      const bgH = Math.min(height - 24, currentFontSize + padY * 2);
      const bgX = (width - bgW) / 2;
      const bgY = (height - bgH) / 2;

      ctx.fillStyle = backgroundColor;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(bgX, bgY, bgW, bgH, 24);
      } else {
        ctx.rect(bgX, bgY, bgW, bgH);
      }
      ctx.fill();

      if (backgroundBorder) {
        ctx.strokeStyle = backgroundBorder;
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }

    if (strokeWidth > 0 && !backgroundColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(text, width / 2, height / 2);
    }

    ctx.fillStyle = color;
    ctx.fillText(text, width / 2, height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [text, fontSize, color, strokeColor, strokeWidth, fontFamily, isBold, backgroundColor, backgroundBorder, width, height]);
}

// ── In-Sky Parting Milestone Component (Parts Away When Approached!) ──────────
function PartingStoryMilestone({
  milestone,
  scrollRef,
  texture,
}: {
  milestone: PartingMilestone;
  scrollRef: React.MutableRefObject<number>;
  texture: THREE.Texture | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftTitleRef = useRef<THREE.Mesh>(null);
  const rightTitleRef = useRef<THREE.Mesh>(null);
  const motto1Ref = useRef<THREE.Mesh>(null);
  const motto2Ref = useRef<THREE.Mesh>(null);
  const badgeRef = useRef<THREE.Mesh>(null);
  const islandRef = useRef<THREE.Mesh>(null);

  const baseY = 2.2;
  const islandWidth = 5.6;
  const islandHeight = islandWidth / (2816 / 1536);

  // Generate 4K ultra-sharp canvas textures for crisp typography
  const titleLeftTex = useUltraSharpTextTexture({
    text: milestone.titleLeft,
    fontSize: 98,
    color: '#0c282d',
    strokeColor: '#ffffff',
    strokeWidth: 14,
    fontFamily: '"CabinSketch", Impact, sans-serif',
    width: 1536,
    height: 256,
  });

  const titleRightTex = useUltraSharpTextTexture({
    text: milestone.titleRight,
    fontSize: 78,
    color: milestone.color,
    strokeColor: '#ffffff',
    strokeWidth: 12,
    fontFamily: '"CabinSketch", sans-serif',
    width: 1280,
    height: 256,
  });

  const motto1Tex = useUltraSharpTextTexture({
    text: milestone.mottoLine1,
    fontSize: 58,
    color: '#083344',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backgroundBorder: '#0891b2',
    fontFamily: '"CabinSketch", Impact, sans-serif',
    width: 1536,
    height: 180,
  });

  const motto2Tex = useUltraSharpTextTexture({
    text: milestone.mottoLine2,
    fontSize: 52,
    color: '#1e293b',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backgroundBorder: '#94a3b8',
    fontFamily: 'sans-serif',
    width: 1536,
    height: 180,
  });

  const badgeTex = useUltraSharpTextTexture({
    text: milestone.tagBadge,
    fontSize: 54,
    color: '#ffffff',
    backgroundColor: milestone.color,
    backgroundBorder: '#ffffff',
    fontFamily: 'monospace',
    width: 1280,
    height: 180,
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const scrollZ = scrollRef.current || 0;

    // Relative distance of this milestone to the camera plane
    const distanceZ = scrollZ + milestone.zDistance;

    // Visibility range
    groupRef.current.visible = distanceZ > -55 && distanceZ < 15;
    if (!groupRef.current.visible) return;

    // ── THE ITOM PARTING SPREAD MECHANIC ──────────────────────────────────────
    // When approaching (-16 to -1.5): elements smoothly part to the sides!
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

    const maxSpread = 10.5; // lateral distance elements disperse outward

    // Left Title: moves to the left (-X)
    if (leftTitleRef.current) {
      leftTitleRef.current.position.x = -spreadFactor * maxSpread * 0.75;
    }

    // Right Title: moves to the right (+X)
    if (rightTitleRef.current) {
      rightTitleRef.current.position.x = spreadFactor * maxSpread * 0.65;
    }

    // Central Island / Avatar: parts upward and slightly to the left, bobbing gently
    if (islandRef.current) {
      islandRef.current.position.y =
        baseY + Math.sin(time * 0.85) * 0.15 + spreadFactor * 2.8;
      islandRef.current.position.x = -spreadFactor * maxSpread * 0.25;
    }

    // Subtitle Line 1: spreads right (+X)
    if (motto1Ref.current) {
      motto1Ref.current.position.x = spreadFactor * maxSpread * 0.7;
    }

    // Subtitle Line 2: spreads left (-X)
    if (motto2Ref.current) {
      motto2Ref.current.position.x = -spreadFactor * maxSpread * 0.6;
    }

    // Badge: spreads downward and right
    if (badgeRef.current) {
      badgeRef.current.position.x = spreadFactor * maxSpread * 0.55;
      badgeRef.current.position.y = -1.1 - spreadFactor * 1.0;
    }

    // Smooth fade out after the plane passes through
    let fadeOpacity = 1;
    if (distanceZ > 0) {
      fadeOpacity = Math.max(0, 1 - distanceZ / 10);
    }

    const applyOpacity = (mesh: THREE.Mesh | null, op: number) => {
      if (mesh && mesh.material) {
        (mesh.material as THREE.MeshBasicMaterial).opacity = op;
      }
    };

    applyOpacity(leftTitleRef.current, fadeOpacity);
    applyOpacity(rightTitleRef.current, fadeOpacity);
    applyOpacity(motto1Ref.current, fadeOpacity * 0.92);
    applyOpacity(motto2Ref.current, fadeOpacity * 0.88);
    applyOpacity(badgeRef.current, fadeOpacity);
    applyOpacity(islandRef.current, fadeOpacity);
  });

  return (
    <group ref={groupRef} position={[0, 0, milestone.zDistance]}>
      {/* Central Island / Reclining Avatar on Cloud */}
      {texture && (
        <mesh ref={islandRef} position={[0, baseY, 0]}>
          <planeGeometry args={[islandWidth, islandHeight]} />
          <meshBasicMaterial
            map={texture}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main Title Left (Spreads Left) */}
      {titleLeftTex && (
        <mesh ref={leftTitleRef} position={[0, 4.8, 0.1]}>
          <planeGeometry args={[7.2, 1.2]} />
          <meshBasicMaterial
            map={titleLeftTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main Title Right (Spreads Right) */}
      {titleRightTex && (
        <mesh ref={rightTitleRef} position={[0, 4.0, 0.1]}>
          <planeGeometry args={[5.6, 1.1]} />
          <meshBasicMaterial
            map={titleRightTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Motto Line 1 (Spreads Right) */}
      {motto1Tex && (
        <mesh ref={motto1Ref} position={[0, 0.2, 0.1]}>
          <planeGeometry args={[6.8, 0.9]} />
          <meshBasicMaterial
            map={motto1Tex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Motto Line 2 (Spreads Left) */}
      {motto2Tex && (
        <mesh ref={motto2Ref} position={[0, -0.45, 0.1]}>
          <planeGeometry args={[6.8, 0.9]} />
          <meshBasicMaterial
            map={motto2Tex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Tag Badge (Spreads Down/Right) */}
      {badgeTex && (
        <mesh ref={badgeRef} position={[0, -1.1, 0.1]}>
          <planeGeometry args={[5.2, 0.8]} />
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

// ── Infinite Sky World (Full-Sky Clouds + Parting Story Milestones) ───────────
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

  // Preload milestone island textures
  const milestoneTextures = useMemo<Record<string, THREE.Texture | undefined>>(() => {
    if (typeof window === 'undefined') return {};
    const loader = new THREE.TextureLoader();
    return {
      '/textures/about/awatarnachmurce.webp': loader.load('/textures/about/awatarnachmurce.webp'),
      '/textures/about/uowyspa.webp': loader.load('/textures/about/uowyspa.webp'),
      '/textures/about/freelancewyspa.webp': loader.load('/textures/about/freelancewyspa.webp'),
    };
  }, []);

  // Generate 80 clouds distributed across the ENTIRE sky (including top ceiling!)
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

    // 1. General Sky Clouds (60 clouds across bottom, mid, and sides)
    const totalClouds = 60;
    for (let i = 0; i < totalClouds; i++) {
      const seed = i * 23 + 7;
      const x = ((seed * 7) % 20) - 10;
      const y = ((seed * 11) % 9.0) - 4.2; // -4.2 to +4.8
      const z = -((i * 3.6) % 215) - 4;
      const texIdx = i % CLOUD_TEXTURES.length;

      list.push({
        id: `cloud-${i}`,
        position: [x, y, z],
        scale: 0.85 + ((seed % 7) / 7) * 0.85,
        texIndex: texIdx,
        baseOpacity: 0.6 + ((seed % 5) / 5) * 0.3,
        driftSpeed: 0.3 + ((seed % 4) / 4) * 0.4,
        driftAmount: 0.5 + ((seed % 6) / 6) * 0.8,
        bobAmount: 0.1 + ((seed % 4) / 4) * 0.18,
        timeOffset: (seed % 10) * 0.628,
      });
    }

    // 2. Dedicated Top Ceiling Clouds (24 clouds filling the upper 20% sky ceiling!)
    for (let j = 0; j < 24; j++) {
      const seed = j * 31 + 13;
      const z = -((j * 9.2) % 210) - 4;
      const dist = 4.2 - z;
      const factor = 0.64 + ((seed % 5) / 5) * 0.22;
      const y = 0.4 + Math.tan((26 * Math.PI) / 180) * dist * factor;
      const x = (((seed * 5) % 22) - 11) * (dist / 16);
      const texIdx = (j * 3) % CLOUD_TEXTURES.length;
      const scale = (1.1 + ((seed % 4) / 4) * 0.6) * (dist / 16);

      list.push({
        id: `cloud-top-${j}`,
        position: [x, y, z],
        scale: Math.max(0.9, scale),
        texIndex: texIdx,
        baseOpacity: 0.7 + ((seed % 4) / 4) * 0.25,
        driftSpeed: 0.35 + ((seed % 3) / 3) * 0.35,
        driftAmount: 0.6 + ((seed % 5) / 5) * 0.7,
        bobAmount: 0.12 + ((seed % 3) / 3) * 0.15,
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
      {/* 5 In-Sky Parting Milestones */}
      {milestones.map((m) => (
        <PartingStoryMilestone
          key={m.id}
          milestone={m}
          scrollRef={scrollRef}
          texture={m.textureAsset ? milestoneTextures[m.textureAsset] || null : null}
        />
      ))}

      {/* Floating Paper Clouds (Covering Entire Sky, Continuous Drift!) */}
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

// ── Maneuvering Paper Airplane Cockpit Rig (Camera Pulled Back & Nimble Scale!)
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
      const idleFloatY = Math.sin(time * 2.2) * 0.035;
      const idleFloatX = Math.sin(time * 1.4) * 0.04;

      // Elevated above the bottom dock with generous breathing room (~100px clearance!)
      airplaneRef.current.position.y = -0.24 + idleFloatY;
      airplaneRef.current.position.x = idleFloatX;

      airplaneRef.current.rotation.x = currentPitch.current * 3.2 + 0.12;
      airplaneRef.current.rotation.z = -currentBank.current * 2.4;
      airplaneRef.current.rotation.y = -currentBank.current * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Paper airplane with small, nimble origami scale (0.38) & generous clearance */}
      <group ref={airplaneRef} position={[0, -0.24, 1.1]}>
        <PaperAirplane color="#fcfbfa" scale={0.38} />
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

  // Momentum-based scroll system: start at 0 (Milestone 1 directly ahead at z = -18)
  const scrollRef = useRef<number>(0);
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
      if (idx === 0) {
        return {
          ...m,
          titleLeft: 'FAHMI BAHTIAR',
          titleRight: '(BLIMBING)',
          mottoLine1: matched.institution ? `"Elementary School • ${matched.institution}"` : m.mottoLine1,
          mottoLine2: matched.description || m.mottoLine2,
          tagBadge: matched.gpa ? `★ ${matched.gpa} (${matched.period})` : m.tagBadge,
        };
      }
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

  // Handle wheel scrolling over the canvas container (exact ITom velocity delta: e.deltaY * 0.002!)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Controlled, smooth flight speed
      const delta = e.deltaY * 0.002;
      scrollVelocityRef.current += delta;
      scrollVelocityRef.current = Math.max(-2.0, Math.min(2.0, scrollVelocityRef.current));
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

      // Autoplay cruise: calm, graceful gliding
      if (isPlaying) {
        scrollRef.current += delta * 3.5;
        if (scrollRef.current > 185) {
          scrollRef.current = 0;
        }
      }

      // Momentum deceleration
      scrollRef.current += scrollVelocityRef.current * delta * 60;
      scrollVelocityRef.current *= 0.95; // Friction
      if (Math.abs(scrollVelocityRef.current) < 0.001) {
        scrollVelocityRef.current = 0;
      }

      // Bound flight range (Milestone 1 at ~0 to Milestone 5 at ~180)
      if (scrollRef.current < 0) scrollRef.current = 0;
      if (scrollRef.current > 190) scrollRef.current = 190;

      // Identify closest active milestone
      const currentScroll = scrollRef.current;
      let closestIdx = 0;
      let minDiff = Infinity;

      milestones.forEach((m, idx) => {
        const targetScroll = Math.abs(m.zDistance);
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
      // Place plane just before milestone so content is in view and parts as you fly forward
      const targetScroll = idx === 0 ? 0 : Math.abs(milestones[idx].zDistance) - 15;
      scrollRef.current = targetScroll;
      scrollVelocityRef.current = 0;
      setIsPlaying(false);
    },
    [milestones]
  );

  // Progress percentage (0% to 100%)
  const flightPercentage = Math.round(
    Math.max(0, Math.min(100, (scrollRef.current / 175) * 100))
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

      {/* 3D WebGL Canvas Layer (Zero Suspense, Instant 1ms Mount!) */}
      <div className="absolute inset-0 z-0">
        {webGLSupported ? (
          <Canvas
            camera={{ position: [0, 0.4, 4.2], fov: 52, near: 0.1, far: 240 }}
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

            {/* Infinite Sky World (Full Sky Clouds + Parting Milestones) */}
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
            min="0"
            max="180"
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
