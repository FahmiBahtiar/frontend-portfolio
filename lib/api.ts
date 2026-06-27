// API Configuration
import { API_BASE_URL } from '@/lib/config';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 8000, // 8 seconds — enough for cold start

  // Admin (authenticated write) endpoints. Used for POST/PUT/DELETE that go
  // straight to the backend. Reads are served from PUBLIC_ENDPOINTS below.
  ENDPOINTS: {
    // Hero Section
    HERO_PROFILE: '/api/admin/hero/profile',
    HERO_SOCIAL: '/api/admin/hero/social',

    // About Section
    PASSIONS: '/api/admin/about/passions',
    HIGHLIGHTS: '/api/admin/about/highlights',
    SKILLS: '/api/admin/about/skills',
    LANYARD: '/api/admin/about/lanyard',

    // Education Section
    EDUCATION: '/api/admin/education',
    ACHIEVEMENTS: '/api/admin/education/achievements',

    // Experience & Projects Section
    FLIGHTS: '/api/admin/experience/flights',
    PROJECTS: '/api/admin/experience/projects',

    // Contact Section
    CONTACT: '/api/admin/contact',

    // Gallery Section
    GALLERY: '/gallery',
  },

  // Public (unauthenticated read) endpoints consumed by the landing page.
  // These map to the backend's *PublicController routes — no "admin" in the path.
  PUBLIC_ENDPOINTS: {
    // Hero Section
    HERO_PROFILE: '/api/hero/profile',
    HERO_SOCIAL: '/api/hero/social',

    // About Section
    PASSIONS: '/api/about/passions',
    HIGHLIGHTS: '/api/about/highlights',
    SKILLS: '/api/about/skills',
    LANYARD: '/api/about/lanyard',

    // Education Section
    EDUCATION: '/api/education',
    ACHIEVEMENTS: '/api/education/achievements',

    // Experience & Projects Section
    FLIGHTS: '/api/experience/flights',
    PROJECTS: '/api/experience/projects',
  },
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API fetch function with timeout
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_CONFIG.TIMEOUT);

  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeoutId);
      throw new ApiError('Request aborted', 499);
    }
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle responses without body (like 204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      error
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// ----------------------------------------------------------------
// Retry helper — up to maxAttempts with progressive delay
// Does NOT add per-request timeout; uses API_CONFIG.TIMEOUT above.
// Returns { data, warmingUp } so callers can reflect warming-up state.
// ----------------------------------------------------------------
export interface RetryCallbacks {
  onWarmingUp?: () => void; // called after first failure
  onSuccess?: () => void;
}

export async function apiRequestWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  maxAttempts = 4,
  callbacks: RetryCallbacks = {},
): Promise<T> {
  const delays = [2000, 3000, 4000]; // wait between retries

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await apiRequest<T>(endpoint, options);
      callbacks.onSuccess?.();
      return result;
    } catch (err) {
      const isLastAttempt = attempt === maxAttempts - 1;

      if (isLastAttempt) throw err;

      // First failure → notify caller to show warming-up state
      if (attempt === 0) {
        callbacks.onWarmingUp?.();
      }

      // Wait before next attempt
      await new Promise<void>((resolve) =>
        setTimeout(resolve, delays[attempt] ?? 4000),
      );
    }
  }

  // TypeScript: unreachable, but satisfies return type
  throw new ApiError('Max retries exceeded', 0);
}