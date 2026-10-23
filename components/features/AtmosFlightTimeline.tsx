'use client';

import React, { useState, useRef, useMemo, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Compass,
  Sparkles,
  RotateCcw,
  Calendar,
  GraduationCap,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Education } from '@/lib/types/admin';
import { FALLBACK_EDUCATION_RECORDS } from '@/lib/fallback-data';

// ── Checkpoint Milestone Structure ──────────────────────────────────────────
export interface AtmosCheckpoint {
  id: string;
  order: number;
  fixCode: string;
  degree: string;
  institution: string;
  period: string;
  highlight: string;
  description: string;
  tProgress: number; // 0.0 to 1.0 along the flight curve
  coord: [number, number, number];
  color: string;
}

export const DEFAULT_ATMOS_CHECKPOINTS: AtmosCheckpoint[] = [
  {
    id: 'c6de5eac-280b-420d-a48f-31bb5d36e729',
    order: 1,
    fixCode: 'DMK 01',
    degree: 'Elementary School',
    institution: 'MI Negeri 1 Demak',
    period: '2010 – 2018',
    highlight: 'Top 10 Student',
    description:
      'Building strong academic foundation and character development. Active in journey and survival club, sparking a lifelong fascination with aviation, mathematics, and exploration.',
    tProgress: 0.113,
    coord: [-6.0, 1.4, 4.6],
    color: '#0891b2',
  },
  {
    id: '03e13fb8-0688-4df4-b2fc-7f287b8ddabb',
    order: 2,
    fixCode: 'DMN 02',
    degree: 'Junior High School',
    institution: 'SMP Negeri 2 Demak',
    period: '2016 – 2019',
    highlight: 'Honor Roll Graduate',
    description:
      'Initiated self-taught programming journey with fundamental algorithms, logic systems, and early software experiments while consistently maintaining academic excellence.',
    tProgress: 0.315,
    coord: [-2.8, 2.6, 0.0],
    color: '#059669',
  },
  {
    id: '12495985-a7eb-4fd9-a7d2-273c9d7028db',
    order: 3,
    fixCode: 'BNR 03',
    degree: 'Tech Scholarship',
    institution: 'Binar Academy',
    period: '2021 – 2021',
    highlight: 'Djarum Foundation Scholar',
    description:
      'Awarded prestigious Djarum Foundation scholarship for intensive full-stack engineering, studying agile paradigms, cloud architectures, and modern web application development.',
    tProgress: 0.520,
    coord: [0.5, 3.9, -4.5],
    color: '#d97706',
  },
  {
    id: '41f518cd-38da-4d95-8314-5c943a55d10e',
    order: 4,
    fixCode: 'RUS 04',
    degree: 'Vocational High School',
    institution: 'SMK Raden Umar Said',
    period: '2019 – 2022',
    highlight: 'Software Engineering Major',
    description:
      'Graduated from the renowned creative and tech academy SMK Raden Umar Said. Specialized in backend infrastructure, relational databases, security models, and high-performance APIs.',
    tProgress: 0.738,
    coord: [3.4, 4.8, 0.8],
    color: '#7c3aed',
  },
  {
    id: '691a3904-f1ba-440d-a650-f77e17c495c2',
    order: 5,
    fixCode: 'UDN 05',
    degree: 'Bachelor of Computer Science',
    institution: 'Dian Nuswantoro University',
    period: '2022 – 2026',
    highlight: 'Active • Informatics Engineering',
    description:
      'Pursuing Bachelor Degree in Informatics Engineering with focus on distributed systems, data science, and cloud networking. Merging aviation telemetry with autonomous AI pipelines.',
    tProgress: 0.917,
    coord: [6.6, 5.8, -2.8],
    color: '#2563eb',
  },
];

