import { apiRequest, API_CONFIG, ApiResponse, ApiError } from '@/lib/api';
import { Education, Achievement, Publication } from '@/lib/types/admin';

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

export const DEFAULT_EDUCATION_RECORDS: Education[] = [
  {
    id: 'c6de5eac-280b-420d-a48f-31bb5d36e729',
    degree: 'Elementary School',
    institution: 'MI Negeri 1 Demak',
    period: '2010 - 2018',
    gpa: 'Complete',
    color: 'cyan',
    description:
      'Building strong academic foundation and character development. Active in journey and survival club.',
    order: 1,
    createdAt: '2025-11-27T08:22:27.00131+00:00',
    updatedAt: '2026-10-22T08:54:12.408707+00:00',
  },
  {
    id: '03e13fb8-0688-4df4-b2fc-7f287b8ddabb',
    degree: 'Junior High School',
    institution: 'SMP Negeri 2 Demak',
    period: '2016 - 2019',
    gpa: 'Complete',
    color: 'green',
    description: 'Started programming journey with basic algorithms.',
    order: 2,
    createdAt: '2025-11-27T08:22:27.00131+00:00',
    updatedAt: '2026-05-05T19:37:29.522938+00:00',
  },
  {
    id: '12495985-a7eb-4fd9-a7d2-273c9d7028db',
    degree: 'Djarum Foundation Scholarship',
    institution: 'Binar Academy',
    period: '2021 - 2021',
    gpa: 'Complete',
    color: 'orange',
    description: 'Focus on Computer Science',
    order: 3,
    createdAt: '2025-11-27T08:22:27.00131+00:00',
    updatedAt: '2026-05-05T19:37:24.072611+00:00',
  },
  {
    id: '41f518cd-38da-4d95-8314-5c943a55d10e',
    degree: 'Senior High School',
    institution: 'SMK Raden Umar Said',
    period: '2019 - 2022',
    gpa: 'Complete',
    color: 'purple',
    description:
      'Specialized in backend architectures, microservices, Linux servers, CI/CD, and competitive coding.',
    order: 4,
    createdAt: '2025-11-27T08:22:27.00131+00:00',
    updatedAt: '2026-10-26T05:51:03.17089+00:00',
  },
  {
    id: '691a3904-f1ba-440d-a650-f77e17c495c2',
    degree: 'Bachelor Degree',
    institution: 'Dian Nuswantoro University',
    period: '2022 - 2026',
    gpa: 'Complete',
    color: 'blue',
    description:
      'Advanced computer systems, cloud infrastructure, AI models, and real-time distributed networks.',
    order: 5,
    createdAt: '2025-11-27T08:22:27.00131+00:00',
    updatedAt: '2026-10-26T05:51:03.957264+00:00',
  },
];

// Education Section API Services
export class EducationService {
  // Education Records API
  static async getEducationRecords(): Promise<Education[]> {
    try {
      const response = await apiRequest<ApiResponse<Education[]>>(
        `${API_CONFIG.PUBLIC_ENDPOINTS.EDUCATION}/records`
      );
      if (response && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return DEFAULT_EDUCATION_RECORDS;
    } catch (error) {
      console.warn('Failed to fetch education records, serving defaults:', error);
      return DEFAULT_EDUCATION_RECORDS;
    }
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
    try {
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
    } catch (error) {
      console.warn('Failed to fetch achievements, returning empty list:', error);
      return [];
    }
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

  // Publications API
  static async getPublications(): Promise<Publication[]> {
    try {
      const response = await apiRequest<ApiResponse<Publication[]>>(
        API_CONFIG.PUBLIC_ENDPOINTS.PUBLICATIONS
      );
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch publications:', error);
      return [];
    }
  }

  static async createPublication(publication: Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Publication> {
    const response = await apiRequest<ApiResponse<Publication>>(
      API_CONFIG.ENDPOINTS.PUBLICATIONS,
      {
        method: 'POST',
        body: JSON.stringify(publication),
      }
    );
    return response.data;
  }

  static async updatePublication(id: string, publication: Partial<Publication>): Promise<Publication> {
    const updateData = Object.fromEntries(
      Object.entries(publication).filter(([key]) =>
        !['id', 'createdAt', 'updatedAt', '__v'].includes(key)
      )
    );
    const response = await apiRequest<ApiResponse<Publication>>(
      `${API_CONFIG.ENDPOINTS.PUBLICATIONS}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );
    return response.data;
  }

  static async deletePublication(id: string): Promise<void> {
    await apiRequest(
      `${API_CONFIG.ENDPOINTS.PUBLICATIONS}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }
}