'use client';

import { ReactNode, useEffect } from 'react';
import { CartProvider } from '@/lib/CartContext';
import { AuthProvider } from '@/lib/AuthContext';
import FirebaseInit from '@/components/FirebaseInit';
import PWAInstallBanner from '@/components/PWAInstallBanner';

interface ProvidersProps {
  children: ReactNode;
}

// Register service worker
function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.log('[SW] Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <FirebaseInit />
        <ServiceWorkerRegistration />
        <PWAInstallBanner />
        {children}
      </CartProvider>
    </AuthProvider>
  );
}