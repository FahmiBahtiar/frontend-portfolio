'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  growth: number;
  color: string;
}

interface TrailNode {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export function FlightCursor() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Disable in Admin Panel to keep CMS data entry 100% standard
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    // Check if desktop mouse environment (not touch / coarse pointer)
    if (typeof window === 'undefined') return;
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      !window.matchMedia('(hover: hover)').matches;

    if (isTouch || isAdmin) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size setup
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking & physics state
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let planeX = targetX;
    let planeY = targetY;
    let planeAngle = -Math.PI / 4; // Initial heading angled up-right
    let speed = 0;
    let isVisible = false;
    let isClicking = false;
    let isHoveringInteractive = false;
    let isOverTextInput = false;

    // Smoke & Contrail buffers
    const particles: SmokeParticle[] = [];
    const trailNodes: TrailNode[] = [];
    const maxTrailNodes = 18;

    // Palette: Arctic Ice shades
    const smokeColors = [
      'rgba(226, 244, 243,', // #E2F4F3
      'rgba(185, 231, 230,', // #B9E7E6
      'rgba(111, 212, 225,', // #6FD4E1
    ];

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        planeX = targetX;
        planeY = targetY;
      }

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], label, select, summary')
        );
        const textInput = Boolean(
          target.closest('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]')
        );
        isHoveringInteractive = interactive;
        isOverTextInput = textInput;
      }
    };

    const onMouseDown = () => {
      isClicking = true;
      // Emit burst of puff smoke on click/thrust
      spawnSmokePuff(planeX, planeY, planeAngle, 10, true);
    };

    const onMouseUp = () => {
      isClicking = false;
    };

    const onMouseLeave = () => {
      isVisible = false;
    };

    const onMouseEnter = () => {
      isVisible = true;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Spawn smoke puff particle from jet engine nozzle
    function spawnSmokePuff(
      px: number,
      py: number,
      angle: number,
      count = 2,
      isBurst = false
    ) {
      // Dual engine nozzle local offsets
      const engineOffsets = [-4.5, 4.5];

      for (let i = 0; i < count; i++) {
        for (const offset of engineOffsets) {
          // World position of the engine nozzle
          const nozzleX =
            px +
            offset * Math.cos(angle) -
            10 * Math.sin(angle);
          const nozzleY =
            py +
            offset * Math.sin(angle) +
            10 * Math.cos(angle);

          // Backward ejection vector
          const backwardSpeed = isBurst ? 2 + Math.random() * 3 : 0.6 + Math.random() * 1.4;
          const ejectVx =
            Math.sin(angle) * backwardSpeed + (Math.random() - 0.5) * 0.8;
          const ejectVy =
            -Math.cos(angle) * backwardSpeed + (Math.random() - 0.5) * 0.8;

          const colorPrefix =
            smokeColors[Math.floor(Math.random() * smokeColors.length)];

          particles.push({
            x: nozzleX,
            y: nozzleY,
            vx: ejectVx,
            vy: ejectVy,
            radius: isBurst ? 3.5 + Math.random() * 3 : 2 + Math.random() * 2,
            alpha: isBurst ? 0.85 : 0.65,
            maxAlpha: isBurst ? 0.85 : 0.65,
            decay: 0.016 + Math.random() * 0.012,
            growth: 0.18 + Math.random() * 0.22,
            color: colorPrefix,
          });
        }
      }
    }

    // Main animation loop
    let animationId: number;
    let targetReticleRadius = 2.5;
    let currentReticleRadius = 2.5;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp movement towards real cursor
      const dx = targetX - planeX;
      const dy = targetY - planeY;
      speed = Math.hypot(dx, dy);

      // Lerp positioning
      planeX += dx * 0.24;
      planeY += dy * 0.24;

      // Smooth heading angle banking (rotates towards direction of movement)
      if (speed > 0.4) {
        const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
        let angleDiff = targetAngle - planeAngle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        planeAngle += angleDiff * 0.22;
      }

      // Record contrail ribbons when moving
      if (speed > 1.2 && isVisible && !isOverTextInput) {
        const leftNozzleX =
          planeX - 4 * Math.cos(planeAngle) - 10 * Math.sin(planeAngle);
        const leftNozzleY =
          planeY - 4 * Math.sin(planeAngle) + 10 * Math.cos(planeAngle);
        const rightNozzleX =
          planeX + 4 * Math.cos(planeAngle) - 10 * Math.sin(planeAngle);
        const rightNozzleY =
          planeY + 4 * Math.sin(planeAngle) + 10 * Math.cos(planeAngle);

        trailNodes.unshift({
          x1: leftNozzleX,
          y1: leftNozzleY,
          x2: rightNozzleX,
          y2: rightNozzleY,
          alpha: 0.7,
        });

        // Spawn puff clouds
        if (Math.random() < 0.8) {
          spawnSmokePuff(planeX, planeY, planeAngle, 1);
        }
      }

      if (trailNodes.length > maxTrailNodes) {
        trailNodes.pop();
      }

      // ==================== 1. DRAW CONTRAIL RIBBONS ====================
      if (trailNodes.length > 2) {
        for (let i = 0; i < trailNodes.length - 1; i++) {
          const node = trailNodes[i];
          const nextNode = trailNodes[i + 1];
          const progress = 1 - i / trailNodes.length;
          const alpha = node.alpha * progress * 0.55;

          // Left contrail line
          ctx.beginPath();
          ctx.moveTo(node.x1 * dpr, node.y1 * dpr);
          ctx.lineTo(nextNode.x1 * dpr, nextNode.y1 * dpr);
          ctx.strokeStyle = `rgba(111, 212, 225, ${alpha})`;
          ctx.lineWidth = Math.max(0.8, progress * 2.2 * dpr);
          ctx.lineCap = 'round';
          ctx.stroke();

          // Right contrail line
          ctx.beginPath();
          ctx.moveTo(node.x2 * dpr, node.y2 * dpr);
          ctx.lineTo(nextNode.x2 * dpr, nextNode.y2 * dpr);
          ctx.strokeStyle = `rgba(185, 231, 230, ${alpha})`;
          ctx.lineWidth = Math.max(0.8, progress * 2.2 * dpr);
          ctx.lineCap = 'round';
          ctx.stroke();

          node.alpha -= 0.015;
        }
      }

      // ==================== 2. DRAW PUFF SMOKE CLOUDS ====================
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.radius += p.growth;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, p.radius * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();
      }

      // ==================== 3. DRAW PRECISION HUD RETICLE ====================
      if (isVisible && !isOverTextInput) {
        targetReticleRadius = isHoveringInteractive ? 5.5 : 2.5;
        currentReticleRadius += (targetReticleRadius - currentReticleRadius) * 0.3;

        // Outer targeting ring
        ctx.beginPath();
        ctx.arc(targetX * dpr, targetY * dpr, currentReticleRadius * dpr, 0, Math.PI * 2);
        ctx.strokeStyle = isHoveringInteractive
          ? 'rgba(8, 145, 178, 0.9)'
          : 'rgba(111, 212, 225, 0.7)';
        ctx.lineWidth = 1.2 * dpr;
        ctx.stroke();

        // Center pinpoint dot
        ctx.beginPath();
        ctx.arc(targetX * dpr, targetY * dpr, 1.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#0c282d';
        ctx.fill();
      }

      // ==================== 4. DRAW FIGHTER JET AIRCRAFT ====================
      if (isVisible && !isOverTextInput) {
        ctx.save();
        ctx.translate(planeX * dpr, planeY * dpr);
        ctx.rotate(planeAngle);

        // Aircraft scale factor (expands on interactive hover, dips slightly on click)
        const scaleFactor = isClicking ? 0.92 : isHoveringInteractive ? 1.22 : 1.0;
        ctx.scale(scaleFactor * dpr, scaleFactor * dpr);

        // A. AFTERBURNER EXHAUST FLAME GLOW (Engine Nozzles)
        if (speed > 1.2 || isHoveringInteractive || isClicking) {
          const flameLength = isClicking ? 14 : isHoveringInteractive ? 12 : 7 + Math.random() * 3;
          const flameAlpha = isHoveringInteractive || isClicking ? 0.9 : 0.65;

          // Dual exhaust flames
          [-4, 4].forEach((nozzleX) => {
            const flameGrad = ctx.createLinearGradient(
              nozzleX,
              9,
              nozzleX,
              9 + flameLength
            );
            flameGrad.addColorStop(0, `rgba(255, 255, 255, ${flameAlpha})`);
            flameGrad.addColorStop(0.3, `rgba(111, 212, 225, ${flameAlpha})`);
            flameGrad.addColorStop(1, 'rgba(8, 145, 178, 0)');

            ctx.beginPath();
            ctx.moveTo(nozzleX - 1.8, 9);
            ctx.lineTo(nozzleX + 1.8, 9);
            ctx.lineTo(nozzleX, 9 + flameLength);
            ctx.closePath();
            ctx.fillStyle = flameGrad;
            ctx.fill();
          });
        }

        // B. JET SHADOW (Subtle Arctic Ice elevation shadow)
        ctx.shadowColor = 'rgba(12, 40, 45, 0.18)';
        ctx.shadowBlur = 8 * dpr;
        ctx.shadowOffsetY = 3 * dpr;

        // C. JET AIRFRAME (Fuselage & Delta Wings)
        ctx.beginPath();
        ctx.moveTo(0, -15); // Nose tip
        ctx.lineTo(3.2, -5); // Fuselage right
        ctx.lineTo(13.5, 6); // Right wing tip
        ctx.lineTo(4.5, 7.5); // Right wing root
        ctx.lineTo(3.5, 10); // Right engine nozzle
        ctx.lineTo(0, 8.5); // Center tail cone
        ctx.lineTo(-3.5, 10); // Left engine nozzle
        ctx.lineTo(-4.5, 7.5); // Left wing root
        ctx.lineTo(-13.5, 6); // Left wing tip
        ctx.lineTo(-3.2, -5); // Fuselage left
        ctx.closePath();

        // Main body color: High-contrast Dark Teal #0c282d
        ctx.fillStyle = '#0c282d';
        ctx.fill();

        // Airframe outline: Sharp Arctic Ice Cyan #6FD4E1
        ctx.strokeStyle = '#6FD4E1';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.shadowColor = 'transparent'; // Reset shadow for details

        // D. WING ACCENT STRIPES (Aviation Aerodynamic Lines)
        ctx.beginPath();
        ctx.moveTo(-11, 5.5);
        ctx.lineTo(-5, 3.5);
        ctx.moveTo(11, 5.5);
        ctx.lineTo(5, 3.5);
        ctx.strokeStyle = 'rgba(185, 231, 230, 0.7)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // E. CANOPY COCKPIT GLASS (Cyan Glow Pill)
        const canopyGrad = ctx.createLinearGradient(0, -9, 0, -1);
        canopyGrad.addColorStop(0, '#FFFFFF');
        canopyGrad.addColorStop(0.4, '#6FD4E1');
        canopyGrad.addColorStop(1, '#0891b2');

        ctx.beginPath();
        ctx.ellipse(0, -4.5, 2.2, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = canopyGrad;
        ctx.fill();

        // F. TWIN VERTICAL STABILIZERS (Tail Fins)
        ctx.beginPath();
        ctx.moveTo(-3, 6);
        ctx.lineTo(-3.5, 9.5);
        ctx.moveTo(3, 6);
        ctx.lineTo(3.5, 9.5);
        ctx.strokeStyle = '#B9E7E6';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    // Apply global CSS rule to hide standard arrow cursor on desktop while preserving text caret
    document.documentElement.classList.add('flight-cursor-enabled');

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.documentElement.classList.remove('flight-cursor-enabled');
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[99999] select-none"
      aria-hidden="true"
    />
  );
}