// ── Soaring 3D Flight Path Control Points (ATMOS Curvature) ───────────────────
export const ATMOS_PATH_POINTS: [number, number, number][] = [
  [-7.8, 0.8, 7.2],   // 0: Initial climb through dawn mist
  [-6.0, 1.4, 4.6],   // 1: Checkpoint 01 (MI Demak)
  [-4.4, 2.0, 2.2],   // 2: Banking left through cumulus canyon
  [-2.8, 2.6, 0.0],   // 3: Checkpoint 02 (SMPN 2)
  [-1.1, 3.2, -2.4],  // 4: Ascending right turn over cloud bank
  [0.5, 3.9, -4.5],   // 5: Checkpoint 03 (Binar Academy)
  [2.0, 4.4, -2.0],   // 6: Sweeping mountain-cloud pass
  [3.4, 4.8, 0.8],    // 7: Checkpoint 04 (SMK RUS)
  [5.0, 5.3, -0.6],   // 8: High altitude ridge climb
  [6.6, 5.8, -2.8],   // 9: Checkpoint 05 (Udinus)
  [8.4, 6.4, -4.2],   // 10: Cruising into endless golden horizon
];

// ── Procedural Stylized 3D Cumulus Cloud Geometry ────────────────────────────
function buildStylizedCumulus(seed: number = 1): THREE.BufferGeometry {
  const sphere = new THREE.SphereGeometry(1, 14, 14);
  const geometries: THREE.BufferGeometry[] = [];

  // Deterministic pillowy puff configuration inspired by claymorphic cumulus
  const puffTemplates = [
    { pos: [0, 0, 0], scale: [2.1, 1.3, 1.6] },
    { pos: [1.5, 0.2, 0.1], scale: [1.5, 1.1, 1.3] },
    { pos: [-1.5, 0.1, -0.1], scale: [1.4, 1.0, 1.2] },
    { pos: [0.6, 0.8, 0.3], scale: [1.4, 1.4, 1.2] },
    { pos: [-0.7, 0.7, -0.3], scale: [1.2, 1.2, 1.1] },
    { pos: [0.3, -0.2, 1.1], scale: [1.5, 0.9, 1.2] },
    { pos: [-0.4, -0.2, -0.9], scale: [1.3, 0.9, 1.1] },
    { pos: [2.4, -0.3, 0.2], scale: [1.1, 0.8, 0.9] },
    { pos: [-2.4, -0.3, -0.2], scale: [1.0, 0.8, 0.9] },
  ];

  puffTemplates.forEach((p, idx) => {
    const g = sphere.clone();
    // Minor variation by seed
    const jitter = Math.sin(seed * 11 + idx * 7) * 0.15;
    g.scale(p.scale[0] * (1 + jitter), p.scale[1] * (1 + jitter * 0.5), p.scale[2] * (1 + jitter));
    g.translate(p.pos[0], p.pos[1], p.pos[2]);
    geometries.push(g);
  });

  const merged = BufferGeometryUtils.mergeGeometries(geometries);
  merged.computeVertexNormals();
  return merged;
}

// ── 3D Sculptural Cloudscape Component ───────────────────────────────────────
const CloudCluster = React.memo(function CloudCluster({
  position,
  scale = 1,
  rotation = [0, 0, 0],
  seed = 1,
  color = '#ffffff',
  opacity = 0.96,
}: {
  position: [number, number, number];
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
  seed?: number;
  color?: string;
  opacity?: number;
}) {
  const geometry = useMemo(() => buildStylizedCumulus(seed), [seed]);

  const s = Array.isArray(scale) ? scale : [scale, scale, scale];

  return (
    <mesh
      geometry={geometry}
      position={position}
      scale={s as [number, number, number]}
      rotation={rotation}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.92}
        metalness={0.02}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
});

