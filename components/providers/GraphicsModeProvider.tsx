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
    // still catch software rendering on privacy-hardened browsers.
    if (sync.inconclusive) {
      probeFps().then((fps) => {
        if (!cancelled && fps < LOW_FPS_THRESHOLD) applyLite();
      });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return <GraphicsModeContext.Provider value={mode}>{children}</GraphicsModeContext.Provider>;
}
