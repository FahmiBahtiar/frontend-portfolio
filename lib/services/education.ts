import { apiRequest, API_CONFIG, ApiResponse, ApiError } from '@/lib/api';
import { Education, Achievement } from '@/lib/types/admin';

// Raw achievement payload from the API, which may use either camelCase or
// snake_case for some fields. Normalized to `Achievement` in getAchievements().
interface RawAchievement {
  id: string;
  category: Achievement['category'];
  title: string;
  issuer: string;
  date: string;
  icon: string;
  description?: string;
  certificateUrl?: string;
  certificate_url?: string;
  credentialUrl?: string;
  credential_url?: string;
  order: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// Education Section API Services
export class EducationService {
  // Education Records API
  static async getEducationRecords(): Promise<Education[]> {
    const response = await apiRequest<ApiResponse<Education[]>>(
      `${API_CONFIG.PUBLIC_ENDPOINTS.EDUCATION}/records`
    );
    return response.data;
  }

  static async createEducationRecord(education: Omit<Education, 'id' | 'createdAt' | 'updatedAt'>): Promise<Education> {
    const response = await apiRequest<ApiResponse<Education>>(
      `${API_CONFIG.ENDPOINTS.EDUCATION}/records`,
      {
        method: 'POST',
        body: JSON.stringify(education),
      }
    );
    return response.data;
  }

  static async updateEducationRecord(id: string, education: Partial<Education>): Promise<Education> {
    const updateData = Object.fromEntries(
      Object.entries(education).filter(([key]) => 
        !['id', 'createdAt', 'updatedAt', '__v'].includes(key)
      )
    );
    const response = await apiRequest<ApiResponse<Education>>(
      `${API_CONFIG.ENDPOINTS.EDUCATION}/records/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );
    return response.data;
  }

  static async deleteEducationRecord(id: string): Promise<void> {
    await apiRequest(
      `${API_CONFIG.ENDPOINTS.EDUCATION}/records/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Achievements API
  static async getAchievements(): Promise<Achievement[]> {
    const response = await apiRequest<ApiResponse<RawAchievement[]>>(
      API_CONFIG.PUBLIC_ENDPOINTS.ACHIEVEMENTS
    );
    // Map snake_case to camelCase for frontend compatibility
    return (response.data || []).map((raw) => ({
      id: raw.id,
      category: raw.category,
      title: raw.title,
      issuer: raw.issuer,
      date: raw.date,
      icon: raw.icon,
      description: raw.description,
      certificateUrl: raw.certificateUrl || raw.certificate_url,
      credentialUrl: raw.credentialUrl || raw.credential_url,
      order: raw.order,
      createdAt: raw.createdAt || raw.created_at || '',
      updatedAt: raw.updatedAt || raw.updated_at || '',
    }));
  }

  static async createAchievement(achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Achievement> {
    const response = await apiRequest<ApiResponse<Achievement>>(
      API_CONFIG.ENDPOINTS.ACHIEVEMENTS,
      {
        method: 'POST',
        body: JSON.stringify(achievement),
      }
    );
    return response.data;
  }

  static async updateAchievement(id: string, achievement: Partial<Achievement>): Promise<Achievement | null> {
    try {
      const response = await apiRequest<ApiResponse<Achievement>>(
        `${API_CONFIG.ENDPOINTS.ACHIEVEMENTS}/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(achievement),
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async deleteAchievement(id: string): Promise<void> {
    await apiRequest(
      `${API_CONFIG.ENDPOINTS.ACHIEVEMENTS}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }
}