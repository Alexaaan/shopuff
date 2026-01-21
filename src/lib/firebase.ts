import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestFCMToken = async (userId: number) => {
  console.log('[DEBUG] Starting FCM token request for user:', userId);

  if (!messaging) {
    console.error('[DEBUG] Messaging not available');
    return null;
  }

  try {
    console.log('[DEBUG] Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('[DEBUG] Permission result:', permission);

    if (permission !== 'granted') {
      console.log('[DEBUG] Notification permission denied');
      return null;
    }

    console.log('[DEBUG] Getting FCM token with VAPID key...');
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY
    });

    console.log('[DEBUG] FCM token generated:', token ? 'YES' : 'NO', token?.substring(0, 20) + '...');

    if (token) {
      // Register with backend
      console.log('[DEBUG] Sending device registration for user:', userId);
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          device_token: token,
          platform: 'web'
        })
      });

      console.log('[DEBUG] Device registration response:', response.status, response.statusText);
      const responseText = await response.text();
      console.log('[DEBUG] Response body:', responseText);

      if (response.ok) {
        console.log('[DEBUG] FCM token registered successfully for user:', userId);
      } else {
        console.error('[DEBUG] FCM token registration failed for user:', userId, responseText);
      }

      return token;
    } else {
      console.log('[DEBUG] No token generated for user:', userId);
    }
  } catch (error) {
    console.error('[DEBUG] Error getting FCM token for user:', userId, error);
  }
  return null;
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        resolve(payload);
      });
    }
  });