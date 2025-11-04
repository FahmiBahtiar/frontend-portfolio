import { apiRequest, API_CONFIG, ApiResponse } from '@/lib/api';
import { HeroProfile, SocialLink } from '@/lib/types/admin';

// Hero Section API Services
export class HeroService {
  // Hero Profile API
  static async getHeroProfile(): Promise<HeroProfile> {
    const response = await apiRequest<ApiResponse<HeroProfile>>(
      API_CONFIG.ENDPOINTS.HERO_PROFILE
    );
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
    return response.data;
  }

  // Social Links API
  static async getSocialLinks(): Promise<SocialLink[]> {
    const response = await apiRequest<ApiResponse<SocialLink[]>>(
      API_CONFIG.ENDPOINTS.HERO_SOCIAL
    );
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
    return response.data;
  }

  static async deleteSocialLink(id: string): Promise<void> {
    await apiRequest(
      `${API_CONFIG.ENDPOINTS.HERO_SOCIAL}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }
}