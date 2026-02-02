'use client';

import { useEffect, useRef } from 'react';
import { onMessageListener, requestFCMToken } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export default function FirebaseInit() {
  const { user } = useAuth();
  const initializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
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
      if (unsubscribeRef.current) {
        console.log('🧹 Cleaning up FCM message listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        // Reset singleton to allow re-registration
        (async () => {
          const { messaging } = await import('@/lib/firebase');
          if (messaging) {
            const { getMessaging } = await import('firebase/messaging');
            try {
              getMessaging(messaging.app);
            } catch (e) {
              // Ignore
            }
          }
        })();
      }
    };
  }, [user?.id]);

  return null;
}