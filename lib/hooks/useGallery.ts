import useSWR from 'swr';
import { galleryApi, MissionPhoto } from '@/lib/services/gallery';

/**
 * Custom hook for fetching gallery photos with optimized caching and revalidation
 * Uses SWR for automatic caching, deduplication, and background revalidation
 */
export function useGallery() {
  const { data, error, isLoading, mutate } = useSWR<MissionPhoto[]>(
    'gallery-photos',
    () => galleryApi.getAll(),
    {
      revalidateOnFocus: false, // Don't refetch on window focus to save bandwidth
      revalidateOnReconnect: true, // Refetch when user reconnects to internet
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
      errorRetryCount: 3, // Retry failed requests 3 times
      errorRetryInterval: 5000, // Wait 5 seconds between retries
      focusThrottleInterval: 60000, // Throttle focus revalidation to once per minute
    }
  );

  return {
    photos: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate, // Manual refresh function
  };
}
