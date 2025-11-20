import { apiRequest, API_CONFIG } from '@/lib/api';

export interface MissionPhoto {
  id: string;
  _id?: string;
  image: string;
  location: string;
  coordinates: string;
  altitude: string;
  date: string;
  camera: string;
  heading: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMissionPhotoData {
  image: string;
  location: string;
  coordinates: string;
  altitude: string;
  date: string;
  camera: string;
  heading: string;
}

export interface UpdateMissionPhotoData {
  image?: string;
  location?: string;
  coordinates?: string;
  altitude?: string;
  date?: string;
  camera?: string;
  heading?: string;
}

export const galleryApi = {
  // Get all mission photos
  getAll: async () => {
    const photos = await apiRequest<MissionPhoto[]>(API_CONFIG.ENDPOINTS.GALLERY);
    return photos.map(photo => ({ ...photo, id: photo._id || photo.id }));
  },

  // Get single mission photo
  getById: async (id: string) => {
    const photo = await apiRequest<MissionPhoto>(`${API_CONFIG.ENDPOINTS.GALLERY}/${id}`);
    return { ...photo, id: photo._id || photo.id };
  },

  // Create new mission photo
  create: (data: CreateMissionPhotoData) =>
    apiRequest<MissionPhoto>(API_CONFIG.ENDPOINTS.GALLERY, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update mission photo
  update: (id: string, data: UpdateMissionPhotoData) =>
    apiRequest<MissionPhoto>(`${API_CONFIG.ENDPOINTS.GALLERY}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete mission photo
  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`${API_CONFIG.ENDPOINTS.GALLERY}/${id}`, {
      method: 'DELETE',
    });
  },
};