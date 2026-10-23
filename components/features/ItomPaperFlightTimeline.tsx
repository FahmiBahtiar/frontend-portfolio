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

// ── Milestone Structure (Breakable 3D Flight Card) ──────────────────────────
export interface PartingMilestone {
  id: string;
  order: number;
  fixCode: string;
  zDistance: number;
  institution: string;
  degree: string;
  period: string;
  description: string;
  badge: string;
  color: string;
}

export const DEFAULT_PARTING_MILESTONES: PartingMilestone[] = [
  {
    id: 'm1',
    order: 1,
    fixCode: 'MI 01',
    zDistance: -18,
    institution: 'MI NEGERI 1 DEMAK',
    degree: 'Elementary School Education',
    period: '2010 – 2018',
    description: 'Building strong academic foundations & character development.',
    badge: '★ Top 10 Student',
    color: '#0891b2',
  },
  {
    id: 'm2',
    order: 2,
    fixCode: 'SMP 02',
    zDistance: -58,
    institution: 'SMP NEGERI 2 DEMAK',
    degree: 'Junior High School Education',
    period: '2016 – 2019',
    description: 'Started self-taught programming & algorithmic problem-solving.',
    badge: '★ Honor Roll Graduate',
    color: '#059669',
  },
  {
    id: 'm3',
    order: 3,
    fixCode: 'BINAR 03',
    zDistance: -98,
    institution: 'BINAR ACADEMY',
    degree: 'Tech Scholar • Djarum Foundation',
    period: '2021',
    description: 'Full-stack engineering, agile methodologies & cloud systems.',
    badge: '★ Djarum Foundation Scholar',
    color: '#d97706',
  },
  {
    id: 'm4',
    order: 4,
    fixCode: 'RUS 04',
    zDistance: -138,
    institution: 'SMK RADEN UMAR SAID',
    degree: 'Software Engineering Major',
    period: '2019 – 2022',
    description: 'High-performance APIs, database modeling & backend infrastructure.',
    badge: '★ Software Engineering Major',
    color: '#7c3aed',
  },
  {
    id: 'm5',
    order: 5,
    fixCode: 'UDINUS 05',
    zDistance: -178,
    institution: 'DIAN NUSWANTORO UNIVERSITY',
    degree: 'Bachelor of Computer Science',
    period: '2022 – 2026',
    description: 'Distributed systems, data science & autonomous AI agents.',
    badge: '★ Active • Informatics Engineering',
    color: '#2563eb',
  },
];

// ── Authentic ITom Low-Poly Origami Paper Airplane ───────────────────────────
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

