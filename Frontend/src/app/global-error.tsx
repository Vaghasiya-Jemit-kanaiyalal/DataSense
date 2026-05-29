'use client';

/**
 * App Router global error boundary — uses native <html>/<body>, NOT next/document Html.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#030712', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>Application error</h2>
          <p style={{ margin: 0, color: '#94a3b8' }}>{error.message}</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#7c3aed',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
