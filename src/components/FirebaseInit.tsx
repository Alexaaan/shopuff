'use client';

import { useEffect } from 'react';
import { onMessageListener } from '@/lib/firebase';

export default function FirebaseInit() {
  useEffect(() => {
    // Register service worker for FCM and PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Ensure service worker is ready for push notifications
          if (registration.active) {
            console.log('Service Worker active and ready for push notifications');
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for foreground messages
    onMessageListener()
      .then((payload: any) => {
        console.log('Foreground message:', payload);
        // Handle foreground notification if needed
      })
      .catch((err) => console.log('Failed to receive foreground message:', err));
  }, []);

  return null;
}