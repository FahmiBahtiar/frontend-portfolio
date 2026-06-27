import { apiRequest, API_CONFIG, ApiResponse } from '@/lib/api';
import { Passion, Highlight } from '@/lib/types/admin';

// About Section API Services
export class AboutService {
  // Passions API
  static async getPassions(): Promise<Passion[]> {
    const response = await apiRequest<ApiResponse<Passion[]>>(
      API_CONFIG.PUBLIC_ENDPOINTS.PASSIONS
    );
    return response.data;
  }

  static async createPassion(passion: Omit<Passion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Passion> {
    const response = await apiRequest<ApiResponse<Passion>>(
      API_CONFIG.ENDPOINTS.PASSIONS,
      {
        method: 'POST',
        body: JSON.stringify(passion),
      }
    );
    return response.data;
  }

  static async updatePassion(id: string, passion: Partial<Passion>): Promise<Passion> {
    const response = await apiRequest<ApiResponse<Passion>>(
      `${API_CONFIG.ENDPOINTS.PASSIONS}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(passion),
      }
    );
    return response.data;
  }

  static async deletePassion(id: string): Promise<void> {
    await apiRequest(
      `${API_CONFIG.ENDPOINTS.PASSIONS}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Highlights API
  static async getHighlights(): Promise<Highlight[]> {
    const response = await apiRequest<ApiResponse<Highlight[]>>(
      API_CONFIG.PUBLIC_ENDPOINTS.HIGHLIGHTS
    );
    return response.data;
  }

  static async createHighlight(highlight: Omit<Highlight, 'id'>): Promise<Highlight> {
    const response = await apiRequest<ApiResponse<Highlight>>(
      API_CONFIG.ENDPOINTS.HIGHLIGHTS,
      {
        method: 'POST',
        body: JSON.stringify(highlight),
      }
    );
    return response.data;
  }

  static async updateHighlight(id: string, highlight: Partial<Highlight>): Promise<Highlight> {
    const response = await apiRequest<ApiResponse<Highlight>>(
      `${API_CONFIG.ENDPOINTS.HIGHLIGHTS}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(highlight),
      }
    );
    return response.data;
  }

  static async deleteHighlight(id: string): Promise<void> {
    await apiRequest(
      `${API_CONFIG.ENDPOINTS.HIGHLIGHTS}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }
}