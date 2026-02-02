'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onMessageListener, requestFCMToken } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export default function FirebaseInit() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Listen for messages from Service Worker (notification clicks)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TO') {
        const { url } = event.data;
        console.log('[FCM] Navigation request from SW:', url);
        
        // Parse URL to get path and params
        try {
          const urlObj = new URL(url);
          const path = urlObj.pathname;
          const orderId = urlObj.searchParams.get('orderId');
          
          // Navigate to the correct page
          if (path.includes('/admin/dashboard/chats') || path.includes('/user/chats')) {
            // Go to chats page, the page will read orderId from URL
            router.push(path + (orderId ? `?orderId=${orderId}` : ''));
          } else if (path.includes('/admin/dashboard/orders')) {
            router.push(path);
          }
        } catch (e) {
          console.error('[FCM] Error parsing SW message URL:', e);
        }
      }
    };
    
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
  }, [user?.id, router]);

  return null;
}