// ── Ethereal Atmosphere Dust Particles ───────────────────────────────────────
function AtmosphereParticles({ count = 60 }: { count?: number }) {
  const points = useMemo(() => {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pts[i * 3 + 0] = (Math.random() - 0.5) * 28;
      pts[i * 3 + 1] = Math.random() * 10 - 1;
      pts[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    return pts;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ── 3D Glowing Waypoint Ring Gates ───────────────────────────────────────────
function WaypointBeacons({
  waypoints,
  selectedIdx,
  onSelect,
}: {
  waypoints: AtmosCheckpoint[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <group>
      {waypoints.map((wpt, idx) => {
        const isSelected = idx === selectedIdx;
        const [x, y, z] = wpt.coord;

        return (
          <group
            key={wpt.id}
            position={[x, y, z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(idx);
            }}
          >
            {/* Luminous Waypoint Ring Gate */}
            <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
              <torusGeometry args={[isSelected ? 0.44 : 0.32, 0.02, 16, 32]} />
              <meshBasicMaterial
                color={isSelected ? '#0891b2' : '#ffffff'}
                transparent
                opacity={isSelected ? 0.95 : 0.65}
              />
            </mesh>

            {/* Glowing Beacon Core */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.12 : 0.08, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#0891b2' : '#ffffff'}
                emissive={isSelected ? '#0891b2' : '#ffffff'}
                emissiveIntensity={isSelected ? 1.4 : 0.6}
              />
            </mesh>

            {/* Slender ethereal light anchor beam */}
            <line>
              <bufferGeometry
                attach="geometry"
                {...new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(0, -y - 0.5, 0),
                ])}
              />
              <lineBasicMaterial attach="material" color="#6FD4E1" transparent opacity={0.3} />
            </line>
          </group>
        );
      })}
    </group>
  );
}

// ── Sleek Minimalist Airplane (Claymorphic ATMOS Aesthetic) ───────────────────
function AtmosAircraft({
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

  // Apply ATMOS claymorphic porcelain & glass materials
  const sceneClone = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.name === 'Object_24' || mesh.name === 'Object_39') {
          // Cockpit & cabin glass: vibrant reflective cyan glass
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#0891b2',
            roughness: 0.12,
            metalness: 0.85,
            transparent: true,
            opacity: 0.95,
          });
        } else if (mesh.name === 'Object_30' || mesh.name === 'Object_31') {
          // Engine trim & nacelles: pale brushed silver-aqua
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#6FD4E1',
            roughness: 0.3,
            metalness: 0.5,
          });
        } else {
          // Fuselage & wings: pure porcelain white clay finish
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 0.22,
            metalness: 0.08,
          });
        }
      }
    });
    return clone;
  }, [gltf.scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const clampedProgress = Math.max(0.001, Math.min(0.999, progress));
    const currentPoint = curve.getPointAt(clampedProgress);
    const tangent = curve.getTangentAt(clampedProgress).normalize();

    groupRef.current.position.copy(currentPoint);

    // Look ahead along flight tangent (aligns local +Z)
    const lookTarget = currentPoint.clone().add(tangent);
    groupRef.current.lookAt(lookTarget);

    // Dynamic aerodynamic roll banking into curves
    const nextProgress = Math.min(0.999, clampedProgress + 0.02);
    const nextTangent = curve.getTangentAt(nextProgress).normalize();
    const crossY = tangent.x * nextTangent.z - tangent.z * nextTangent.x;
    const targetBankRad = THREE.MathUtils.clamp(crossY * 70, -0.65, 0.65);

    // Smoothly interpolate roll banking
    bankRef.current = THREE.MathUtils.damp(bankRef.current, targetBankRad, 4.5, delta);

    if (meshRef.current) {
      meshRef.current.rotation.z = bankRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        {/*
          Orientation & Scale:
          jet.glb nose is at local -X, top is at +Y.
          Rotating by +Math.PI/2 (+90 deg) points nose to +Z (forward).
          Top stays at +Y (upright cockpit, wings horizontal).
          Scaled to 0.075 so the porcelain jet is prominent and crisp in the sky!
        */}
        <primitive
          object={sceneClone}
          scale={[0.075, 0.075, 0.075]}
          rotation={[0, Math.PI / 2, 0]}
        />

        {/* Luminous twin contrail ribbons trailing from engines */}
        <group position={[-0.52, -0.04, -1.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.14, 2.8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        </group>
        <group position={[0.52, -0.04, -1.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.14, 2.8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ── Contrail Trajectory Ribbon ───────────────────────────────────────────────
function ContrailRibbon({
  curve,
  progress,
}: {
  curve: THREE.CatmullRomCurve3;
  progress: number;
}) {
  const lineGeo = useMemo(() => {
    const totalSegments = 140;
    const currentSegments = Math.max(2, Math.floor(totalSegments * progress));
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= currentSegments; i++) {
      const t = (i / totalSegments) * progress;
      points.push(curve.getPointAt(t));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [curve, progress]);

  return (
    <primitive
      object={
        new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({
            color: '#6FD4E1',
            transparent: true,
            opacity: 0.5,
            linewidth: 2,
          })
        )
      }
    />
  );
}

// ── Cinematic Camera Director ("Fokus ke Tulisannya di Setiap Checkpoint") ────
function AtmosCameraDirector({
  curve,
  progress,
  isAtCheckpoint,
  selectedIdx,
  waypoints,
}: {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  isAtCheckpoint: boolean;
  selectedIdx: number;
  waypoints: AtmosCheckpoint[];
}) {
  const isInitialized = useRef(false);
  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const clampedProgress = Math.max(0.001, Math.min(0.999, progress));
    const planePos = curve.getPointAt(clampedProgress);
    const tangent = curve.getTangentAt(clampedProgress).normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    if (isAtCheckpoint) {
      // ── EDITORIAL FRAMING VIEW (ATMOS Style) ────────────────────────────────
      // Camera positioned so plane soars in upper-right quadrant (NDC x ≈ 0.30, y ≈ 0.20)
      // leaving the entire left side perfectly framed for the editorial typography card!
      const desiredPos = planePos.clone()
        .sub(tangent.clone().multiplyScalar(4.5))
        .add(new THREE.Vector3(0, 0.1, 0))
        .sub(side.clone().multiplyScalar(3.6));

      const desiredLook = planePos.clone()
        .add(tangent.clone().multiplyScalar(0.8))
        .add(new THREE.Vector3(0, -0.6, 0))
        .sub(side.clone().multiplyScalar(1.2));

      targetCamPos.current.copy(desiredPos);
      targetLookAt.current.copy(desiredLook);
    } else {
      // ── CRUISING / FLIGHT CHASE VIEW ────────────────────────────────────────
      // Dynamic follow camera soaring through cloudscapes
      const desiredPos = planePos.clone()
        .sub(tangent.clone().multiplyScalar(4.4))
        .add(new THREE.Vector3(0, 1.4, 0))
        .add(side.clone().multiplyScalar(0.3));

      const desiredLook = planePos.clone()
        .add(tangent.clone().multiplyScalar(1.8))
        .add(new THREE.Vector3(0, 0.1, 0));

      targetCamPos.current.copy(desiredPos);
      targetLookAt.current.copy(desiredLook);
    }

    if (!isInitialized.current) {
      // Immediate snap on first frame to eliminate any startup camera lag
      state.camera.position.copy(targetCamPos.current);
      state.camera.lookAt(targetLookAt.current);
      isInitialized.current = true;
      return;
    }

    // Smooth cinematic damping (Zero snapping, 60fps buttery float)
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetCamPos.current.x, 4.8, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetCamPos.current.y, 4.8, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetCamPos.current.z, 4.8, delta);

    // Damp camera look direction
    state.camera.lookAt(targetLookAt.current);
  });

  return null;
}

// ── 2.5D Fallback for Non-WebGL Environments ─────────────────────────────────
function AtmosSvgFallback({
  waypoints,
  selectedIdx,
  progress,
  onSelect,
}: {
  waypoints: AtmosCheckpoint[];
  selectedIdx: number;
  progress: number;
  onSelect: (idx: number) => void;
}) {
  const current = waypoints[selectedIdx];

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden bg-gradient-to-b from-[#8EB5DE] via-[#B9E7E6] to-[#E2F4F3]">
      {/* Soft stylized cloud silhouettes */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 right-10 w-64 h-32 bg-white rounded-full blur-xl" />
        <div className="absolute bottom-20 left-10 w-96 h-48 bg-white rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-lg">
        <Badge className="bg-white/90 text-[#0891b2] border border-[#B9E7E6] mb-3">
          MILESTONE #{current.order.toString().padStart(2, '0')} • {current.period}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0c282d] mb-2">
          {current.institution}
        </h2>
        <p className="text-base text-[#0891b2] font-medium mb-4">
          {current.degree} • {current.highlight}
        </p>
        <p className="text-sm text-[#2d5f68] leading-relaxed bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#B9E7E6]">
          {current.description}
        </p>
      </div>

      {/* Waypoint buttons */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-2">
        {waypoints.map((w, i) => (
          <button
            key={w.id}
            onClick={() => onSelect(i)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
              i === selectedIdx
                ? 'bg-[#0891b2] text-white shadow-md'
                : 'bg-white/80 text-[#2d5f68] hover:bg-white'
            }`}
          >
            {w.fixCode}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Master Component: AtmosFlightTimeline ───────────────────────────────────
export function AtmosFlightTimeline({
  educationRecords,
}: {
  educationRecords?: Education[];
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused on Checkpoint 1 so user can read first!
  const [progress, setProgress] = useState(0.08); // Start centered at Checkpoint 1
  const [isAtCheckpoint, setIsAtCheckpoint] = useState(true);

  const [webGLSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  // Merge dynamic CMS / database records with rich flight checkpoints
  const waypoints: AtmosCheckpoint[] = useMemo(() => {
    const raw =
      educationRecords && educationRecords.length > 0
        ? educationRecords
        : FALLBACK_EDUCATION_RECORDS;

    return DEFAULT_ATMOS_CHECKPOINTS.map((wpt, idx) => {
      const matched = raw[idx];
      if (!matched) return wpt;
      return {
        ...wpt,
        degree: matched.degree || wpt.degree,
        institution: matched.institution || wpt.institution,
        period: matched.period || wpt.period,
        highlight: matched.gpa || wpt.highlight,
        description: matched.description || wpt.description,
      };
    });
  }, [educationRecords]);

  // Construct Catmull-Rom 3D flight trajectory curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      ATMOS_PATH_POINTS.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.5
    );
  }, []);

  // Smooth continuous flight loop when isPlaying = true
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        const next = prev + delta * 0.035;
        if (next >= 0.999) return 0.001; // Loop back to runway
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Checkpoint detection and auto-focus logic
  useEffect(() => {
    // Find closest waypoint
    let closestIdx = 0;
    let minDiff = Infinity;

    waypoints.forEach((wpt, idx) => {
      const diff = Math.abs(progress - wpt.tProgress);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    // If within checkpoint proximity window, lock focus view
    const nearCheckpoint = minDiff < 0.045;
    setIsAtCheckpoint(nearCheckpoint);

    if (closestIdx !== selectedIdx) {
      setSelectedIdx(closestIdx);
    }
  }, [progress, waypoints, selectedIdx]);

  const currentWpt = waypoints[selectedIdx];

  const handleSelectWaypoint = useCallback(
    (idx: number) => {
      setSelectedIdx(idx);
      setProgress(waypoints[idx].tProgress);
      setIsAtCheckpoint(true);
      setIsPlaying(false); // Pause so user can comfortably inspect
    },
    [waypoints]
  );

  const handleNext = () => {
    const nextIdx = selectedIdx < waypoints.length - 1 ? selectedIdx + 1 : 0;
    handleSelectWaypoint(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = selectedIdx > 0 ? selectedIdx - 1 : waypoints.length - 1;
    handleSelectWaypoint(prevIdx);
  };

  const handleLaunchNext = () => {
    // Trigger takeoff flight towards next checkpoint
    const nextIdx = selectedIdx < waypoints.length - 1 ? selectedIdx + 1 : 0;
    setIsAtCheckpoint(false);
    setIsPlaying(true);
    // Smoothly progress towards next waypoint
    setProgress(waypoints[selectedIdx].tProgress + 0.05);
  };

  return (
    <div className="w-full relative rounded-3xl overflow-hidden border border-[#B9E7E6] bg-gradient-to-b from-[#8EB5DE] via-[#B9E7E6] to-[#E2F4F3] shadow-xl min-h-[620px] md:min-h-[700px] flex flex-col justify-between">
      {/* Top ATMOS Masthead Bar */}
      <div className="relative z-20 px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/90 border border-white/60 flex items-center justify-center text-[#0891b2] shadow-sm">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm sm:text-base text-[#0c282d] tracking-wide">
              ATMOS
            </span>
            <span className="font-mono text-[10px] text-[#2d5f68] ml-2 tracking-widest uppercase">
              • Flight Journey
            </span>
          </div>
        </div>

        {/* Milestone Indicator */}
        <div className="flex items-center gap-2">
          <Badge className="bg-white/90 backdrop-blur-md text-[#0891b2] border border-[#B9E7E6] font-mono text-xs font-bold px-3 py-1 shadow-sm">
            CHECKPOINT {selectedIdx + 1} OF {waypoints.length}
          </Badge>
        </div>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {webGLSupported ? (
          <Canvas
            shadows
            camera={{ position: [-11, 2.4, 7.3], fov: 45, near: 0.1, far: 120 }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          >
            {/* ATMOS Signature Diffuse & Lavender Shadow Lighting */}
            <hemisphereLight args={['#FFFFFF', '#C2CEEE', 1.4]} />
            <directionalLight
              position={[-6, 12, 10]}
              intensity={1.8}
              color="#FFF5E8"
              castShadow
            />
            <directionalLight position={[10, 2, -6]} intensity={0.6} color="#BFE0F7" />

            <Suspense fallback={null}>
              {/* Ethereal Floating Dust Particles */}
              <AtmosphereParticles count={70} />

              {/* 3D Sculpted Cumulus Cloud Formations */}
              {/* Checkpoint 01 Cradling Cloud Bank (Under & Beside Plane) */}
              <CloudCluster position={[-5.8, 0.4, 6.2]} scale={3.2} seed={2} />
              <CloudCluster position={[-4.8, 0.9, 7.2]} scale={2.6} seed={12} />

              {/* Midground Valley Cloud Puff */}
              <CloudCluster position={[-3.8, 1.8, 2.0]} scale={2.4} seed={3} />

              {/* Checkpoint 02 Cradling Cloud Bank */}
              <CloudCluster position={[-2.2, 1.8, 0.6]} scale={3.2} seed={4} />
              <CloudCluster position={[-1.2, 2.2, 1.8]} scale={2.5} seed={14} />

              {/* Canyon Ascent Cloud Puff */}
              <CloudCluster position={[-1.0, 3.0, -3.2]} scale={2.8} seed={5} />

              {/* Checkpoint 03 Golden Dawn Cloud Bank */}
              <CloudCluster position={[1.2, 3.0, -4.0]} scale={3.4} seed={6} />
              <CloudCluster position={[2.2, 3.6, -2.6]} scale={2.8} seed={16} />

              {/* Sweeping Pass Cloud Puff */}
              <CloudCluster position={[2.2, 4.0, -0.6]} scale={2.6} seed={7} />

              {/* Checkpoint 04 Cradling Cloud Bank */}
              <CloudCluster position={[4.2, 4.0, 1.4]} scale={3.2} seed={8} />
              <CloudCluster position={[5.2, 4.6, 2.8]} scale={2.6} seed={18} />

              {/* Checkpoint 05 Summit Cloud Bank */}
              <CloudCluster position={[7.4, 4.8, -2.2]} scale={3.6} seed={9} />
              <CloudCluster position={[8.4, 5.4, -0.8]} scale={2.8} seed={20} />

              {/* Distant Low Horizon Cloud Formations (Never Swallows Camera) */}
              <CloudCluster position={[-6, -2.2, 0]} scale={5.5} seed={22} opacity={0.9} />
              <CloudCluster position={[0, -2.4, -2]} scale={6.0} seed={24} opacity={0.9} />
              <CloudCluster position={[6, -2.2, -4]} scale={5.5} seed={26} opacity={0.9} />

              {/* 3D Waypoint Beacons & Ring Gates */}
              <WaypointBeacons
                waypoints={waypoints}
                selectedIdx={selectedIdx}
                onSelect={handleSelectWaypoint}
              />

              {/* Contrail Trajectory Ribbon */}
              <ContrailRibbon curve={curve} progress={progress} />

              {/* Minimalist Porcelain Jet Model */}
              <AtmosAircraft curve={curve} progress={progress} />
            </Suspense>

            {/* Cinematic Camera Controller focusing on text & plane */}
            <AtmosCameraDirector
              curve={curve}
              progress={progress}
              isAtCheckpoint={isAtCheckpoint}
              selectedIdx={selectedIdx}
              waypoints={waypoints}
            />
          </Canvas>
        ) : (
          <AtmosSvgFallback
            waypoints={waypoints}
            selectedIdx={selectedIdx}
            progress={progress}
            onSelect={handleSelectWaypoint}
          />
        )}
      </div>

      {/* Editorial Checkpoint Typography Overlay ("Fokus ke Tulisannya") */}
      <div className="relative z-10 p-6 sm:p-10 max-w-md lg:max-w-lg pointer-events-none mt-auto sm:my-auto">
        <div
          key={currentWpt.id}
          className="bg-white/95 backdrop-blur-xl border border-white/80 p-6 sm:p-7 rounded-3xl shadow-xl pointer-events-auto transition-all duration-300 transform"
        >
          {/* Sub-label Category Tag */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="font-mono text-xs font-bold tracking-widest text-[#0891b2] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              CHECKPOINT #{currentWpt.order.toString().padStart(2, '0')} • {currentWpt.fixCode}
            </span>
            <span className="font-mono text-xs text-[#527d85] font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0891b2]" />
              {currentWpt.period}
            </span>
          </div>

          {/* Large Bold Editorial Headline */}
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0c282d] tracking-tight leading-tight mb-2">
            {currentWpt.institution}
          </h3>

          {/* Degree & Highlight Pill */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="font-mono text-sm font-semibold text-[#0891b2]">
              {currentWpt.degree}
            </span>
            <span className="text-[#527d85]">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E2F4F3] text-[#0891b2] border border-[#B9E7E6]">
              <Award className="w-3 h-3" />
              {currentWpt.highlight}
            </span>
          </div>

          {/* Full Story Description (Zero Truncation) */}
          <p className="text-xs sm:text-sm text-[#2d5f68] leading-relaxed mb-5 font-normal">
            {currentWpt.description}
          </p>

          {/* Interactive Flight Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#B9E7E6]/50">
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
              onClick={handleLaunchNext}
              className="bg-[#0891b2] hover:bg-[#0e7490] text-white rounded-xl h-8 px-3.5 font-mono text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Continue Flight</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Flight Controller & Waypoint Quick-Selector */}
      <div className="relative z-20 p-4 sm:p-5 m-3 sm:m-4 rounded-2xl bg-white/90 backdrop-blur-md border border-[#B9E7E6] shadow-lg flex flex-col gap-3 pointer-events-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Playback Toggle */}
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
              onClick={() => handleSelectWaypoint(0)}
              className="text-[#527d85] hover:text-[#0c282d] font-mono text-xs rounded-xl h-8 px-2"
              title="Reset to departure"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Quick-Jump Milestone Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            {waypoints.map((wpt, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={wpt.id}
                  onClick={() => handleSelectWaypoint(idx)}
                  className={`px-3 py-1 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#0891b2] text-white shadow-sm'
                      : 'bg-[#E2F4F3]/70 text-[#2d5f68] hover:bg-[#E2F4F3] border border-[#B9E7E6]/40'
                  }`}
                >
                  <span className="opacity-75 mr-1">0{wpt.order}</span>
                  <span>{wpt.institution.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Scrubber Slider */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#527d85] font-semibold">START</span>
          <input
            type="range"
            min="0.001"
            max="0.999"
            step="0.001"
            value={progress}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setProgress(val);
              setIsPlaying(false);
            }}
            className="flex-1 h-2 bg-[#E2F4F3] rounded-lg appearance-none cursor-pointer accent-[#0891b2]"
          />
          <span className="font-mono text-[10px] text-[#527d85] font-semibold">CRUISE</span>
        </div>
      </div>
    </div>
  );
}
