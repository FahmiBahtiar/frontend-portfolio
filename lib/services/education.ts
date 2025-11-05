import { apiRequest, API_CONFIG, ApiResponse } from '@/lib/api';
import { Education, Achievement } from '@/lib/types/admin';

// Education Section API Services
export class EducationService {
  // Education Records API
  static async getEducationRecords(): Promise<Education[]> {
    const response = await apiRequest<ApiResponse<Education[]>>(
      `${API_CONFIG.ENDPOINTS.EDUCATION}/records`
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
    // Only send updatable fields, exclude MongoDB internal fields
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
    const response = await apiRequest<ApiResponse<Achievement[]>>(
      API_CONFIG.ENDPOINTS.ACHIEVEMENTS
    );
    return response.data;
  }

  static async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    const response = await apiRequest<ApiResponse<Achievement[]>>(
      `${API_CONFIG.ENDPOINTS.ACHIEVEMENTS}/category/${category}`
    );
    return response.data;
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

  static async updateAchievement(id: string, achievement: Partial<Achievement>): Promise<Achievement> {
    const response = await apiRequest<ApiResponse<Achievement>>(
      `${API_CONFIG.ENDPOINTS.ACHIEVEMENTS}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(achievement),
      }
    );
    return response.data;
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