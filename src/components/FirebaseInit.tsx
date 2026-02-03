'use client';

import { useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { onMessageListener, requestFCMToken } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

function FirebaseInitContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pendingNavigationRef = useRef<{ path: string; orderId: string | null } | null>(null);

  // Handle navigation from Service Worker messages
  const handleSWMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === 'NAVIGATE_TO') {
      const { url } = event.data;
      console.log('[FCM] Navigation request from SW:', url);
      
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        const orderId = urlObj.searchParams.get('orderId');
        
        // Store pending navigation
        pendingNavigationRef.current = { path, orderId };
        
        // Force navigation
        if (path.includes('/admin/dashboard/chats') || path.includes('/user/chats')) {
          // Replace current route to force re-render with new orderId
          router.replace(path + (orderId ? `?orderId=${orderId}` : ''));
        } else {
          router.push(path);
        }
      } catch (e) {
        console.error('[FCM] Error parsing SW message URL:', e);
      }
    }
  }, [router]);

  // Apply pending navigation when pathname changes
  useEffect(() => {
    if (pendingNavigationRef.current && pathname) {
      const { path, orderId } = pendingNavigationRef.current;
      
      // Check if we're already on the target page
      if (pathname.includes('/admin/dashboard/chats') && orderId) {
        // We're on chats page, update the orderId in URL and trigger chat open
        console.log('[FCM] On chats page, orderId:', orderId);
        // The page.tsx should already handle this via useSearchParams
      }
      
      pendingNavigationRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    // Listen for messages from Service Worker (notification clicks)
    if (typeof window !== 'undefined') {
      navigator.serviceWorker?.addEventListener('message', handleSWMessage);
    }

    // Prevent double initialization
    if (initializedRef.current) {
      return;
    }
    
    const initFirebase = async () => {
      // Register service worker for FCM and PWA
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('✅ Service Worker registered:', registration);
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      }

      // Request FCM token and register device
      if (user?.id) {
        console.log('👤 User detected, requesting FCM token...');
        await requestFCMToken(user.id);
      }
    };

    initFirebase();
    initializedRef.current = true;

    // Listen for foreground messages - only once
    unsubscribeRef.current = onMessageListener();
    
    return () => {
      // Cleanup: unsubscribe when component unmounts
      if (typeof window !== 'undefined') {
        navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
      }
      
      if (unsubscribeRef.current) {
        console.log('🧹 Cleaning up FCM message listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id, router, handleSWMessage]);

  return null;
}

export default function FirebaseInit() {
  return (
    <Suspense fallback={null}>
      <FirebaseInitContent />
    </Suspense>
  );
}
