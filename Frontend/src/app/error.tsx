'use client';

import { useEffect } from 'react';

export default function Error({
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
    <div
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeContent: 'center',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
        color: '#e2e8f0',
        background: '#030712',
      }}
    >
      <h2 style={{ margin: 0 }}>Something went wrong</h2>
      <p style={{ margin: 0, color: '#94a3b8', maxWidth: 420 }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
