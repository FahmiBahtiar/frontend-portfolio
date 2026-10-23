// Open Graph Image Generator menggunakan Next.js Image Response (Arctic Ice Theme)
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
            background: 'linear-gradient(135deg, #E2F4F3 0%, #ffffff 50%, #B9E7E6 100%)',
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
          {/* Background Decorative Rings */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '800px',
              height: '800px',
              borderRadius: '50%',
              border: '2px dashed #B9E7E6',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              border: '1.5px solid #6FD4E1',
              opacity: 0.4,
            }}
          />
          
          {/* Content Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '32px',
              border: '2px solid #6FD4E1',
              padding: '40px 60px',
              boxShadow: '0 25px 50px -12px rgba(8, 145, 178, 0.25)',
            }}
          >
            {/* Logo/Badge */}
            <div
              style={{
                fontSize: 100,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #0891b2, #0284c7)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: 10,
              }}
            >
              B
            </div>
            
            {/* Name */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: '#0c282d',
                marginBottom: 12,
                letterSpacing: '-0.02em',
              }}
            >
              {name}
            </div>
            
            {/* Title */}
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: '#0891b2',
                marginBottom: 20,
              }}
            >
              {title}
            </div>
            
            {/* Passions */}
            <div
              style={{
                fontSize: 26,
                color: '#2d5f68',
                marginBottom: 24,
                fontWeight: 500,
              }}
            >
              {passions}
            </div>
            
            {/* URL */}
            <div
              style={{
                fontSize: 24,
                color: '#0891b2',
                fontFamily: 'monospace',
                fontWeight: 700,
                padding: '6px 20px',
                borderRadius: '16px',
                backgroundColor: '#E2F4F3',
                border: '1px solid #B9E7E6',
              }}
            >
              blimbing.me
            </div>
          </div>
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
            background: 'linear-gradient(135deg, #E2F4F3 0%, #ffffff 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            fontWeight: 800,
            color: '#0c282d',
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
