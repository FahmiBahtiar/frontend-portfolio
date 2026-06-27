// Server-side data fetching service untuk SEO optimization
// File ini hanya digunakan di Server Components (tidak di client-side)

import { API_CONFIG } from '@/lib/api';
import type {
  ApiResponse,
  HeroProfile,
  SocialLink,
  Passion,
  Highlight,
  LanyardData,
  Education,
  Achievement,
  FlightEntry,
  ContactFrequency,
} from '@/lib/types/admin';

// Extend cache options untuk Next.js 15
interface FetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

// Generic fetch function untuk server-side dengan caching
async function serverFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: FetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: {
      revalidate: 3600, // Revalidate setiap 1 jam (default)
      ...options.next,
    },
    signal: AbortSignal.timeout(3000), // Fast fail timeout to prevent SSR hanging
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Server fetch error for ${endpoint}:`, error);
    throw error;
  }
}

// ==================== HERO SECTION ====================
export async function getHeroProfileServer() {
  try {
    const response = await serverFetch<ApiResponse<HeroProfile>>(
      API_CONFIG.PUBLIC_ENDPOINTS.HERO_PROFILE,
      {
        next: {
          revalidate: 3600, // Cache 1 jam
          tags: ['hero-profile'],
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch hero profile:', error);
    return null;
  }
}

export async function getSocialLinksServer() {
  try {
    const response = await serverFetch<ApiResponse<SocialLink[]>>(
      API_CONFIG.PUBLIC_ENDPOINTS.HERO_SOCIAL,
      {
        next: {
          revalidate: 3600, // Cache 1 jam
          tags: ['social-links'],
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Failed to fetch social links:', error);
    return [];
  }
}

// ==================== ABOUT SECTION ====================
export async function getPassionsServer() {
  try {
    const response = await serverFetch<ApiResponse<Passion[]>>(
      API_CONFIG.PUBLIC_ENDPOINTS.PASSIONS,
      {
        next: {
          revalidate: 3600,
          tags: ['passions'],
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Failed to fetch passions:', error);
    return [];
  }
}

export async function getHighlightsServer() {
  try {
    const response = await serverFetch<ApiResponse<Highlight[]>>(
      API_CONFIG.PUBLIC_ENDPOINTS.HIGHLIGHTS,
      {
        next: {
          revalidate: 3600,
          tags: ['highlights'],
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Failed to fetch highlights:', error);
    return [];
  }
}

// Skills endpoint belum tersedia di backend
// Uncomment ketika endpoint sudah dibuat
// export async function getSkillsServer() {
//   try {
//     const response = await serverFetch<any>(
//       API_CONFIG.ENDPOINTS.SKILLS,
//       {
//         next: {
//           revalidate: 3600,
//           tags: ['skills'],
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Failed to fetch skills:', error);
//     return [];
//   }
// }

export async function getLanyardServer() {
  try {
    const response = await serverFetch<ApiResponse<LanyardData>>(
      API_CONFIG.PUBLIC_ENDPOINTS.LANYARD,
      {
        next: {
          revalidate: 3600,
          tags: ['lanyard'],
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch lanyard:', error);
    return null;
  }
}

// ==================== EDUCATION SECTION ====================
export async function getEducationRecordsServer() {
  try {
    const response = await serverFetch<ApiResponse<Education[]>>(
      `${API_CONFIG.PUBLIC_ENDPOINTS.EDUCATION}/records`,
      {
        next: {
          revalidate: 3600,
          tags: ['education'],
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Failed to fetch education records:', error);
    return [];
  }
}

export async function getAchievementsServer() {
  try {
    const response = await serverFetch<ApiResponse<Achievement[]>>(
      API_CONFIG.PUBLIC_ENDPOINTS.ACHIEVEMENTS,
      {
        next: {
          revalidate: 3600,
          tags: ['achievements'],
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    return [];
  }
}

// ==================== EXPERIENCE & PROJECTS ====================
export async function getFlightsServer() {
  try {
    const response = await serverFetch<ApiResponse<FlightEntry[]>>(
      API_CONFIG.PUBLIC_ENDPOINTS.FLIGHTS,
      {
        next: {
          revalidate: 3600,
          tags: ['flights'],
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.error('Failed to fetch flights:', error);
    return [];
  }
}

// Projects endpoint belum tersedia di backend
// Uncomment ketika endpoint sudah dibuat
// export async function getProjectsServer() {
//   try {
//     const response = await serverFetch<any>(
//       API_CONFIG.ENDPOINTS.PROJECTS,
//       {
//         next: {
//           revalidate: 3600,
//           tags: ['projects'],
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Failed to fetch projects:', error);
//     return [];
//   }
// }

// ==================== CONTACT SECTION ====================
export async function getContactInfoServer() {
  try {
    const response = await serverFetch<ApiResponse<ContactFrequency[]>>(
      API_CONFIG.ENDPOINTS.CONTACT,
      {
        next: {
          revalidate: 3600,
          tags: ['contact'],
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch contact info:', error);
    return null;
  }
}

// ==================== AGGREGATE DATA FOR SEO ====================
// Function untuk mendapatkan semua data sekaligus (untuk metadata generation)
export async function getAllDataForSEO() {
  try {
    // Hanya fetch endpoint yang tersedia di backend
    const [hero, social, passions, education] = await Promise.allSettled([
      getHeroProfileServer(),
      getSocialLinksServer(),
      getPassionsServer(),
      getEducationRecordsServer(),
      // getProjectsServer(), // Commented out - endpoint belum ada
    ]);

    return {
      hero: hero.status === 'fulfilled' ? hero.value : null,
      social: social.status === 'fulfilled' ? social.value : [],
      passions: passions.status === 'fulfilled' ? passions.value : [],
      education: education.status === 'fulfilled' ? education.value : [],
      projects: [], // Empty array untuk sekarang
    };
  } catch (error) {
    console.error('Failed to fetch all data for SEO:', error);
    return {
      hero: null,
      social: [],
      passions: [],
      education: [],
      projects: [],
    };
  }
}
