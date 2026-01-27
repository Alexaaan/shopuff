'use client';

import { useEffect } from 'react';
import { onMessageListener, requestFCMToken } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export default function FirebaseInit() {
  const { user } = useAuth();

  useEffect(() => {
    const initFirebase = async () => {
      // Register service worker for FCM and PWA (only once)
      if ('serviceWorker' in navigator) {
        try {
          // Check if already registered
          const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
          if (!existingRegistration) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('✅ Service Worker registered:', registration);
          } else {
            console.log('ℹ️ Service Worker already registered');
          }
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

    // Listen for foreground messages (only when app is visible)
    if (document.visibilityState === 'visible') {
      onMessageListener()
        .then((payload: any) => {
          console.log('💬 Foreground message received:', payload);
          // Handle foreground messages (could show in-app notification)
        })
        .catch((err) => console.log('Failed to listen for messages:', err));
    }
  }, [user?.id]);

  return null;
}