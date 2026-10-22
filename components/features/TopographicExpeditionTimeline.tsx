'use client';

import { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  Mountain,
  Compass,
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type { Education } from '@/lib/types/admin';
import { FALLBACK_EDUCATION_RECORDS } from '@/lib/fallback-data';

// ── Terrain model configuration ───────────────────────────────────────────
const TERRAIN_MODELS = {
  puncak_jaya: {
    name: 'Puncak Jaya (Carstensz)',
    elevation: '4,884m',
    coords: "4°05'S 137°11'E",
    region: 'Papua, Indonesia (Seven Summits)',
    glb: '/models/terrain/puncak_jaya.glb',
    texture: '/models/terrain/puncak_jaya.jpg',
    scale: 0.0003,
    verticalExaggeration: 1.5,
  },
  everest: {
    name: 'Mount Everest (Chomolungma)',
    elevation: '8,848m',
    coords: "27°59'N 86°55'E",
    region: 'Himalayas, Nepal / Tibet',
    glb: '/models/terrain/everest.glb',
    texture: '/models/terrain/everest.jpg',
    scale: 0.00028,
    verticalExaggeration: 1.4,
  },
};

type TerrainKey = keyof typeof TERRAIN_MODELS;

// Authentic ridge waypoints along Puncak Jaya (X, Y up, Z)
const PUNCAK_JAYA_CAMPS = [
  { x: 0.18, y: 0.35, z: -4.8, altitudeLabel: '1,200m ASL', stage: 'BASE CAMP' },
  { x: -2.3, y: 0.85, z: -3.8, altitudeLabel: '2,100m ASL', stage: 'CAMP 1' },
  { x: -1.8, y: 1.35, z: 2.2, altitudeLabel: '3,050m ASL', stage: 'CAMP 2' },
  { x: 3.2, y: 1.85, z: -0.5, altitudeLabel: '3,950m ASL', stage: 'HIGH CAMP' },
  { x: -0.85, y: 2.28, z: 0.18, altitudeLabel: '4,884m SUMMIT', stage: '🎓 SUMMIT' },
];

interface ExpeditionRecord extends Education {
  altitudeLabel: string;
  stageName: string;
  campCoord: [number, number, number];
}

// ── 3D Terrain Mesh Component ───────────────────────────────────────────
function MountainMesh({
  terrainKey,
  mode,
}: {
  terrainKey: TerrainKey;
  mode: 'topo' | 'satellite';
}) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const config = TERRAIN_MODELS[terrainKey];

  useEffect(() => {
    let active = true;
    const loader = new GLTFLoader();

    loader.load(config.glb, (gltf) => {
      if (!active) return;
      let meshObj: THREE.Mesh | null = null;
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && !meshObj) {
          meshObj = child as THREE.Mesh;
        }
      });

      if (!meshObj) return;
      const targetGeom = (meshObj as THREE.Mesh).geometry.clone();

      // Rotate: glb Z is altitude -> Three.js Y is UP
      targetGeom.computeBoundingBox();
      const bb = targetGeom.boundingBox!;
      const cx = (bb.min.x + bb.max.x) / 2;
      const cy = (bb.min.y + bb.max.y) / 2;
      
      targetGeom.translate(-cx, -cy, -bb.min.z);
      targetGeom.rotateX(-Math.PI / 2);
      
      // Scale to standard view size
      const s = config.scale;
      targetGeom.scale(s, s * config.verticalExaggeration, s);
      targetGeom.computeVertexNormals();

        // Generate height-based vertex colors for Arctic Topo mode
        const count = targetGeom.attributes.position.count;
        const colors = new Float32Array(count * 3);
        const pos = targetGeom.attributes.position;
        
        // Find min/max Y
        let minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < count; i++) {
          const y = pos.getY(i);
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }

        const cBase = new THREE.Color('#E2F4F3'); // Valley Pale Aqua
        const cMid = new THREE.Color('#6FD4E1');  // Ridge Medium Cyan
        const cPeak = new THREE.Color('#FFFFFF'); // Snowcap White

        for (let i = 0; i < count; i++) {
          const y = pos.getY(i);
          const t = Math.max(0, Math.min(1, (y - minY) / (maxY - minY)));
          const col = t < 0.5 ? cBase.clone().lerp(cMid, t * 2) : cMid.clone().lerp(cPeak, (t - 0.5) * 2);
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }

        targetGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        setGeometry(targetGeom);
    });

    const texLoader = new THREE.TextureLoader();
    texLoader.load(config.texture, (tex) => {
      if (!active) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      setTexture(tex);
    });

    return () => {
      active = false;
    };
  }, [config]);

  // Subtle breathing animation for active mountain
  useFrame((state) => {
    if (meshRef.current && mode === 'topo') {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissive) {
        mat.emissiveIntensity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      }
    }
  });

  if (!geometry) return null;

  return (
    <group>
      {/* Base Solid Mountain */}
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        {mode === 'satellite' && texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.8}
            metalness={0.1}
            flatShading={false}
          />
        ) : (
          <meshStandardMaterial
            vertexColors
            roughness={0.65}
            metalness={0.2}
            emissive="#0891b2"
            emissiveIntensity={0.18}
            flatShading={false}
          />
        )}
      </mesh>

      {/* Topographic Wireframe / Elevation Grid Overlay */}
      {mode === 'topo' && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            wireframe
            color="#0891b2"
            transparent
            opacity={0.16}
            depthTest
          />
        </mesh>
      )}

      {/* Mountain Base Ground Disc */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 7.8, 64]} />
        <meshBasicMaterial color="#B9E7E6" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Expedition Path Spine & Camp Markers ──────────────────────────────────
