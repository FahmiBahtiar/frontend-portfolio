'use client';

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Trophy } from 'lucide-react';
import { Education } from '@/lib/types/admin';
import { useIsLiteGraphics } from '@/components/providers/GraphicsModeProvider';
import {
  type Waypoint,
  buildWaypoints,
  pad2,
  formatETA,
  easeInOut,
  clamp,
  lerp,
  BOOT_MS,
  SURVEY_MS,
  DWELL_MS,
  TRAVEL_MS,
  SUMMIT_MS,
} from '@/lib/features/flight-trajectory-data';

/* ────────────────────────────────────────────────────────────────────────
 * Holographic Flight Trajectory
 * A cinematic aviation HUD radar that renders an education "journey" as a
 * winding 3D flight path. Line/glow based three.js scene + Tailwind HUD
 * overlay. Auto-plays a camera sequence (BOOT → SURVEY → FLY → SUMMIT) that
 * loops, driven by an IntersectionObserver. Respects prefers-reduced-motion.
 * ──────────────────────────────────────────────────────────────────────── */

interface HolographicFlightTrajectoryProps {
  educationRecords?: Education[];
}

// Soft radial glow sprite texture (white → transparent)
function makeGlowTexture(): THREE.Texture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.65)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export function HolographicFlightTrajectory({ educationRecords }: HolographicFlightTrajectoryProps = {}) {
  // ── Data → waypoints ────────────────────────────────────────────────
  const waypoints = useMemo<Waypoint[]>(() => buildWaypoints(educationRecords), [educationRecords]);

  const n = waypoints.length;

  // When the browser has no GPU acceleration, Page3Education renders the 2D
  // fallback instead — but guard here too so the WebGL loop never starts even if
  // this component is mounted directly.
  const lite = useIsLiteGraphics();

  const containerRef = useRef<HTMLDivElement>(null);

  // Overlay state (low-frequency)
  const [banner, setBanner] = useState<{ title: string; subtitle: string; show: boolean }>({ title: 'SYSTEM ONLINE', subtitle: 'INITIALIZING NAV RADAR', show: true });
  const [activePanel, setActivePanel] = useState<number | null>(null);
  // Set when WebGL can't be initialized (e.g. browser hardware acceleration is
  // off) — we render a static fallback instead of crashing the page.
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // High-frequency DOM refs (updated directly in RAF, throttled)
  const altRef = useRef<HTMLSpanElement>(null);
  const spdRef = useRef<HTMLSpanElement>(null);
  const rngRef = useRef<HTMLSpanElement>(null);
  const etaRef = useRef<HTMLSpanElement>(null);
  const hdgRef = useRef<HTMLSpanElement>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const nodeTagRef = useRef<HTMLDivElement>(null);

  // Mirrors so the RAF loop avoids redundant setState
  const phaseKeyRef = useRef<string>('');
  const bannerKeyRef = useRef<string>('');
  const panelKeyRef = useRef<number | 'none'>('none');

  // Heading tape marks (static)
  const tapeMarks = useMemo(() => {
    const marks: { deg: number; label: string }[] = [];
    for (let d = -180; d <= 540; d += 30) {
      const m = ((d % 360) + 360) % 360;
      const label = m === 0 ? 'N' : m === 90 ? 'E' : m === 180 ? 'S' : m === 270 ? 'W' : String(m);
      marks.push({ deg: d, label });
    }
    return marks;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || n === 0 || lite) return;

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Renderer / scene / camera ────────────────────────────────────
    // WebGL may be unavailable (e.g. browser "hardware acceleration" turned
    // off). The constructor throws in that case — catch it and switch to a
    // static fallback rather than letting it bubble to the page error boundary.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
      console.warn('[HolographicFlightTrajectory] WebGL unavailable, using static fallback:', err);
      setWebglUnavailable(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x06060f, 22, 72);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 34, 4);

    const sizeOf = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      return { w, h };
    };
    const applySize = () => {
      const { w, h } = sizeOf();
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    applySize();

    const glowTex = makeGlowTexture();
    const cyan = new THREE.Color('#22d3ee');

    // helper: circle points in a plane
    const circlePts = (radius: number, segs: number, plane: 'xz' | 'xy') => {
      const arr: number[] = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        if (plane === 'xz') arr.push(x, 0, y);
        else arr.push(x, y, 0);
      }
      return new Float32Array(arr);
    };
    const lineLoop = (radius: number, segs: number, plane: 'xz' | 'xy', color: string, opacity: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(circlePts(radius, segs, plane), 3));
      const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity });
      return new THREE.LineLoop(geo, mat);
    };
    const glowSprite = (color: string, scale: number, opacity: number) => {
      const mat = new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(color), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
      const s = new THREE.Sprite(mat);
      s.scale.set(scale, scale, 1);
      return s;
    };

    // ── Ground grid ──────────────────────────────────────────────────
    {
      const ext = 22, step = 2;
      const pts: number[] = [];
      for (let i = -ext; i <= ext; i += step) {
        pts.push(-ext, 0, i, ext, 0, i);
        pts.push(i, 0, -ext, i, 0, ext);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
      const mat = new THREE.LineBasicMaterial({ color: new THREE.Color('#123047'), transparent: true, opacity: 0.45 });
      scene.add(new THREE.LineSegments(geo, mat));
    }

    // ── Radar PPI (rings, axes, ticks, sweep) ────────────────────────
    const ppi = new THREE.Group();
    scene.add(ppi);
    [5, 10, 15, 20].forEach((r) => ppi.add(lineLoop(r, 96, 'xz', '#22d3ee', 0.16)));
    {
      const axes: number[] = [-20, 0, 0, 20, 0, 0, 0, 0, -20, 0, 0, 20];
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(axes), 3));
      ppi.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.12 })));
      const ticks: number[] = [];
      for (let deg = 0; deg < 360; deg += 15) {
        const a = (deg * Math.PI) / 180;
        const inner = deg % 90 === 0 ? 18.5 : 19.3;
        ticks.push(Math.cos(a) * inner, 0, Math.sin(a) * inner, Math.cos(a) * 20, 0, Math.sin(a) * 20);
      }
      const tgeo = new THREE.BufferGeometry();
      tgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ticks), 3));
      ppi.add(new THREE.LineSegments(tgeo, new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.22 })));
    }
    // sweep: bright radial line + afterglow copies + tip sprite
    const sweep = new THREE.Group();
    scene.add(sweep);
    const radial = (opacity: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.02, 0, 20, 0.02, 0]), 3));
      return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    };
    sweep.add(radial(0.9));
    for (let k = 1; k <= 6; k++) {
      const g = radial(0.35 * (1 - k / 7));
      g.rotation.y = (k * Math.PI) / 90; // small trailing offset
      sweep.add(g);
    }
    const sweepTip = glowSprite('#67e8f9', 1.6, 0.85);
    sweepTip.position.set(20, 0.05, 0);
    sweep.add(sweepTip);

    // ── Waypoint world positions ─────────────────────────────────────
    const denom = Math.max(1, n - 1);
    const nodePos: THREE.Vector3[] = waypoints.map((wp, i) => {
      const x = n > 1 ? -10 + 20 * (i / denom) : 0;
      const y = (wp.altitude / 100) * 6.6 + 0.25;
      const z = Math.sin((i / denom) * Math.PI * 1.1) * 2.2;
      return new THREE.Vector3(x, y, z);
    });

    // ── Spline control points: leadIn, wp0, mid, wp1, mid, ..., leadOut
    const ctrl: THREE.Vector3[] = [];
    const first = nodePos[0];
    const last = nodePos[n - 1];
    ctrl.push(new THREE.Vector3(first.x - 6, first.y + 1.2, first.z - 2)); // lead-in
    for (let i = 0; i < n; i++) {
      ctrl.push(nodePos[i]);
      if (i < n - 1) {
        const a = nodePos[i], b = nodePos[i + 1];
        const mid = new THREE.Vector3(
          (a.x + b.x) / 2,
          (a.y + b.y) / 2 + 0.25,
          (a.z + b.z) / 2 + (i % 2 === 0 ? 3 : -3),
        );
        ctrl.push(mid);
      }
    }
    ctrl.push(new THREE.Vector3(last.x + 6, last.y + 1.5, last.z + 2)); // lead-out

    const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
    const splinePointCount = ctrl.length; // 2n + 1
    // node param: waypoint i lives at control index (1 + 2i)
    const nodeParam = (i: number) => (1 + 2 * i) / (splinePointCount - 1);

    // ── Trajectory: dotted "planned route" + flowing direction chevrons ─
    // Reads like an active flight-plan corridor on radar rather than a plain line.
    const cyanC = new THREE.Color('#22d3ee');
    const purpleC = new THREE.Color('#a78bfa');
    const chevrons: { line: THREE.Line; mat: THREE.LineBasicMaterial }[] = [];
    {
      // faint glow halo along the route (depth only)
      const glowGeo = new THREE.TubeGeometry(curve, 360, 0.18, 8, false);
      scene.add(new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false })));

      // dotted planned route (chart-style)
      const routePts = curve.getPoints(140);
      const dotsGeo = new THREE.BufferGeometry().setFromPoints(routePts);
      const dotsMat = new THREE.PointsMaterial({ map: glowTex, color: new THREE.Color('#7dd3fc'), size: 0.22, sizeAttenuation: true, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
      scene.add(new THREE.Points(dotsGeo, dotsMat));

      // dotted ground projection
      const projGeo = new THREE.BufferGeometry().setFromPoints(routePts.map((p) => new THREE.Vector3(p.x, 0.02, p.z)));
      const projMat = new THREE.PointsMaterial({ map: glowTex, color: cyan, size: 0.14, sizeAttenuation: true, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending });
      scene.add(new THREE.Points(projGeo, projMat));

      // flowing direction chevrons (animated in the render loop)
      const chevGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.32, 0, -0.26), new THREE.Vector3(0, 0, 0.2), new THREE.Vector3(0.32, 0, -0.26),
      ]);
      const CHEVRONS = 26;
      for (let j = 0; j < CHEVRONS; j++) {
        const mat = new THREE.LineBasicMaterial({ color: cyanC.clone(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
        const line = new THREE.Line(chevGeo, mat);
        scene.add(line);
        chevrons.push({ line, mat });
      }
    }

    // ── Waypoint reticles ────────────────────────────────────────────
    interface NodeViz {
      billboard: THREE.Group;
      brackets: THREE.Group;
      bracketMats: THREE.LineBasicMaterial[];
      pingMesh: THREE.Mesh;
      pingMat: THREE.MeshBasicMaterial;
    }
    const nodes: NodeViz[] = [];

    waypoints.forEach((wp, i) => {
      const pos = nodePos[i];
      const col = wp.color;

      // billboarded group (rings, diamond, center glow, brackets)
      const billboard = new THREE.Group();
      billboard.position.copy(pos);
      billboard.add(lineLoop(0.42, 48, 'xy', col, 0.85));
      billboard.add(lineLoop(0.62, 48, 'xy', col, 0.28));
      // diamond
      {
        const d = 0.24;
        const dg = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, d, 0), new THREE.Vector3(d, 0, 0),
          new THREE.Vector3(0, -d, 0), new THREE.Vector3(-d, 0, 0),
        ]);
        billboard.add(new THREE.LineLoop(dg, new THREE.LineBasicMaterial({ color: new THREE.Color(col), transparent: true, opacity: 0.9 })));
      }
      billboard.add(glowSprite(col, 0.7, 0.8));

      // target-lock brackets (4 corner Ls)
      const brackets = new THREE.Group();
      const bracketMats: THREE.LineBasicMaterial[] = [];
      const s = 0.55, arm = 0.22;
      const corners = [
        [-s, s], [s, s], [s, -s], [-s, -s],
      ];
      corners.forEach(([cx, cy]) => {
        const sx = Math.sign(cx), sy = Math.sign(cy);
        const g = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(cx - sx * arm, cy, 0),
          new THREE.Vector3(cx, cy, 0),
          new THREE.Vector3(cx, cy - sy * arm, 0),
        ]);
        const m = new THREE.LineBasicMaterial({ color: new THREE.Color(col), transparent: true, opacity: 0 });
        bracketMats.push(m);
        brackets.add(new THREE.Line(g, m));
      });
      brackets.visible = false;
      billboard.add(brackets);
      scene.add(billboard);

      // vertical drop line + ground ring (world space, not billboarded)
      {
        const dg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(pos.x, 0.02, pos.z), new THREE.Vector3(pos.x, pos.y, pos.z)]);
        scene.add(new THREE.Line(dg, new THREE.LineBasicMaterial({ color: new THREE.Color(col), transparent: true, opacity: 0.18 })));
        const gring = lineLoop(0.5, 48, 'xz', col, 0.3);
        gring.position.set(pos.x, 0.02, pos.z);
        scene.add(gring);
      }

      // radar ping (expanding floor ring)
      const pingMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const pingMesh = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.05, 64), pingMat);
      pingMesh.rotation.x = -Math.PI / 2;
      pingMesh.position.set(pos.x, 0.03, pos.z);
      pingMesh.visible = false;
      scene.add(pingMesh);

      nodes.push({ billboard, brackets, bracketMats, pingMesh, pingMat });
    });

    // ── Aircraft (top-view neon jet silhouette) ──────────────────────
    const aircraft = new THREE.Group();
    scene.add(aircraft);
    // Silhouette lies flat in the XZ plane with the nose pointing +Z, so the
    // jet can be oriented nose-first along the route tangent.
    const sc = 0.9;
    {
      const pts = [
        [0, 1.0], [0.12, 0.2], [0.9, -0.35], [0.16, -0.3], [0.45, -0.85],
        [0, -0.6], [-0.45, -0.85], [-0.16, -0.3], [-0.9, -0.35], [-0.12, 0.2],
      ].map(([x, z]) => new THREE.Vector3(x * sc, 0, z * sc));
      const outline = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: new THREE.Color('#e6fbff'), transparent: true, opacity: 0.95 }),
      );
      aircraft.add(outline);
      const center = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 1.0 * sc), new THREE.Vector3(0, 0, -0.6 * sc)]),
        new THREE.LineBasicMaterial({ color: new THREE.Color('#e6fbff'), transparent: true, opacity: 0.6 }),
      );
      aircraft.add(center);
    }
    const halo = glowSprite('#22d3ee', 2.6, 0.5);
    aircraft.add(halo);
    const navLeft = glowSprite('#ff3b3b', 0.4, 0.95);
    navLeft.position.set(-0.9 * sc, 0.02, -0.35 * sc);
    const navRight = glowSprite('#22ff7a', 0.4, 0.95);
    navRight.position.set(0.9 * sc, 0.02, -0.35 * sc);
    const tailStrobe = glowSprite('#ffffff', 0.42, 0);
    tailStrobe.position.set(0, 0.02, -0.6 * sc);
    aircraft.add(navLeft, navRight, tailStrobe);

    // aircraft trail
    const TRAIL = 48;
    const trailPos = new Float32Array(TRAIL * 3);
    const trailCol = new Float32Array(TRAIL * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
    const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(trail);
    const trailSamples: THREE.Vector3[] = [];

    // ── Sequence state ───────────────────────────────────────────────
    const FLY_MS = DWELL_MS * n + TRAVEL_MS * (n - 1);
    const LOOP_MS = SURVEY_MS + FLY_MS + SUMMIT_MS;
    const acquired = new Array(n).fill(false);
    const lockT = new Array(n).fill(0);
    const pingActive = new Array(n).fill(false);
    const pingT = new Array(n).fill(0);
    let loopCount = -1;
    let lastArrived = -1;

    const acquire = (i: number, ping: boolean) => {
      if (i < 0 || i >= n) return;
      if (!acquired[i]) {
        acquired[i] = true;
        lockT[i] = 0;
        nodes[i].brackets.visible = true;
      }
      if (ping) { pingActive[i] = true; pingT[i] = 0; nodes[i].pingMesh.visible = true; }
    };
    const resetLoop = () => {
      for (let i = 0; i < n; i++) {
        acquired[i] = false; lockT[i] = 0;
        nodes[i].brackets.visible = false;
        nodes[i].bracketMats.forEach((m) => (m.opacity = 0));
        pingActive[i] = false; nodes[i].pingMesh.visible = false;
      }
      trailSamples.length = 0;
      lastArrived = -1;
    };

    // ── Overlay update helpers (avoid redundant React renders) ────────
    const setPhaseSafe = (p: 'BOOT' | 'SURVEY' | 'FLY' | 'SUMMIT') => {
      phaseKeyRef.current = p;
    };
    const setBannerSafe = (title: string, subtitle: string, show: boolean) => {
      const key = show ? `${title}|${subtitle}` : '';
      if (bannerKeyRef.current !== key) { bannerKeyRef.current = key; setBanner({ title, subtitle, show }); }
    };
    const setPanelSafe = (idx: number | null) => {
      const key = idx === null ? 'none' : idx;
      if (panelKeyRef.current !== key) { panelKeyRef.current = key; setActivePanel(idx); }
    };

    // node WPT tag visibility/target (driven each frame, projected to screen)
    let tagIndex = -1;
    let tagVisible = false;

    // camera smoothing targets
    const desiredPos = new THREE.Vector3().copy(camera.position);
    const desiredLook = new THREE.Vector3(0, 3, 0);
    const lookCurrent = new THREE.Vector3(0, 3, 0);

    // reusable temporaries
    const tmpPos = new THREE.Vector3();
    const tmpTan = new THREE.Vector3();
    const tmpTan2 = new THREE.Vector3();
    const tmpProj = new THREE.Vector3();
    const cvPos = new THREE.Vector3();
    const cvTan = new THREE.Vector3();
    const orbitRadius = 26;

    // orient an object so its local +Z (nose) follows `fwd`, up = world up,
    // then roll by `roll` radians around the forward axis (banking).
    const _right = new THREE.Vector3();
    const _up = new THREE.Vector3();
    const _worldUp = new THREE.Vector3(0, 1, 0);
    const _basis = new THREE.Matrix4();
    const orientToTangent = (obj: THREE.Object3D, fwd: THREE.Vector3, roll: number) => {
      _right.crossVectors(_worldUp, fwd);
      if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0); else _right.normalize();
      _up.crossVectors(fwd, _right).normalize();
      _basis.makeBasis(_right, _up, fwd);
      obj.quaternion.setFromRotationMatrix(_basis);
      if (roll) obj.rotateZ(roll);
    };
    let flowOffset = 0;
    let wrapTransStart = -1; // timestamp of the loop-wrap camera transition (-1 = inactive)
    const fromPos = new THREE.Vector3();
    const fromLook = new THREE.Vector3();

    // readout throttle
    let lastReadout = -999;
    let synthSpeed = 220;

    // visibility gating
    let inView = prefersReduced; // reduced motion → treat as static
    let seqT = 0;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) inView = true; });
    }, { threshold: 0.25 });
    io.observe(container);

    const ro = new ResizeObserver(() => applySize());
    ro.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;

    // place a node's screen position into the DOM tag
    const updateTag = (w: number, h: number) => {
      const el = nodeTagRef.current;
      if (!el) return;
      if (!tagVisible || tagIndex < 0 || panelKeyRef.current !== 'none') { el.style.opacity = '0'; return; }
      tmpProj.copy(nodePos[tagIndex]).project(camera);
      if (tmpProj.z > 1) { el.style.opacity = '0'; return; }
      const x = (tmpProj.x * 0.5 + 0.5) * w;
      const y = (-tmpProj.y * 0.5 + 0.5) * h;
      el.style.transform = `translate(-50%, -140%) translate(${x}px, ${y}px)`;
      el.style.opacity = '0.95';
      el.textContent = `WPT ${pad2(tagIndex + 1)} · ${waypoints[tagIndex].badge}`;
      el.style.color = waypoints[tagIndex].color;
      el.style.borderColor = `${waypoints[tagIndex].color}66`;
    };

    const render = () => {
      const { w, h } = sizeOf();
      const dt = Math.min(clock.getDelta() * 1000, 60);
      if (inView && !prefersReduced) seqT += dt;

      // sweep always rotates (1 rev / 6s)
      sweep.rotation.y += (Math.PI * 2 / 6000) * dt;
      sweepTip.position.set(Math.cos(-sweep.rotation.y) * 20, 0.05, Math.sin(-sweep.rotation.y) * 20);

      // ── phase resolution ──
      let aircraftParam = nodeParam(0);
      let bank = 0;
      let nextNode = 0;
      let etaMs = 0;
      let traveling = false;

      if (prefersReduced) {
        // static summit framing + summit briefing panel
        setPhaseSafe('SUMMIT');
        setBannerSafe('', '', false);
        setPanelSafe(n - 1);
        aircraftParam = nodeParam(n - 1);
        for (let i = 0; i < n; i++) acquire(i, false);
        desiredPos.set(0, 13, 32);
        desiredLook.set(0, 3.5, 0);
        nextNode = n - 1;
      } else if (seqT < BOOT_MS) {
        setPhaseSafe('BOOT');
        setBannerSafe('SYSTEM ONLINE', 'INITIALIZING NAV RADAR', true);
        setPanelSafe(null);
        const p = easeInOut(seqT / BOOT_MS);
        desiredPos.set(lerp(0, 14, p), lerp(34, 14, p), lerp(4, 26, p));
        desiredLook.set(0, 3, 0);
        aircraftParam = nodeParam(0);
        nextNode = 0;
        tagVisible = false;
      } else {
        const into = seqT - BOOT_MS;
        const lc = Math.floor(into / LOOP_MS);
        const lt = into % LOOP_MS;
        if (lc !== loopCount) {
          const wasLooping = loopCount >= 0; // not the initial BOOT → SURVEY entry
          loopCount = lc;
          resetLoop();
          if (wasLooping) {
            // start a short eased "return to start" move from the finish pose
            wrapTransStart = seqT;
            fromPos.copy(camera.position);
            fromLook.copy(lookCurrent);
          }
        }

        if (lt < SURVEY_MS) {
          setPhaseSafe('SURVEY');
          setBannerSafe('SCANNING ROUTE', 'ACQUIRING WAYPOINTS', true);
          setPanelSafe(null);
          // acquire waypoints one-by-one
          for (let i = 0; i < n; i++) {
            if (lt >= (SURVEY_MS * (i + 1)) / (n + 1) && !acquired[i]) {
              acquire(i, true);
              tagIndex = i; tagVisible = true;
            }
          }
          const a = (lt / SURVEY_MS) * 0.7;
          desiredPos.set(Math.sin(a) * orbitRadius, 13, Math.cos(a) * orbitRadius);
          desiredLook.set(0, 3, 0);
          aircraftParam = nodeParam(0);
          nextNode = Math.min(1, n - 1);
        } else if (lt < SURVEY_MS + FLY_MS) {
          setPhaseSafe('FLY');
          const flyT = lt - SURVEY_MS;
          const cycle = DWELL_MS + TRAVEL_MS;
          let i = Math.floor(flyT / cycle);
          if (i > n - 1) i = n - 1;
          const local = flyT - i * cycle;

          if (local < DWELL_MS) {
            // ── DWELL at node i ──
            if (lastArrived !== i) { lastArrived = i; acquire(i, true); }
            aircraftParam = nodeParam(i);
            nextNode = Math.min(i + 1, n - 1);

            // camera push-in → hold → pull-back
            let dist: number;
            if (local < 1500) dist = lerp(11, 6.7, easeInOut(local / 1500));
            else if (local < 4200) dist = 6.7;
            else dist = lerp(6.7, 11.9, easeInOut((local - 4200) / 800));
            const node = nodePos[i];
            const dir = new THREE.Vector3(0.62, 0.5, 1).normalize();
            desiredPos.copy(node).addScaledVector(dir, dist);
            desiredLook.copy(node);

            // sequential banner → panel → close
            if (local < 900) {
              setBannerSafe(`CHECKPOINT ${pad2(i + 1)}`, waypoints[i].title, true);
              setPanelSafe(null);
              tagIndex = i; tagVisible = true;
            } else if (local < 1500) {
              setBannerSafe('', '', false);
              setPanelSafe(null);
              tagVisible = false;
            } else if (local < 4200) {
              setBannerSafe('', '', false);
              setPanelSafe(i);
              tagVisible = false;
            } else {
              setPanelSafe(null);
              setBannerSafe('', '', false);
              tagVisible = false;
            }
          } else {
            // ── TRAVEL i → i+1 ──
            traveling = true;
            const to = Math.min(i + 1, n - 1);
            const tp = (local - DWELL_MS) / TRAVEL_MS;
            aircraftParam = lerp(nodeParam(i), nodeParam(to), easeInOut(tp));
            nextNode = to;
            etaMs = (1 - tp) * TRAVEL_MS;
            setBannerSafe('ENROUTE', `NEXT · ${waypoints[to].title}`, true);
            setPanelSafe(null);
            tagVisible = false;

            // follow-cam behind/above/beside
            curve.getPoint(aircraftParam, tmpPos);
            curve.getTangent(aircraftParam, tmpTan).setY(0).normalize();
            const side = new THREE.Vector3(-tmpTan.z, 0, tmpTan.x);
            desiredPos.copy(tmpPos).addScaledVector(tmpTan, -8).add(new THREE.Vector3(0, 4, 0)).addScaledVector(side, 3);
            desiredLook.copy(tmpPos).addScaledVector(tmpTan, 2);
          }
        } else {
          setPhaseSafe('SUMMIT');
          setBannerSafe('SUMMIT REACHED', 'MISSION COMPLETE', true);
          setPanelSafe(null);
          tagVisible = false;
          const sp = (lt - SURVEY_MS - FLY_MS) / SUMMIT_MS;
          const a = sp * 0.5;
          desiredPos.set(Math.sin(a) * 30, 14, Math.cos(a) * 30);
          desiredLook.set(0, 3.5, 0);
          aircraftParam = nodeParam(n - 1);
          nextNode = n - 1;
        }
      }

      // ── flowing direction chevrons along the route ──
      flowOffset = (flowOffset + dt * 0.00007) % 1;
      for (let j = 0; j < chevrons.length; j++) {
        const t = ((j / chevrons.length) + flowOffset) % 1;
        curve.getPoint(t, cvPos);
        curve.getTangent(t, cvTan).normalize();
        const ch = chevrons[j];
        ch.line.position.set(cvPos.x, cvPos.y + 0.05, cvPos.z);
        orientToTangent(ch.line, cvTan, 0);
        ch.mat.color.copy(cyanC).lerp(purpleC, t);
        const edge = clamp(Math.min(t / 0.05, (1 - t) / 0.05), 0, 1);
        ch.mat.opacity = 0.85 * edge;
      }

      // ── aircraft: position + nose-first orientation + banking ──
      curve.getPoint(aircraftParam, tmpPos);
      aircraft.position.copy(tmpPos);
      curve.getTangent(aircraftParam, tmpTan).normalize();
      curve.getTangent(Math.min(aircraftParam + 0.01, 1), tmpTan2).normalize();
      const h1 = Math.atan2(tmpTan.x, -tmpTan.z);
      const h2 = Math.atan2(tmpTan2.x, -tmpTan2.z);
      let dh = h2 - h1;
      while (dh > Math.PI) dh -= Math.PI * 2;
      while (dh < -Math.PI) dh += Math.PI * 2;
      bank = clamp(dh * 6, -0.6, 0.6);
      orientToTangent(aircraft, tmpTan, bank);

      // tail strobe double-flash (~1.1s)
      const cyc = seqT % 1100;
      tailStrobe.material.opacity = (cyc < 90 || (cyc > 200 && cyc < 290)) ? 0.95 : 0;

      // trail
      if (phaseKeyRef.current === 'FLY' && !prefersReduced) {
        trailSamples.unshift(tmpPos.clone());
        if (trailSamples.length > TRAIL) trailSamples.pop();
      }
      for (let i = 0; i < TRAIL; i++) {
        const s = trailSamples[i] || trailSamples[trailSamples.length - 1] || tmpPos;
        trailPos[i * 3] = s.x; trailPos[i * 3 + 1] = s.y; trailPos[i * 3 + 2] = s.z;
        const f = 1 - i / TRAIL;
        trailCol[i * 3] = 0.4 * f; trailCol[i * 3 + 1] = 0.85 * f; trailCol[i * 3 + 2] = 0.95 * f;
      }
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.attributes.color.needsUpdate = true;
      trail.visible = trailSamples.length > 1;

      // ── billboards face camera ──
      for (const nd of nodes) nd.billboard.quaternion.copy(camera.quaternion);

      // lock bracket animation (scale 2.4/0 → 1/0.9 over ~450ms)
      for (let i = 0; i < n; i++) {
        if (acquired[i]) {
          lockT[i] += dt;
          const p = clamp(lockT[i] / 450, 0, 1);
          const e = easeInOut(p);
          nodes[i].brackets.scale.setScalar(lerp(2.4, 1, e));
          nodes[i].bracketMats.forEach((m) => (m.opacity = lerp(0, 0.9, e)));
        }
        if (pingActive[i]) {
          pingT[i] += dt;
          const p = pingT[i] / 900;
          if (p >= 1) { pingActive[i] = false; nodes[i].pingMesh.visible = false; nodes[i].pingMat.opacity = 0; }
          else {
            const sc = lerp(0.4, 2.6, p);
            nodes[i].pingMesh.scale.setScalar(sc);
            nodes[i].pingMat.opacity = lerp(0.6, 0, p);
          }
        }
      }

      // ── camera smoothing ──
      if (prefersReduced) {
        camera.position.copy(desiredPos);
        lookCurrent.copy(desiredLook);
      } else if (wrapTransStart >= 0) {
        // smooth eased sweep from the finish pose back to the start pose
        const TRANS_MS = 1100;
        const p = (seqT - wrapTransStart) / TRANS_MS;
        if (p >= 1) {
          wrapTransStart = -1;
          camera.position.lerp(desiredPos, 0.035);
          lookCurrent.lerp(desiredLook, 0.035);
        } else {
          const e = easeInOut(clamp(p, 0, 1));
          camera.position.lerpVectors(fromPos, desiredPos, e);
          lookCurrent.lerpVectors(fromLook, desiredLook, e);
        }
      } else {
        const lf = traveling ? 0.06 : 0.035;
        camera.position.lerp(desiredPos, lf);
        lookCurrent.lerp(desiredLook, lf);
      }
      camera.lookAt(lookCurrent);

      // ── HUD readouts (throttled ~90ms) ──
      if (seqT - lastReadout > 90 || lastReadout < 0) {
        lastReadout = seqT;
        const altPct = clamp(((tmpPos.y - 0.25) / 6.6) * 100, 0, 100);
        const targetSpeed = 180 + (traveling ? 220 : phaseKeyRef.current === 'FLY' ? 90 : 60);
        synthSpeed += (targetSpeed - synthSpeed) * 0.08;
        const spd = Math.round(synthSpeed + 18 * Math.sin(seqT / 500));
        const rangeNm = tmpPos.distanceTo(nodePos[nextNode]);
        const hdg = Math.round((((h1 * 180) / Math.PI) + 360) % 360);
        if (altRef.current) altRef.current.textContent = `${altPct.toFixed(0)}%`;
        if (spdRef.current) spdRef.current.textContent = `${spd}`;
        if (rngRef.current) rngRef.current.textContent = `${rangeNm.toFixed(1)}`;
        if (etaRef.current) etaRef.current.textContent = traveling ? formatETA(etaMs) : '00:00';
        if (hdgRef.current) hdgRef.current.textContent = pad2(Math.floor(hdg / 10) * 10).padStart(3, '0');
        if (tapeRef.current) tapeRef.current.style.transform = `translateX(${90 - (hdg / 30) * 24}px)`;
        updateTag(w, h);
      }

      renderer.render(scene, camera);
      if (!prefersReduced) raf = requestAnimationFrame(render);
    };

    // Kick off via rAF so no setState happens synchronously during the effect.
    // In reduced-motion mode render() runs once and does not reschedule.
    raf = requestAnimationFrame(render);

    // ── cleanup ──
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      scene.traverse((obj) => {
        const withParts = obj as unknown as {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };
        withParts.geometry?.dispose();
        const mat = withParts.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      glowTex.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [waypoints, n, lite]);

  const active = activePanel !== null ? waypoints[activePanel] : null;

  // Static fallback when WebGL isn't available (hardware acceleration off, etc),
  // or when lite mode is on and this component was mounted directly.
  // Keeps the Education content readable without the interactive 3D scene.
  if (webglUnavailable || lite) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/15 p-6 md:p-8"
        style={{ background: 'radial-gradient(120% 120% at 50% 20%, #0a0a1c 0%, #060612 70%)' }}
      >
        <div className="flex items-center gap-2 text-cyan-300/90 font-mono text-[10px] md:text-xs mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="tracking-[0.2em]">TRAJECTORY ASCENT PLAN · STATIC MODE</span>
        </div>
        <ol className="space-y-3">
          {waypoints.map((w, i) => (
            <li
              key={w.id ?? i}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <span className="mt-0.5 font-mono text-xs text-cyan-300/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="text-white font-semibold">{w.title}</div>
                <div className="text-white/60 text-sm">{w.institution}</div>
                {w.period && <div className="text-cyan-300/50 text-xs mt-0.5">{w.period}</div>}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[11px] text-white/40 font-mono">
          Enable your browser&apos;s graphics acceleration to view the interactive 3D flight path.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* 3D container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/15"
        style={{ height: 'clamp(480px, 60vw, 620px)', background: 'radial-gradient(120% 120% at 50% 20%, #0a0a1c 0%, #060612 70%)' }}
      >
        {/* ── HUD overlay (pointer-events:none) ── */}
        <div className="absolute inset-0 pointer-events-none font-mono select-none">
          {/* Corner brackets */}
          <span className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-cyan-400/50" />
          <span className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-cyan-400/50" />
          <span className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-cyan-400/50" />
          <span className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-cyan-400/50" />

          {/* Top-left status */}
          <div className="absolute top-5 left-6 text-[10px] md:text-xs">
            <div className="flex items-center gap-2 text-cyan-300/90">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="tracking-[0.2em]">NAV RADAR · ONLINE</span>
            </div>
            <div className="text-cyan-300/40 mt-1 tracking-wider">TRAJECTORY ASCENT PLAN</div>
          </div>

          {/* Top-center heading tape */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="relative w-[180px] h-6 overflow-hidden">
              <div ref={tapeRef} className="absolute top-1 left-0 flex will-change-transform">
                {tapeMarks.map((m) => (
                  <div key={m.deg} className="w-6 text-center text-[9px] text-cyan-300/50 shrink-0">{m.label}</div>
                ))}
              </div>
              {/* caret */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-[6px] border-l-transparent border-r-transparent border-t-cyan-300" />
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#060612] to-transparent" />
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#060612] to-transparent" />
            </div>
            <div className="text-[10px] text-cyan-300/80 tracking-widest mt-0.5">HDG <span ref={hdgRef}>000</span></div>
          </div>

          {/* Top-right readouts */}
          <div className="absolute top-5 right-6 text-right text-[10px] md:text-xs space-y-1.5">
            {[
              { label: 'ALTITUDE', ref: altRef, unit: '' },
              { label: 'AIRSPEED', ref: spdRef, unit: 'KT' },
              { label: 'RANGE NXT', ref: rngRef, unit: 'NM' },
              { label: 'ETA', ref: etaRef, unit: '' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-end gap-2">
                <span className="text-cyan-300/40 tracking-wider">{r.label}</span>
                <span className="min-w-[52px] text-right text-cyan-200 tabular-nums">
                  <span ref={r.ref}>—</span>
                  {r.unit && <span className="text-cyan-300/40 ml-1">{r.unit}</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Center phase banner — hidden whenever a briefing panel is open */}
          <AnimatePresence>
            {banner.show && activePanel === null && (
              <motion.div
                key={`${banner.title}-${banner.subtitle}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="absolute top-[4.75rem] md:top-24 left-1/2 -translate-x-1/2 text-center w-full px-4"
              >
                <div className="text-base md:text-xl tracking-[0.25em] text-cyan-200" style={{ textShadow: '0 0 18px rgba(34,211,238,0.55)' }}>
                  {banner.title}
                </div>
                {banner.subtitle && (
                  <div className="text-[10px] md:text-xs tracking-[0.3em] text-cyan-300/50 mt-2">{banner.subtitle}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Small node WPT tag (positioned via JS) */}
          <div
            ref={nodeTagRef}
            className="absolute top-0 left-0 px-2 py-0.5 text-[9px] tracking-wider rounded border bg-[#060612]/70 backdrop-blur-sm whitespace-nowrap"
            style={{ opacity: 0, color: '#22d3ee', borderColor: '#22d3ee66', transition: 'opacity 0.25s' }}
          />

          {/* Bottom caption */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-cyan-300/40 tracking-[0.3em]">
            TRAJECTORY ASCENT · {n} WAYPOINTS
          </div>

          {/* Scanline + vignette */}
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #22d3ee 0px, transparent 1px, transparent 3px, #22d3ee 4px)' }} />
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 120px 20px rgba(0,0,0,0.65)' }} />

          {/* ── Briefing panel ── */}
          <AnimatePresence>
            {active && (
              <motion.div
                key={`panel-${activePanel}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center p-4"
              >
                {/* dimmed backdrop */}
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
                <motion.div
                  initial={{ scale: 0.93, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.93, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="relative w-full max-w-md rounded-2xl border bg-[#080816]/90 backdrop-blur-xl p-5 md:p-6 overflow-hidden"
                  style={{ borderColor: active.color, boxShadow: `0 0 50px ${active.color}33, 0 20px 60px rgba(0,0,0,0.6)` }}
                >
                  {/* top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${active.color}, transparent)` }} />
                  {/* HUD corner brackets */}
                  <span className="absolute top-2 left-2 w-4 h-4 border-t border-l" style={{ borderColor: active.color }} />
                  <span className="absolute top-2 right-2 w-4 h-4 border-t border-r" style={{ borderColor: active.color }} />
                  <span className="absolute bottom-2 left-2 w-4 h-4 border-b border-l" style={{ borderColor: active.color }} />
                  <span className="absolute bottom-2 right-2 w-4 h-4 border-b border-r" style={{ borderColor: active.color }} />

                  {/* top row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ borderColor: `${active.color}55`, background: `${active.color}15` }}>
                        <Plane className="w-5 h-5" style={{ color: active.color }} />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] tracking-widest border" style={{ color: active.color, borderColor: `${active.color}66`, background: `${active.color}12` }}>
                        {active.badge}
                      </span>
                    </div>
                    <span className="text-[10px] tracking-widest text-white/40">WPT {pad2((activePanel ?? 0) + 1)}/{pad2(n)}</span>
                  </div>

                  {/* title */}
                  <h3 className="text-white text-xl md:text-2xl font-bold leading-tight mb-1">{active.title}</h3>
                  <p className="text-[11px] md:text-xs text-white/50 mb-4">{active.institution} · {active.period}</p>

                  {/* description */}
                  {active.description && (
                    <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-4">{active.description}</p>
                  )}

                  {/* divider */}
                  <div className="h-px w-full mb-4" style={{ background: `linear-gradient(90deg, ${active.color}40, transparent)` }} />

                  {/* gpa */}
                  {active.gpa && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" style={{ color: active.color }} />
                      <span className="text-sm font-mono" style={{ color: active.color }}>{active.gpa}</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
