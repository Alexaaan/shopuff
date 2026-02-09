'use client';

import { useEffect, useState } from 'react';

/**
 * API Documentation Page with Redoc
 * 
 * Displays beautiful API documentation using Redoc.
 * Redoc is a pure React alternative to Swagger UI without deprecated warnings.
 */
export default function DocsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRedoc();
  }, []);

  const loadRedoc = () => {
    try {
      // Load Redoc script dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore - Redoc is loaded globally
        if (window.Redoc) {
          // @ts-ignore
          window.Redoc.init(
            `${window.location.origin}/api/docs`,
            {
              theme: {
                colors: {
                  primary: {
                    main: '#667eea'
                  }
                },
                typography: {
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  headings: {
                    fontWeight: '600'
                  }
                },
                sidebar: {
                  backgroundColor: '#1e293b',
                  textColor: '#e2e8f0'
                },
                rightPanel: {
                  backgroundColor: '#0f172a',
                  textColor: '#e2e8f0'
                }
              },
              scrollYOffset: 64,
              hideDownloadButton: false,
              showApiVersion: true,
              docExpansion: 'list',
              filterProp: 'name'
            },
            document.getElementById('redoc-container')
          );
          setIsLoaded(true);
        }
      };
      script.onerror = () => {
        setError('Failed to load Redoc library');
      };
      document.head.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0f172a'
    }}>
      {/* Redoc Container */}
      <div id="redoc-container" style={{ minHeight: '100vh' }} />
      
      {/* Loading Overlay */}
      {!isLoaded && !error && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          zIndex: 9999
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '24px', fontSize: '18px' }}>Loading API Documentation...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          zIndex: 9999,
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>⚠️</div>
          <h2 style={{ marginBottom: '8px' }}>Error Loading Documentation</h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        [data-section-id] {
          border-bottom: 1px solid #1e293b;
        }
        
        .api-info {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 24px;
          border-radius: 8px;
          margin: 24px;
        }
        
        .api-info .title {
          color: white !important;
          font-size: 28px !important;
        }
        
        .api-info .description {
          color: rgba(255,255,255,0.9) !important;
        }
        
        .sidebar {
          background: #1e293b !important;
        }
        
        .sidebar-content {
          background: #1e293b !important;
        }
        
        .menu-item {
          color: #94a3b8 !important;
        }
        
        .menu-item:hover {
          color: #e2e8f0 !important;
          background: #334155 !important;
        }
        
        .menu-item.active {
          color: #667eea !important;
          background: rgba(102, 126, 234, 0.1) !important;
        }
        
        .badge-get {
          background: #3b82f6 !important;
        }
        
        .badge-post {
          background: #22c55e !important;
        }
        
        .badge-put {
          background: #f59e0b !important;
        }
        
        .badge-delete {
          background: #ef4444 !important;
        }
        
        .badge-patch {
          background: #8b5cf6 !important;
        }
        
        code {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-radius: 4px;
        }
        
        pre {
          background: #0f172a !important;
          border-radius: 8px;
        }
        
        .response-cell {
          background: #1e293b !important;
        }
        
        table {
          width: 100%;
        }
        
        thead {
          background: #1e293b;
        }
        
        tbody tr {
          border-bottom: 1px solid #1e293b;
        }
        
        .security-details {
          background: #0f172a !important;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
