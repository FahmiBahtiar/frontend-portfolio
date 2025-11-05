import { apiRequest, API_CONFIG, ApiResponse } from '@/lib/api';
import { HeroProfile, SocialLink } from '@/lib/types/admin';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Hero Section API Services
export class HeroService {
  // Hero Profile API
  static async getHeroProfile(): Promise<HeroProfile> {
    const cacheKey = 'hero_profile';
    
    // Check cache first
    const cached = getCachedData<HeroProfile>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await apiRequest<ApiResponse<HeroProfile>>(
      API_CONFIG.ENDPOINTS.HERO_PROFILE
    );
    
    // Cache the result
    setCachedData(cacheKey, response.data);
    return response.data;
  }

  static async updateHeroProfile(profile: Partial<HeroProfile>): Promise<HeroProfile> {
    const response = await apiRequest<ApiResponse<HeroProfile>>(
      API_CONFIG.ENDPOINTS.HERO_PROFILE,
      {
        method: 'PUT',
        body: JSON.stringify(profile),
      }
    );
    
    // Invalidate cache after update
    cache.delete('hero_profile');
    return response.data;
  }

  // Social Links API
  static async getSocialLinks(): Promise<SocialLink[]> {
    const cacheKey = 'social_links';
    
    // Check cache first
    const cached = getCachedData<SocialLink[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await apiRequest<ApiResponse<SocialLink[]>>(
      API_CONFIG.ENDPOINTS.HERO_SOCIAL
    );
    
    // Cache the result
    setCachedData(cacheKey, response.data);
    return response.data;
  }

  static async createSocialLink(socialLink: Omit<SocialLink, 'id'>): Promise<SocialLink> {
    const response = await apiRequest<ApiResponse<SocialLink>>(
      API_CONFIG.ENDPOINTS.HERO_SOCIAL,
      {
        method: 'POST',
        body: JSON.stringify(socialLink),
      }
    );
    
    // Invalidate cache after create
    cache.delete('social_links');
    return response.data;
  }

  static async updateSocialLink(id: string, socialLink: Partial<SocialLink>): Promise<SocialLink> {
    const response = await apiRequest<ApiResponse<SocialLink>>(
      `${API_CONFIG.ENDPOINTS.HERO_SOCIAL}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(socialLink),
      }
    );
    
    // Invalidate cache after update
    cache.delete('social_links');
    return response.data;
  }

  static async deleteSocialLink(id: string): Promise<void> {
    await apiRequest(
      `${API_CONFIG.ENDPOINTS.HERO_SOCIAL}/${id}`,
      {
        method: 'DELETE',
      }
    );
    
    // Invalidate cache after delete
    cache.delete('social_links');
  }
}