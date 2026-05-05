const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SpotifyNowPlaying {
  isPlaying: boolean;
  song: {
    title: string;
    artist: string;
    album: string;
    albumImageUrl: string | null;
    songUrl: string;
  } | null;
}

export const SpotifyService = {
  async getNowPlaying(): Promise<SpotifyNowPlaying> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${API_URL}/spotify/now-playing`, {
          next: { revalidate: 0 }, // No caching for real-time data
          signal: AbortSignal.timeout(3000), // Fast fail timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Spotify API attempt ${attempt}/${maxRetries} failed:`, error);
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // All retries failed
    console.error('All Spotify API attempts failed:', lastError);
    return {
      isPlaying: false,
      song: null,
    };
  },
};
