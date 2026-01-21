'use client';

import { useEffect } from 'react';
import { onMessageListener, requestFCMToken } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export default function FirebaseInit() {
  const { user } = useAuth();

  useEffect(() => {
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

    // Listen for foreground messages
    onMessageListener()
      .then((payload: any) => {
        console.log('💬 Foreground message received:', payload);
      })
      .catch((err) => console.log('Failed to listen for messages:', err));
  }, [user?.id]);

  return null;
}