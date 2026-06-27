'use client';

// "Scroll Story" journey — WebGL flythrough edition.
// The camera glides along a smooth 3D Catmull-Rom curve (organic, not a rigid
// straight rail) while milestones float to alternating sides as billboard cards
// that always face the camera. Scroll or drag to fly the corridor. Text stays
// crisp because each card is real DOM rendered in 3D via drei <Html>. No HUD /
// plane metaphor — just a starfield + fog for cinematic depth. Reuses
// buildWaypoints() so it consumes the exact same Education/CMS data.

import { useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ScrollControls,
  useScroll,
  Html,
  Billboard,
  Stars,
  Line,
} from '@react-three/drei';
import { useInView } from 'motion/react';
import * as THREE from 'three';
import type { Education } from '@/lib/types/admin';
import { buildWaypoints, type Waypoint } from '@/lib/features/flight-trajectory-data';

const BG = '#05060d';
const CAM_OFFSET = new THREE.Vector3(0, 1.7, 7.5); // up + back from the path
const SIDE_X = 2.6; // how far milestones sit off the central flight line
const DEPTH = 7; // z-distance between consecutive milestones

/** Build the central flight curve from waypoints (gentle weave + altitude rise). */
function useJourney(waypoints: Waypoint[]) {
  return useMemo(() => {
    const pts = waypoints.map(
      (w, i) =>
        new THREE.Vector3(
          Math.sin(i * 0.9) * 0.9, // organic lateral weave
          (w.altitude / 100) * 3.0 - 0.6, // climb toward the summit
          -i * DEPTH,
        ),
    );
    // Catmull-Rom needs >= 2 points.
    if (pts.length === 1) pts.push(pts[0].clone().add(new THREE.Vector3(0, 0, -DEPTH)));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    return { curve, count: waypoints.length };
  }, [waypoints]);
}

/** Drives the camera along the curve from the scroll offset. */
function CameraRig({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const scroll = useScroll();
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const t = THREE.MathUtils.clamp(scroll.offset, 0, 1);
    const p = curve.getPointAt(t);
    const ahead = curve.getPointAt(Math.min(0.999, t + 0.03));

    const ease = 1 - Math.pow(0.0008, dt); // frame-rate independent smoothing
    target.current.copy(p).add(CAM_OFFSET);
    camera.position.lerp(target.current, ease);
    look.current.lerp(ahead, ease);
    camera.lookAt(look.current);
  });

  return null;
}

/** The glowing flight line, colored along the journey's own palette. */
function FlightLine({
  curve,
  waypoints,
}: {
  curve: THREE.CatmullRomCurve3;
  waypoints: Waypoint[];
}) {
  const { pts, cols } = useMemo(() => {
    const SEG = 240;
    const n = waypoints.length;
    const pts = curve.getPoints(SEG);
    const cols = pts.map((_, idx) => {
      const f = (idx / SEG) * (n - 1);
      const i = Math.floor(f);
      const a = new THREE.Color(waypoints[Math.min(i, n - 1)].color);
      const b = new THREE.Color(waypoints[Math.min(i + 1, n - 1)].color);
      return a.lerp(b, f - i);
    });
    return { pts, cols };
  }, [curve, waypoints]);

  return (
    <>
      {/* soft glow underlay */}
      <Line points={pts} vertexColors={cols} lineWidth={9} transparent opacity={0.12} />
      {/* sharp core */}
      <Line points={pts} vertexColors={cols} lineWidth={3} />
    </>
  );
}

