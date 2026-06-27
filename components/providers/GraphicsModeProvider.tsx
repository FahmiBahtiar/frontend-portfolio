'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { detectGraphicsSync, probeFps, type GraphicsMode } from '@/lib/graphics/detectGraphics';

/**
 * Auto-detects whether the browser can render on the GPU. When it can't
 * (hardware acceleration off / software renderer / very low fps), it switches the
 * whole app to a "lite" graphics mode:
 *   - exposes `useIsLiteGraphics()` so components can swap heavy renderers
 *     (e.g. the three.js scene → a 2D/SVG fallback), and
 *   - adds the `lite-graphics` class to <html> so global CSS can neutralize
 *     paint-heavy effects (blur / box-shadow / backdrop-filter / fixed parallax).
 *
 * This is orthogonal to prefers-reduced-motion: that one is about vestibular
 * safety (handled by MotionProvider + globals.css); this one is about GPU/paint
 * cost. Transform/opacity animations are intentionally left running — they stay
 * smooth on the CPU.
 */

// Below this fps the renderer is assumed too slow for GPU-style effects.
const LOW_FPS_THRESHOLD = 20;

const GraphicsModeContext = createContext<GraphicsMode>('full');

export function useGraphicsMode(): GraphicsMode {
  return useContext(GraphicsModeContext);
}

export function useIsLiteGraphics(): boolean {
  return useContext(GraphicsModeContext) === 'lite';
}

export function GraphicsModeProvider({ children }: { children: ReactNode }) {
  // Seed 'full' so SSR markup matches the first client render (no hydration
  // mismatch). Detection runs after mount and may flip this to 'lite'.
  const [mode, setMode] = useState<GraphicsMode>('full');

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;

    const applyLite = () => {
      if (cancelled) return;
      setMode('lite');
      document.documentElement.classList.add('lite-graphics');
      document.documentElement.dataset.graphics = 'lite';
    };

    const sync = detectGraphicsSync();
    if (sync.mode === 'lite') {
      applyLite();
      return;
    }

    // Renderer string was masked/generic — let a short fps probe decide so we
    // still catch software rendering on privacy-hardened browsers. The probe
    // runs ~400ms, so defer it to idle time: blocking here would add to TBT
    // during the initial load (especially on mobile).
    if (sync.inconclusive) {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      const runProbe = () => {
        probeFps().then((fps) => {
          if (!cancelled && fps < LOW_FPS_THRESHOLD) applyLite();
        });
      };
      idleId =
        typeof w.requestIdleCallback === 'function'
          ? w.requestIdleCallback(runProbe, { timeout: 3000 })
          : (window.setTimeout(runProbe, 1200) as unknown as number);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) {
        const w = window as Window & { cancelIdleCallback?: (id: number) => void };
        if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
    };
  }, []);

  return <GraphicsModeContext.Provider value={mode}>{children}</GraphicsModeContext.Provider>;
}
