// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 3000, // 3 seconds timeout for fast fail
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
    public data?: any
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