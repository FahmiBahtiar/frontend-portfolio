// Graphics capability detection (client-only).
//
// Goal: figure out whether the browser can actually composite/paint on the GPU,
// or whether it has fallen back to software rendering (e.g. hardware acceleration
// turned off in the browser, a GPU blocklist, or a headless/VM environment).
// When software-rendered, WebGL still "works" but runs at a few fps and blur /
// box-shadow / backdrop-filter become very expensive — so we switch the site to a
// lighter "lite" mode instead.

export type GraphicsMode = 'full' | 'lite';

export interface GraphicsDetectionResult {
  mode: GraphicsMode;
  /** Human-readable reasons, useful for debugging via a data-attribute. */
  reasons: string[];
  /** True when the WebGL renderer string matches a known software backend. */
  softwareRenderer: boolean;
  /** True when no WebGL context could be created at all. */
  webglUnavailable: boolean;
  /** Mirrors the OS reduce-motion preference (informational only). */
  reducedMotion: boolean;
  /** True when the renderer string was masked/blank and FPS should decide. */
  inconclusive: boolean;
}

// Substrings (lowercase) that identify a software / non-GPU WebGL backend.
const SOFTWARE_RENDERER_HINTS = [
  'swiftshader',          // Chrome's software GL fallback
  'software',             // generic
  'llvmpipe',             // Mesa software rasterizer (Linux)
  'softpipe',             // Mesa software rasterizer
  'mesa offscreen',       // Mesa OSMesa
  'basic',                // "Microsoft Basic Render Driver" / "ANGLE ... Basic"
  'microsoft basic render',
  'google swiftshader',
] as const;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Synchronous capability check based on the WebGL renderer string.
 * Cheap — creates one throwaway, detached canvas/context and disposes it.
 * Never throws; returns 'full' on the server or on any unexpected error.
 */
export function detectGraphicsSync(): GraphicsDetectionResult {
  const reasons: string[] = [];
  const reducedMotion = prefersReducedMotion();

  const result: GraphicsDetectionResult = {
    mode: 'full',
    reasons,
    softwareRenderer: false,
    webglUnavailable: false,
    reducedMotion,
    inconclusive: false,
  };

  if (typeof document === 'undefined') return result;

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let canvas: HTMLCanvasElement | null = null;
  try {
    canvas = document.createElement('canvas');
    gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      result.webglUnavailable = true;
      result.mode = 'lite';
      reasons.push('webgl-unavailable');
      return result;
    }

    // Renderer string. WEBGL_debug_renderer_info exposes the *unmasked* GPU name;
    // some privacy-hardened browsers blank it, in which case we fall back to the
    // (often generic) RENDERER and let an FPS probe decide.
    let renderer = '';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      renderer = String(
        gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) ?? ''
      ).toLowerCase();
    }
    if (!renderer) {
      renderer = String(gl.getParameter(gl.RENDERER) ?? '').toLowerCase();
    }

    if (renderer && SOFTWARE_RENDERER_HINTS.some((h) => renderer.includes(h))) {
      result.softwareRenderer = true;
      result.mode = 'lite';
      reasons.push(`software-renderer:${renderer}`);
    } else if (!renderer || renderer === 'webgl') {
      // Masked or uselessly generic — defer to the FPS probe.
      result.inconclusive = true;
      reasons.push('renderer-masked');
    }

    return result;
  } catch {
    // Treat a hard failure as no-WebGL → lite (defensive; better safe than janky).
    result.webglUnavailable = true;
    result.mode = 'lite';
    reasons.push('webgl-error');
    return result;
  } finally {
    // Always release the throwaway context — browsers cap live GL contexts (~16).
    try {
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      /* ignore */
    }
    canvas = null;
  }
}

/**
 * Measures average FPS over a short rAF window. One-shot — NOT a continuous
 * monitor (that would itself cost frames and could oscillate the mode).
 * Used only as a secondary gate when the renderer string is inconclusive.
 * Resolves to 60 on the server / when rAF is unavailable (assume capable).
 */
export function probeFps(durationMs = 400): Promise<number> {
  if (
    typeof window === 'undefined' ||
    typeof window.requestAnimationFrame !== 'function' ||
    typeof performance === 'undefined'
  ) {
    return Promise.resolve(60);
  }

  return new Promise<number>((resolve) => {
    let frames = 0;
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= durationMs) {
        resolve(frames / (elapsed / 1000));
        return;
      }
      frames += 1;
      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  });
}
