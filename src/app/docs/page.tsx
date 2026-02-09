'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

/**
 * Swagger UI Documentation Page
 * 
 * Interactive API documentation using Swagger UI.
 * Displays the OpenAPI specification at /api/docs
 */

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#fafafa'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 text-lg">Loading Swagger UI...</p>
      </div>
    </div>
  )
});

function SwaggerUILoader() {
  const specUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/docs`
    : '/api/docs';

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#fafafa'
    }}>
      <SwaggerUI
        url={specUrl}
        docExpansion="list"
        deepLinking={true}
        displayRequestDuration={true}
        filter={true}
        persistAuthorization={true}
        showMutatedRequest={true}
        supportedSubmitMethods={[
          'get',
          'put',
          'post',
          'delete',
          'options',
          'head',
          'patch'
        ]}
        presets={[
          'presets.apis',
          'presets.standalone'
        ]}
      />
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#fafafa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading Swagger UI...</p>
        </div>
      </div>
    }>
      <SwaggerUILoader />
    </Suspense>
  );
}
