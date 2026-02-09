'use client';

import { useEffect, useState } from 'react';

/**
 * API Documentation Page
 * 
 * Displays Swagger UI for browsing API documentation.
 * Uses the OpenAPI specification from /api/docs endpoint.
 */
export default function DocsPage() {
  const [specUrl, setSpecUrl] = useState('');

  useEffect(() => {
    // Set the spec URL based on the current environment
    const baseUrl = window.location.origin;
    setSpecUrl(`${baseUrl}/api/docs`);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px 32px',
          color: 'white'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Shopuff API Documentation
          </h1>
          <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>
            Professional OpenAPI 3.0 documentation for the Shopuff e-commerce platform
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Quick Links */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              color: '#1e293b', 
              fontSize: '20px', 
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              Quick Links
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              <DocCard 
                title="Authentication" 
                description="Register, login, JWT tokens"
                icon="🔐"
                href="#auth"
              />
              <DocCard 
                title="Products" 
                description="Catalog, search, ratings"
                icon="📦"
                href="#products"
              />
              <DocCard 
                title="Orders" 
                description="Order management, tracking"
                icon="🛒"
                href="#orders"
              />
              <DocCard 
                title="Chat" 
                description="Real-time messaging"
                icon="💬"
                href="#chat"
              />
              <DocCard 
                title="Notifications" 
                description="Push notifications"
                icon="🔔"
                href="#notifications"
              />
              <DocCard 
                title="Users" 
                description="User profiles, settings"
                icon="👥"
                href="#users"
              />
            </div>
          </div>

          {/* OpenAPI Spec Section */}
          <div style={{ 
            background: '#f8fafc', 
            borderRadius: '8px', 
            padding: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ 
              color: '#1e293b', 
              fontSize: '18px', 
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              📄 OpenAPI Specification
            </h2>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>
              Access the machine-readable OpenAPI 3.0 specification JSON:
            </p>
            <div style={{ 
              background: '#1e293b', 
              padding: '16px', 
              borderRadius: '8px',
              overflow: 'auto'
            }}>
              <code style={{ 
                color: '#e2e8f0', 
                fontSize: '13px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                GET {specUrl || '/api/docs'}
              </code>
            </div>
            <a 
              href={specUrl || '/api/docs'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              View Raw JSON
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>

          {/* Swagger Tools */}
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ 
              color: '#1e293b', 
              fontSize: '18px', 
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              🛠️ API Development Tools
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              <ToolCard 
                name="Swagger Editor"
                description="Edit and test OpenAPI specs"
                url="https://editor.swagger.io"
                color="#85ea2d"
              />
              <ToolCard 
                name="Swagger UI"
                description="Interactive API documentation"
                url="https://swagger.io/tools/swagger-ui"
                color="#85ea2d"
              />
              <ToolCard 
                name="Postman"
                description="API testing and collections"
                url="https://postman.com"
                color="#ff6c37"
              />
              <ToolCard 
                name="Redoc"
                description="Beautiful API documentation"
                url="https://redoc.ly"
                color="#5c4ef5"
              />
            </div>
          </div>

          {/* Authentication Guide */}
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ 
              color: '#1e293b', 
              fontSize: '18px', 
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              🔐 Authentication Guide
            </h2>
            <div style={{ 
              background: '#fffbeb', 
              border: '1px solid #fcd34d',
              borderRadius: '8px', 
              padding: '20px'
            }}>
              <h3 style={{ 
                color: '#92400e', 
                fontSize: '16px', 
                fontWeight: 600,
                marginBottom: '12px'
              }}>
                Bearer Token Authentication
              </h3>
              <p style={{ color: '#a16207', marginBottom: '12px' }}>
                Include the JWT token in the Authorization header:
              </p>
              <div style={{ 
                background: '#1e293b', 
                padding: '12px 16px', 
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#e2e8f0'
              }}>
                Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div style={{ marginTop: '24px' }}>
            <h2 style={{ 
              color: '#1e293b', 
              fontSize: '18px', 
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              📬 Standard Response Format
            </h2>
            <div style={{ 
              background: '#1e293b', 
              padding: '16px', 
              borderRadius: '8px',
              overflow: 'auto'
            }}>
              <pre style={{ 
                margin: 0, 
                color: '#a5b4fc',
                fontSize: '13px',
                fontFamily: 'monospace',
                lineHeight: '1.6'
              }}>
{`{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    // Pagination or additional info
  }
}`}
              </pre>
            </div>
          </div>

          {/* Support */}
          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px'
          }}>
            <h3 style={{ 
              color: '#0369a1', 
              fontSize: '16px', 
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              Need Help?
            </h3>
            <p style={{ color: '#0c4a6e', margin: 0 }}>
              For API support, please contact <strong>support@shopuff.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Documentation Card Component
function DocCard({ 
  title, 
  description, 
  icon, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: string; 
  href: string;
}) {
  return (
    <a 
      href={href}
      style={{
        display: 'block',
        padding: '16px',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#667eea';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ 
        color: '#1e293b', 
        fontWeight: 600, 
        fontSize: '14px',
        marginBottom: '4px'
      }}>
        {title}
      </div>
      <div style={{ color: '#64748b', fontSize: '12px' }}>
        {description}
      </div>
    </a>
  );
}

// Tool Card Component
function ToolCard({ 
  name, 
  description, 
  url, 
  color 
}: { 
  name: string; 
  description: string; 
  url: string; 
  color: string;
}) {
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        padding: '16px',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ 
        width: '8px', 
        height: '8px', 
        background: color, 
        borderRadius: '50%',
        marginBottom: '8px'
      }} />
      <div style={{ 
        color: '#1e293b', 
        fontWeight: 600, 
        fontSize: '14px',
        marginBottom: '4px'
      }}>
        {name}
      </div>
      <div style={{ color: '#64748b', fontSize: '12px' }}>
        {description}
      </div>
    </a>
  );
}