function ExpeditionClimbingRoute({
  camps,
  selectedIdx,
  onSelectCamp,
}: {
  camps: ExpeditionRecord[];
  selectedIdx: number;
  onSelectCamp: (idx: number) => void;
}) {
  const points = useMemo(() => {
    return camps.map((c) => new THREE.Vector3(...c.campCoord));
  }, [camps]);

  // Smooth spline curve between waypoints
  const splinePoints = useMemo(() => {
    if (points.length < 2) return points;
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
    return curve.getPoints(120);
  }, [points]);

  return (
    <group>
      {/* Glowing Route Spine */}
      <Line
        points={splinePoints}
        color="#0891b2"
        lineWidth={3.5}
        transparent
        opacity={0.85}
      />
      {/* Route Glow Underlay */}
      <Line
        points={splinePoints}
        color="#6FD4E1"
        lineWidth={9}
        transparent
        opacity={0.35}
      />

      {/* Camp Markers on Mountain */}
      {camps.map((camp, idx) => {
        const isSelected = idx === selectedIdx;
        const [x, y, z] = camp.campCoord;

        return (
          <group
            key={camp.id || idx}
            position={[x, y, z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCamp(idx);
            }}
          >
            {/* Beacon Pin Pole */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
              <meshBasicMaterial color={isSelected ? '#0891b2' : '#527d85'} />
            </mesh>

            {/* Glowing Beacon Spheres */}
            <mesh position={[0, 0.7, 0]}>
              <sphereGeometry args={[isSelected ? 0.22 : 0.14, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#FFFFFF' : '#6FD4E1'}
                emissive={isSelected ? '#6FD4E1' : '#0891b2'}
                emissiveIntensity={isSelected ? 3.0 : 1.2}
                toneMapped={false}
              />
            </mesh>

            {/* Active Radar Elevation Ring */}
            {isSelected && (
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.55, 32]} />
                <meshBasicMaterial
                  color="#6FD4E1"
                  transparent
                  opacity={0.8}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ── Camera Controller smoothly framing selected camp ──────────────────────
function CameraFocusController({ targetCoord }: { targetCoord: [number, number, number] }) {
  const { camera } = useThree();
  const targetVec = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    // Offset camera slightly up and out from active camp
    const [tx, ty, tz] = targetCoord;
    targetVec.current.set(tx * 0.4 + 4.2, ty + 2.4, tz * 0.4 + 6.8);
    const ease = 1 - Math.pow(0.005, dt);
    camera.position.lerp(targetVec.current, ease);
  });

  return null;
}

// ── Master Component ──────────────────────────────────────────────────────
export function TopographicExpeditionTimeline({
  educationRecords,
}: {
  educationRecords?: Education[];
}) {
  const [activeTerrain, setActiveTerrain] = useState<TerrainKey>('puncak_jaya');
  const [renderMode, setRenderMode] = useState<'topo' | 'satellite'>('topo');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // Normalize education data with authentic Puncak Jaya ridge checkpoints
  const records: ExpeditionRecord[] = useMemo(() => {
    const raw = (educationRecords && educationRecords.length > 0 ? educationRecords : FALLBACK_EDUCATION_RECORDS)
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return raw.map((r, i) => {
      const camp = PUNCAK_JAYA_CAMPS[Math.min(i, PUNCAK_JAYA_CAMPS.length - 1)];
      return {
        ...r,
        altitudeLabel: camp.altitudeLabel,
        stageName: camp.stage,
        campCoord: [camp.x, camp.y, camp.z] as [number, number, number],
      };
    });
  }, [educationRecords]);

  const currentCamp = records[selectedIdx] || records[0];
  const terrainInfo = TERRAIN_MODELS[activeTerrain];

  // Navigation handlers
  const handlePrev = () => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : records.length - 1));
  };
  const handleNext = () => {
    setSelectedIdx((prev) => (prev < records.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Showcase Grid: 3D Mountain Canvas (Left) + Master Detail Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Interactive Mountain Viewport (7 Cols on desktop) */}
        <div className="lg:col-span-7 relative h-[480px] sm:h-[540px] md:h-[600px] rounded-3xl border border-[#B9E7E6] bg-gradient-to-b from-[#FFFFFF] via-[#F4FBFB] to-[#E2F4F3] overflow-hidden shadow-sm flex flex-col">
          {/* Top HUD: Coordinates & Terrain Info */}
          <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#B9E7E6] shadow-2xs pointer-events-auto">
              <Compass className="w-4 h-4 text-[#0891b2] animate-pulse" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] font-extrabold text-[#0c282d] uppercase tracking-wider">
                  {terrainInfo.name}
                </span>
                <span className="font-mono text-[9px] text-[#527d85]">
                  {terrainInfo.coords} • {terrainInfo.elevation}
                </span>
              </div>
            </div>

            {/* Quick Controls: Mountain Selector, Rotate & Mode Toggles */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
              <button
                onClick={() =>
                  setActiveTerrain((prev) => (prev === 'puncak_jaya' ? 'everest' : 'puncak_jaya'))
                }
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#B9E7E6] bg-white text-[#0c282d] text-xs font-mono font-bold hover:border-[#6FD4E1] shadow-2xs transition-all"
                title="Switch Mountain Peak (Puncak Jaya / Everest)"
              >
                <Mountain className="w-3.5 h-3.5 text-[#0891b2]" />
                <span className="uppercase text-[9px] sm:text-[10px] hidden sm:inline">
                  {activeTerrain === 'puncak_jaya' ? 'Puncak Jaya' : 'Everest'}
                </span>
              </button>

              <button
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`p-2 rounded-full border transition-all ${
                  autoRotate
                    ? 'bg-[#E2F4F3] border-[#6FD4E1] text-[#0891b2]'
                    : 'bg-white border-[#B9E7E6] text-[#527d85] hover:text-[#0c282d]'
                }`}
                title="Toggle Auto-Rotation"
                aria-label="Toggle Auto-Rotation"
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setRenderMode((prev) => (prev === 'topo' ? 'satellite' : 'topo'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#B9E7E6] bg-white text-[#0c282d] text-xs font-mono font-bold hover:border-[#6FD4E1] shadow-2xs transition-all"
                title="Switch Topographic Contour / Satellite Imagery"
              >
                <Layers className="w-3.5 h-3.5 text-[#0891b2]" />
                <span className="uppercase text-[9px] sm:text-[10px]">
                  {renderMode === 'topo' ? 'Contours' : 'Satellite'}
                </span>
              </button>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center font-mono text-sm text-[#527d85]">Loading Copernicus 3D Terrain...</div>}>
              <Canvas
                shadows
                camera={{ position: [5, 4, 8], fov: 48, near: 0.1, far: 50 }}
                dpr={[1, 2]}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
              >
                <color attach="background" args={['#F7FCFC']} />
                <ambientLight intensity={0.9} />
                <directionalLight position={[10, 15, 8]} intensity={1.4} castShadow />
                <directionalLight position={[-8, 6, -5]} intensity={0.5} />

                {/* Smooth Camera Focusing */}
                <CameraFocusController targetCoord={currentCamp.campCoord} />

                {/* 3D Mountain Mesh */}
                <MountainMesh
                  terrainKey={activeTerrain}
                  mode={renderMode}
                />

                {/* Expedition Route & Camp Nodes */}
                <ExpeditionClimbingRoute
                  camps={records}
                  selectedIdx={selectedIdx}
                  onSelectCamp={setSelectedIdx}
                />

                <OrbitControls
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.8}
                  enablePan={false}
                  minDistance={4}
                  maxDistance={14}
                  maxPolarAngle={Math.PI / 2 - 0.05}
                />
              </Canvas>
            </Suspense>
          </div>

          {/* Bottom HUD: Live Altimeter Telemetry */}
          <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#B9E7E6] shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono text-xs font-bold text-[#0c282d]">
                ALTIMETER: <span className="text-[#0891b2]">{currentCamp.altitudeLabel}</span>
              </span>
            </div>

            <div className="font-mono text-[10px] text-[#527d85] bg-white/80 px-2.5 py-1 rounded-lg border border-[#B9E7E6]">
              Drag to orbit 360° • Scroll to zoom
            </div>
          </div>
        </div>

        {/* Milestone Detail Card (5 Cols on desktop - Zero Truncation) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-[#B9E7E6] bg-white shadow-sm">
          {/* Card Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2F4F3] border border-[#B9E7E6]">
                <Mountain className="w-3.5 h-3.5 text-[#0891b2]" />
                <span className="font-mono text-xs font-extrabold text-[#0891b2] tracking-wider uppercase">
                  {currentCamp.stageName}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{currentCamp.gpa || 'Complete'}</span>
              </div>
            </div>

            {/* Degree Title & Institution */}
            <div>
              <p className="font-mono text-xs text-[#0891b2] font-extrabold tracking-widest uppercase mb-1">
                MILESTONE 0{selectedIdx + 1} OF 0{records.length}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0c282d] tracking-tight leading-tight">
                {currentCamp.degree}
              </h3>
              <p className="text-base sm:text-lg font-bold text-[#2d5f68] mt-1.5">
                {currentCamp.institution}
              </p>
            </div>

            {/* Timeline Period Bar */}
            <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-[#E2F4F3]/40 border border-[#B9E7E6]">
              <Calendar className="w-4 h-4 text-[#0891b2]" />
              <span className="font-mono text-xs sm:text-sm font-bold text-[#0c282d]">
                Period: {currentCamp.period}
              </span>
            </div>

            {/* Full Narrative Description (No Truncation) */}
            <div className="pt-2">
              <p className="text-sm sm:text-base text-[#2d5f68] leading-relaxed">
                {currentCamp.description ||
                  `Dedicated study and milestone achievements at ${currentCamp.institution}, building core skills and engineering discipline toward professional mastery.`}
              </p>
            </div>
          </div>

          {/* Stepper Navigation Footer */}
          <div className="pt-6 mt-6 border-t border-[#B9E7E6]/70 flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#B9E7E6] bg-white hover:border-[#6FD4E1] hover:text-[#0891b2] text-[#0c282d] font-mono text-xs font-bold transition-all shadow-2xs group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Prev Camp</span>
            </button>

            <div className="flex items-center gap-1.5">
              {records.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === selectedIdx ? 'w-6 bg-[#0891b2]' : 'w-2 bg-[#B9E7E6] hover:bg-[#6FD4E1]'
                  }`}
                  aria-label={`Jump to camp ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#B9E7E6] bg-white hover:border-[#6FD4E1] hover:text-[#0891b2] text-[#0c282d] font-mono text-xs font-bold transition-all shadow-2xs group"
            >
              <span>Next Camp</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Jump Expedition Stations Bar */}
      <div className="rounded-2xl border border-[#B9E7E6] bg-white/95 p-3 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {records.map((rec, i) => {
            const isSelected = i === selectedIdx;
            return (
              <button
                key={rec.id || i}
                onClick={() => setSelectedIdx(i)}
                className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#E2F4F3] border-[#6FD4E1] shadow-xs'
                    : 'bg-white border-[#B9E7E6]/70 hover:border-[#6FD4E1] hover:bg-[#F4FBFB]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-mono text-[10px] font-extrabold uppercase ${isSelected ? 'text-[#0891b2]' : 'text-[#527d85]'}`}>
                    {rec.stageName}
                  </span>
                  <span className="font-mono text-[9px] text-[#0891b2] font-semibold">
                    {rec.altitudeLabel.split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#0c282d] truncate">
                  {rec.degree}
                </p>
                <p className="text-[11px] text-[#527d85] font-mono truncate mt-0.5">
                  {rec.period}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