// ── Power-of-2 Card Texture Generator (2048x1024 -> Two 1024x1024 Halves) ───
function useFracturedCardTextures(milestone: PartingMilestone) {
  return useMemo(() => {
    if (typeof document === 'undefined') return { leftTex: null, rightTex: null };

    const fullW = 2048;
    const fullH = 1024;
    const halfW = 1024;
    const halfH = 1024;

    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = fullW;
    fullCanvas.height = fullH;
    const ctx = fullCanvas.getContext('2d');
    if (!ctx) return { leftTex: null, rightTex: null };

    ctx.clearRect(0, 0, fullW, fullH);

    // 1. Crisp White Card with Rounded Corners
    const pad = 24;
    const cardX = pad;
    const cardY = pad;
    const cardW = fullW - pad * 2;
    const cardH = fullH - pad * 2;
    const r = 40;

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
    ctx.lineWidth = 14;
    ctx.stroke();

    // Inner subtle border line
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. Top Header Bar
    const cpText = `CHECKPOINT #0${milestone.order} • EDUCATION MILESTONE`;
    ctx.font = 'bold 34px monospace';
    const cpMetrics = ctx.measureText(cpText);
    const cpW = cpMetrics.width + 56;
    ctx.fillStyle = milestone.color + '20';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(64, 56, cpW, 60, 16);
    } else {
      ctx.rect(64, 56, cpW, 60);
    }
    ctx.fill();
    ctx.fillStyle = milestone.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(cpText, 92, 86);

    const yrText = milestone.period;
    ctx.font = 'bold 34px monospace';
    const yrMetrics = ctx.measureText(yrText);
    const yrW = yrMetrics.width + 56;
    const yrX = fullW - 64 - yrW;
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(yrX, 56, yrW, 60, 16);
    } else {
      ctx.rect(yrX, 56, yrW, 60);
    }
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'left';
    ctx.fillText(yrText, yrX + 28, 86);

    // Header divider line (horizontal dashed)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(64, 145);
    ctx.lineTo(fullW - 64, 145);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Central Content
    ctx.textAlign = 'center';
    let instFontSize = 82;
    ctx.font = `bold ${instFontSize}px "CabinSketch", Impact, sans-serif`;
    let instW = ctx.measureText(milestone.institution).width;
    while (instW > fullW - 180 && instFontSize > 44) {
      instFontSize -= 2;
      ctx.font = `bold ${instFontSize}px "CabinSketch", Impact, sans-serif`;
      instW = ctx.measureText(milestone.institution).width;
    }
    ctx.fillStyle = '#0c282d';
    ctx.fillText(milestone.institution, fullW / 2, 290);

    ctx.font = 'bold 50px "CabinSketch", sans-serif';
    ctx.fillStyle = milestone.color;
    ctx.fillText(milestone.degree, fullW / 2, 395);

    // Description text card (inner clean panel)
    const descY = 480;
    const descH = 240;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(100, descY, fullW - 200, descH, 20);
    } else {
      ctx.rect(100, descY, fullW - 200, descH);
    }
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '500 42px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText(milestone.description, fullW / 2, descY + descH / 2);

    // 4. Perforated center fracture seam
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 12]);
    ctx.beginPath();
    ctx.moveTo(halfW, 30);
    ctx.lineTo(halfW, fullH - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Card Footer
    const badgeText = milestone.badge;
    ctx.font = 'bold 36px monospace';
    const bMetrics = ctx.measureText(badgeText);
    const bW = bMetrics.width + 64;
    ctx.fillStyle = milestone.color;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(64, fullH - 150, bW, 72, 18);
    } else {
      ctx.rect(64, fullH - 150, bW, 72);
    }
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, 96, fullH - 114);

    const verText = '✓ VERIFIED EDUCATION';
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#059669';
    ctx.textAlign = 'right';
    ctx.fillText(verText, fullW - 80, fullH - 114);

    // 6. Split into Left Half and Right Half Textures (1024x1024 POT)
    const leftCanvas = document.createElement('canvas');
    leftCanvas.width = halfW;
    leftCanvas.height = halfH;
    const leftCtx = leftCanvas.getContext('2d');
    if (leftCtx) {
      leftCtx.drawImage(fullCanvas, 0, 0, halfW, halfH, 0, 0, halfW, halfH);
    }

    const rightCanvas = document.createElement('canvas');
    rightCanvas.width = halfW;
    rightCanvas.height = halfH;
    const rightCtx = rightCanvas.getContext('2d');
    if (rightCtx) {
      rightCtx.drawImage(fullCanvas, halfW, 0, halfW, halfH, 0, 0, halfW, halfH);
    }

    const leftTex = new THREE.CanvasTexture(leftCanvas);
    leftTex.minFilter = THREE.LinearFilter;
    leftTex.magFilter = THREE.LinearFilter;
    leftTex.generateMipmaps = false;
    leftTex.needsUpdate = true;

    const rightTex = new THREE.CanvasTexture(rightCanvas);
    rightTex.minFilter = THREE.LinearFilter;
    rightTex.magFilter = THREE.LinearFilter;
    rightTex.generateMipmaps = false;
    rightTex.needsUpdate = true;

    return { leftTex, rightTex };
  }, [milestone]);
}

