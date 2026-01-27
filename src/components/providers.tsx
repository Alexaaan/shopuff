'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/lib/CartContext';
import { AuthProvider } from '@/lib/AuthContext';
import FirebaseInit from '@/components/FirebaseInit';
import PWAInstallBanner from '@/components/PWAInstallBanner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <FirebaseInit />
        <PWAInstallBanner />
        {children}
      </CartProvider>
    </AuthProvider>
  );
}