import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBZEu71fxzgVsxnUDeJlR-FwRsQzBuwYEc",
  authDomain: "shopu-d287a.firebaseapp.com",
  projectId: "shopu-d287a",
  storageBucket: "shopu-d287a.firebasestorage.app",
  messagingSenderId: "874740883567",
  appId: "1:874740883567:web:28a352131794cdfc6aad9a"
};

const app = initializeApp(firebaseConfig);

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestFCMToken = async (userId: number) => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY
    });

    if (token) {
      // Register with backend
      await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          device_token: token,
          platform: 'web'
        })
      });

      console.log('FCM token registered:', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
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