/** Milestone nodes + billboarded DOM cards, offset to alternating sides. */
function Milestones({
  curve,
  waypoints,
}: {
  curve: THREE.CatmullRomCurve3;
  waypoints: Waypoint[];
}) {
  // drei <Html> defaults to portaling next to the canvas, where the ScrollControls
  // scroll surface paints over it. Portal the cards into ScrollControls' pinned
  // "fixed" overlay so they render ABOVE the canvas instead of being hidden.
  const scroll = useScroll();
  const portal = useMemo<MutableRefObject<HTMLElement>>(
    () => ({ current: scroll.fixed }),
    [scroll.fixed],
  );

  const nodes = useMemo(() => {
    const n = waypoints.length;
    return waypoints.map((w, i) => {
      const t = n > 1 ? i / (n - 1) : 0.5;
      const center = curve.getPointAt(t);
      const side = i % 2 === 0 ? -1 : 1;
      const pos = center.clone().add(new THREE.Vector3(side * SIDE_X, 0.5, 0));
      return { w, side, pos, center };
    });
  }, [curve, waypoints]);

  return (
    <>
      {nodes.map(({ w, side, pos, center }, i) => (
        <group key={w.id}>
          {/* connector from the flight line out to the node */}
          <Line
            points={[center.toArray(), pos.toArray()]}
            color={w.color}
            lineWidth={1.2}
            transparent
            opacity={0.45}
          />
          {/* glowing node */}
          <mesh position={pos.toArray()}>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial
              color={w.color}
              emissive={w.color}
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
          {/* DOM card, always facing the camera */}
          <Billboard position={pos.toArray()}>
            <Html
              transform
              distanceFactor={8}
              position={[side * 1.7, 1.05, 0]}
              occlude={false}
              portal={portal}
              className="pointer-events-none select-none"
            >
              <MilestoneCard w={w} index={i} />
            </Html>
          </Billboard>
        </group>
      ))}
    </>
  );
}

function MilestoneCard({ w, index }: { w: Waypoint; index: number }) {
  const desc =
    w.description && w.description.length > 96
      ? `${w.description.slice(0, 96).trimEnd()}…`
      : w.description;

  return (
    <div
      style={{
        width: 248,
        padding: '14px 16px',
        borderRadius: 14,
        background: 'rgba(8,12,22,0.82)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: `1px solid ${w.color}55`,
        boxShadow: `0 10px 34px rgba(0,0,0,0.55), 0 0 22px ${w.color}33`,
        color: '#e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: w.color,
            background: `${w.color}1f`,
            border: `1px solid ${w.color}44`,
            borderRadius: 6,
            padding: '2px 7px',
          }}
        >
          {w.badge}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
          {w.period}
        </span>
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
        <span style={{ color: w.color, opacity: 0.5, marginRight: 6 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        {w.title}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: w.color, marginTop: 3 }}>
        {w.institution}
      </div>

      {desc && (
        <p style={{ fontSize: 11.5, lineHeight: 1.5, color: '#94a3b8', margin: '8px 0 0' }}>
          {desc}
        </p>
      )}

      {w.gpa && (
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#cbd5e1',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999,
              padding: '4px 10px',
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: 999, background: w.color }}
            />
            {w.gpa}
          </span>
        </div>
      )}
    </div>
  );
}

export function Journey3DFlythrough({
  educationRecords,
}: {
  educationRecords?: Education[];
}) {
  const waypoints = useMemo(() => buildWaypoints(educationRecords), [educationRecords]);
  const { curve, count } = useJourney(waypoints);

  // Pause rendering when off-screen to save the GPU/battery.
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: '200px' });

  const pages = Math.min(8, Math.max(3, count));

  return (
    <div
      ref={wrapRef}
      className="relative h-[68vh] min-h-[520px] w-full overflow-hidden rounded-2xl"
      style={{ background: BG }}
    >
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 1.7, 9], fov: 55, near: 0.1, far: 160 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 10, 66]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 6]} intensity={0.8} />
        <Stars radius={90} depth={55} count={2600} factor={4} saturation={0} fade speed={0.4} />

        <ScrollControls pages={pages} damping={0.3}>
          <CameraRig curve={curve} />
          <FlightLine curve={curve} waypoints={waypoints} />
          <Milestones curve={curve} waypoints={waypoints} />
        </ScrollControls>
      </Canvas>

      {/* Cinematic top/bottom framing + scroll hint */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{ background: `linear-gradient(to bottom, ${BG}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{ background: `linear-gradient(to top, ${BG}, transparent)` }}
      />
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] tracking-wider text-slate-300 backdrop-blur">
        Scroll / drag to fly the journey ↕
      </div>
    </div>
  );
}