// ── 3D Fractured Milestone Card Component (Pecah / Breaks Apart When Passed!) ─
function FracturedMilestoneCard({
  milestone,
  scrollRef,
}: {
  milestone: PartingMilestone;
  scrollRef: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftMeshRef = useRef<THREE.Mesh>(null);
  const rightMeshRef = useRef<THREE.Mesh>(null);
  const shardsGroupRef = useRef<THREE.Group>(null);

  const { leftTex, rightTex } = useFracturedCardTextures(milestone);

  const cardW = 7.6;
  const cardH = 3.8;
  const halfW = 3.8;
  const baseY = 1.8;

  const shards = useMemo(
    () => [
      { id: 's1', baseX: -0.35, baseY: baseY + 1.0, vx: -2.8, vy: 1.8, vz: 1.5, rotSpeed: 4.5, size: [0.65, 0.45] as [number, number] },
      { id: 's2', baseX: 0.35, baseY: baseY + 0.9, vx: 2.6, vy: 2.0, vz: -1.2, rotSpeed: -5.0, size: [0.55, 0.5] as [number, number] },
      { id: 's3', baseX: -0.45, baseY: baseY + 0.1, vx: -3.2, vy: 0.4, vz: 1.8, rotSpeed: -4.2, size: [0.6, 0.4] as [number, number] },
      { id: 's4', baseX: 0.45, baseY: baseY - 0.1, vx: 3.4, vy: -0.5, vz: -1.5, rotSpeed: 4.8, size: [0.55, 0.45] as [number, number] },
      { id: 's5', baseX: -0.35, baseY: baseY - 1.0, vx: -2.4, vy: -1.8, vz: 1.2, rotSpeed: 3.8, size: [0.5, 0.4] as [number, number] },
      { id: 's6', baseX: 0.35, baseY: baseY - 0.9, vx: 2.8, vy: -2.0, vz: -1.4, rotSpeed: -4.4, size: [0.6, 0.35] as [number, number] },
    ],
    [baseY]
  );

  useFrame(() => {
    if (!groupRef.current) return;
    const scrollZ = scrollRef.current || 0;
    const distanceZ = scrollZ + milestone.zDistance;

    groupRef.current.visible = distanceZ > -55 && distanceZ < 15;
    if (!groupRef.current.visible) return;

    // ── THE DYNAMIC CARD FRACTURE / PECAH MECHANIC ────────────────────────────
    const fractureStart = -15;
    const fractureEnd = -1.5;
    let spreadFactor = 0;

    if (distanceZ > fractureStart && distanceZ < fractureEnd) {
      spreadFactor = (distanceZ - fractureStart) / (fractureEnd - fractureStart);
      spreadFactor = Math.min(1, Math.max(0, spreadFactor));
      spreadFactor = spreadFactor * spreadFactor;
    } else if (distanceZ >= fractureEnd) {
      spreadFactor = 1;
    }

    const maxSpread = 5.2;

    // Left Half Piece
    if (leftMeshRef.current) {
      leftMeshRef.current.position.x = -halfW / 2 - spreadFactor * maxSpread;
      leftMeshRef.current.position.y = baseY + spreadFactor * 0.7;
      leftMeshRef.current.position.z = spreadFactor * 0.4;
      leftMeshRef.current.rotation.z = spreadFactor * 0.26;
      leftMeshRef.current.rotation.y = -spreadFactor * 0.38;
    }

    // Right Half Piece
    if (rightMeshRef.current) {
      rightMeshRef.current.position.x = halfW / 2 + spreadFactor * maxSpread;
      rightMeshRef.current.position.y = baseY - spreadFactor * 0.7;
      rightMeshRef.current.position.z = -spreadFactor * 0.4;
      rightMeshRef.current.rotation.z = -spreadFactor * 0.26;
      rightMeshRef.current.rotation.y = spreadFactor * 0.38;
    }

    // Shards explosion physics
    if (shardsGroupRef.current) {
      shardsGroupRef.current.children.forEach((child, idx) => {
        const s = shards[idx];
        if (!s) return;
        child.scale.setScalar(spreadFactor > 0.05 ? Math.min(1, spreadFactor * 1.5) : 0);
        child.position.x = s.baseX + spreadFactor * s.vx * 1.8;
        child.position.y = s.baseY + spreadFactor * s.vy * 1.5;
        child.position.z = spreadFactor * s.vz * 1.2;
        child.rotation.z = spreadFactor * s.rotSpeed;
        child.rotation.x = spreadFactor * s.rotSpeed * 0.6;
      });
    }

    // Fade out after passing
    let fadeOpacity = 1;
    if (distanceZ > 0) {
      fadeOpacity = Math.max(0, 1 - distanceZ / 10);
    }

    const applyOp = (mesh: THREE.Mesh | null) => {
      if (mesh && mesh.material) {
        (mesh.material as THREE.MeshBasicMaterial).opacity = fadeOpacity;
      }
    };
    applyOp(leftMeshRef.current);
    applyOp(rightMeshRef.current);
  });

  return (
    <group ref={groupRef} position={[0, 0, milestone.zDistance]}>
      {/* Left Card Half */}
      {leftTex && (
        <mesh ref={leftMeshRef} position={[-halfW / 2, baseY, 0]}>
          <planeGeometry args={[halfW, cardH]} />
          <meshBasicMaterial
            map={leftTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Right Card Half */}
      {rightTex && (
        <mesh ref={rightMeshRef} position={[halfW / 2, baseY, 0]}>
          <planeGeometry args={[halfW, cardH]} />
          <meshBasicMaterial
            map={rightTex}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Floating Shard Pieces */}
      <group ref={shardsGroupRef}>
        {shards.map((s) => (
          <mesh key={s.id} position={[s.baseX, s.baseY, 0]}>
            <planeGeometry args={s.size} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent />
            <Edges linewidth={2} threshold={15} color={milestone.color} />
          </mesh>
        ))}
      </group>
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
  isCeiling = false,
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
  isCeiling?: boolean;
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

    const worldZ = currentScroll + basePos.current[2];

    // ITom Cloud Evasion: Ceiling clouds stay put; corridor clouds evade when close!
    let evasionX = 0;
    if (!isCeiling) {
      const evasionStart = -18;
      const evasionEnd = -2;
      let evasionFactor = 0;

      if (worldZ > evasionStart && worldZ < evasionEnd) {
        evasionFactor = (worldZ - evasionStart) / (evasionEnd - evasionStart);
        evasionFactor = evasionFactor * evasionFactor;
      } else if (worldZ >= evasionEnd) {
        evasionFactor = 1;
      }

      const dirX = basePos.current[0] >= 0 ? 1 : -1;
      evasionX = evasionFactor * 5.0 * dirX;
    }

    const driftX = Math.sin(time * driftSpeed + timeOffset) * driftAmount;
    const driftY = Math.sin(time * driftSpeed * 0.75 + timeOffset + 1.2) * bobAmount;

    meshRef.current.position.x = basePos.current[0] + driftX + evasionX;
    meshRef.current.position.y = basePos.current[1] + driftY;
    meshRef.current.position.z = basePos.current[2];

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

// ── Infinite Sky World (Full-Sky Clouds + Fractured Milestone Cards) ──────────
function SkyFlightWorld({
  milestones,
  scrollRef,
}: {
  milestones: PartingMilestone[];
  scrollRef: React.MutableRefObject<number>;
}) {
  const worldGroupRef = useRef<THREE.Group>(null);

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
      isCeiling: boolean;
    }> = [];

    // 1. General Sky Clouds (60 clouds across bottom, mid, and sides)
    const totalClouds = 60;
    for (let i = 0; i < totalClouds; i++) {
      const seed = i * 23 + 7;
      const x = ((seed * 7) % 20) - 10;
      const y = ((seed * 11) % 9.0) - 4.2;
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
        isCeiling: false,
      });
    }

    // 2. Dedicated Top Ceiling Clouds (20 clouds filling the upper sky ceiling)
    for (let j = 0; j < 20; j++) {
      const seed = j * 31 + 13;
      const z = -((j * 9.5) % 210) - 4;
      const dist = 4.2 - z;
      const factor = 0.64 + ((seed % 5) / 5) * 0.22;
      const y = 0.4 + Math.tan((26 * Math.PI) / 180) * dist * factor;
      const rawX = ((seed * 5) % 18) - 5.0;
      const x = rawX * (dist / 16);
      const texIdx = (j * 3) % CLOUD_TEXTURES.length;
      const scale = (1.05 + ((seed % 4) / 4) * 0.55) * (dist / 16);

      list.push({
        id: `cloud-top-${j}`,
        position: [x, y, z],
        scale: Math.max(0.85, scale),
        texIndex: texIdx,
        baseOpacity: 0.7 + ((seed % 4) / 4) * 0.25,
        driftSpeed: 0.35 + ((seed % 3) / 3) * 0.35,
        driftAmount: 0.6 + ((seed % 5) / 5) * 0.7,
        bobAmount: 0.12 + ((seed % 3) / 3) * 0.15,
        timeOffset: (seed % 8) * 0.785,
        isCeiling: true,
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
      {/* 5 In-Sky Fractured Milestone Cards (Pecah / Breaks Apart!) */}
      {milestones.map((m) => (
        <FracturedMilestoneCard
          key={m.id}
          milestone={m}
          scrollRef={scrollRef}
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
            isCeiling={c.isCeiling}
            scrollRef={scrollRef}
          />
        ))}
    </group>
  );
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

    let bankAngle = Math.sin(chunkProgress * Math.PI * 2) * 0.18;
    let pitchAngle = Math.sin(chunkProgress * Math.PI * 4) * 0.07;

    const velInfluence = Math.max(-0.25, Math.min(0.25, vel * 0.04));
    pitchAngle += velInfluence;

    currentBank.current = THREE.MathUtils.damp(currentBank.current, bankAngle, 4.0, delta);
    currentPitch.current = THREE.MathUtils.damp(currentPitch.current, pitchAngle, 4.0, delta);

    camera.rotation.z = currentBank.current * 0.45;
    camera.rotation.x = currentPitch.current * 0.6;

    if (airplaneRef.current) {
      const idleFloatY = Math.sin(time * 2.2) * 0.03;
      const idleFloatX = Math.sin(time * 1.4) * 0.035;

      airplaneRef.current.position.y = -0.22 + idleFloatY;
      airplaneRef.current.position.x = idleFloatX;

      airplaneRef.current.rotation.x = currentPitch.current * 3.2 + 0.12;
      airplaneRef.current.rotation.z = -currentBank.current * 2.4;
      airplaneRef.current.rotation.y = -currentBank.current * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <group ref={airplaneRef} position={[0, -0.22, 1.1]}>
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
        institution: matched.institution ? matched.institution.toUpperCase() : m.institution,
        degree: matched.degree || m.degree,
        period: matched.period || m.period,
        description: matched.description || m.description,
        badge: matched.gpa ? `★ ${matched.gpa}` : m.badge,
      };
    });
  }, [educationRecords]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.002;
      scrollVelocityRef.current += delta;
      scrollVelocityRef.current = Math.max(-2.0, Math.min(2.0, scrollVelocityRef.current));
      setIsPlaying(false);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        scrollRef.current += delta * 3.5;
        if (scrollRef.current > 185) {
          scrollRef.current = 0;
        }
      }

      scrollRef.current += scrollVelocityRef.current * delta * 60;
      scrollVelocityRef.current *= 0.95;
      if (Math.abs(scrollVelocityRef.current) < 0.001) {
        scrollVelocityRef.current = 0;
      }

      if (scrollRef.current < 0) scrollRef.current = 0;
      if (scrollRef.current > 190) scrollRef.current = 190;

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

  const handleSelectMilestone = useCallback(
    (idx: number) => {
      setSelectedIdx(idx);
      const targetScroll = idx === 0 ? 0 : Math.abs(milestones[idx].zDistance) - 15;
      scrollRef.current = targetScroll;
      scrollVelocityRef.current = 0;
      setIsPlaying(false);
    },
    [milestones]
  );

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

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0 w-full h-full">
        {webGLSupported ? (
          <Canvas
            className="w-full h-full"
            style={{ width: '100%', height: '100%', display: 'block' }}
            camera={{ position: [0, 0.4, 4.2], fov: 52, near: 0.1, far: 240 }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={1.3} color="#ffffff" />
            <directionalLight position={[-4, 8, 6]} intensity={1.5} color="#fffcf5" />
            <directionalLight position={[4, -4, -4]} intensity={0.4} color="#87CEEB" />

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

      {/* Floating Bottom Flight Controller */}
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
