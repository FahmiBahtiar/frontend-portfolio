'use client';

import { useEffect } from 'react';

// Catches errors in the root layout itself; must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#060612',
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ maxWidth: '32rem', color: '#94a3b8' }}>
          The application hit an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            padding: '0.6rem 1.4rem',
            borderRadius: '0.6rem',
            border: '1px solid rgba(34,211,238,0.4)',
            background: 'rgba(8,145,178,0.15)',
            color: '#67e8f9',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
