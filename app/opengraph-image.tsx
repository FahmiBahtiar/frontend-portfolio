// Open Graph Image Generator menggunakan Next.js Image Response
import { ImageResponse } from 'next/og';
import { getHeroProfileServer } from '@/lib/services/server-data';

export const runtime = 'edge';

export const alt = 'Fahmi Bahtiar Portfolio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  try {
    const hero = await getHeroProfileServer();
    
    const name = hero?.name || 'Fahmi Bahtiar';
    const title = hero?.titles?.[0] || 'Backend Developer';
    const passions = hero?.passions || 'Coding • Aviation • Mountaineering';

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle at 25px 25px, #06b6d4 2%, transparent 0%), radial-gradient(circle at 75px 75px, #3b82f6 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          />
          
          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Logo/Badge */}
            <div
              style={{
                fontSize: 120,
                fontWeight: 900,
                background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: 20,
              }}
            >
              B
            </div>
            
            {/* Name */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: 'white',
                marginBottom: 20,
              }}
            >
              {name}
            </div>
            
            {/* Title */}
            <div
              style={{
                fontSize: 42,
                fontWeight: 500,
                background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: 30,
              }}
            >
              {title}
            </div>
            
            {/* Passions */}
            <div
              style={{
                fontSize: 32,
                color: '#94a3b8',
                marginBottom: 40,
              }}
            >
              {passions}
            </div>
            
            {/* URL */}
            <div
              style={{
                fontSize: 28,
                color: '#64748b',
                fontFamily: 'monospace',
              }}
            >
              blimbing.dev
            </div>
          </div>
          
          {/* Border */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              right: 40,
              bottom: 40,
              border: '2px solid',
              borderImage: 'linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7) 1',
              borderRadius: 20,
              opacity: 0.3,
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Fallback image
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
          }}
        >
          Fahmi Bahtiar Portfolio
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
