// Firebase Messaging Service Worker - v2.0
// Centralizes ALL notification logic with deduplication

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBZEu71fxzgVsxnUDeJlR-FwRsQzBuwYEc",
  authDomain: "shopu-d287a.firebaseapp.com",
  projectId: "shopu-d287a",
  storageBucket: "shopu-d287a.firebasestorage.app",
  messagingSenderId: "874740883567",
  appId: "1:874740883567:web:28a352131794cdfc6aad9a"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Track displayed notifications to prevent duplicates
const displayedNotifications = new Map();

// Default notification data
const DEFAULT_ICON = '/logo.png';
const DEFAULT_BADGE = '/logo.png';
const DEFAULT_SITE_URL = 'https://shopuff.vercel.app';

// Extract target URL from notification payload
function getTargetUrl(data) {
  if (!data) return DEFAULT_SITE_URL;
  
  // Priority: target_url > type-specific URL > fallback
  if (data.target_url) {
    return data.target_url.startsWith('http') ? data.target_url : `${DEFAULT_SITE_URL}${data.target_url}`;
  }
  
  // Build URL based on type
  const orderId = data.order_id;
  const type = data.type;
  
  if (type === 'chat_message' || type === 'chat_reply') {
    return `${DEFAULT_SITE_URL}/admin/dashboard/chats?orderId=${orderId}`;
  }
  
  if (type === 'new_order') {
    return `${DEFAULT_SITE_URL}/admin/dashboard/orders?orderId=${orderId}`;
  }
  
  if (orderId) {
    return `${DEFAULT_SITE_URL}/orders/${orderId}`;
  }
  
  return DEFAULT_SITE_URL;
}

// Generate notification tag for deduplication
function getNotificationTag(data) {
  if (!data) return 'default';
  
  // Tag based on conversation + sender to group notifications
  if (data.order_id && data.sender_id) {
    return `conv-${data.order_id}-${data.sender_id}`;
  }
  
  if (data.order_id && data.type) {
    return `${data.type}-${data.order_id}`;
  }
  
  if (data.type) {
    return data.type;
  }
  
  return 'default';
}

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload.notification?.title);
  
  const data = payload.data || {};
  const type = data.type || 'default';
  
  // Create notification tag for deduplication
  const tag = getNotificationTag(data);
  
  // Check if we already displayed this notification
  const now = Date.now();
  const lastDisplay = displayedNotifications.get(tag);
  if (lastDisplay && (now - lastDisplay) < 2000) {
    console.log('[SW] Notification already displayed recently, skipping:', tag);
    return;
  }
  
  // Build notification content
  const title = payload.notification?.title || 'ShopU Notification';
  const body = payload.notification?.body || '';
  const imageUrl = payload.notification?.image || DEFAULT_ICON;
  
  const notificationOptions = {
    body: body,
    icon: imageUrl,
    badge: DEFAULT_BADGE,
    image: imageUrl,
    tag: tag,
    data: {
      ...data,
      notification_id: payload.messageId,
      received_at: now.toString()
    },
    actions: [
      { action: 'open', title: '🗨️ Ouvrir' },
      { action: 'dismiss', title: 'Fermer' }
    ],
    requireInteraction: type === 'new_order',
    silent: false,
    vibrate: [200, 100, 200]
  };
  
  // Show notification
  self.registration.showNotification(title, notificationOptions)
    .then(() => {
      displayedNotifications.set(tag, now);
      console.log('[SW] Notification displayed:', tag);
    })
    .catch(err => {
      console.error('[SW] Error showing notification:', err);
    });
});

// Single notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  // Close the notification
  event.notification.close();
  
  // Handle dismiss action
  if (event.action === 'dismiss') {
    return;
  }
  
  const data = event.notification.data || {};
  const targetUrl = getTargetUrl(data);
  
  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then((windowClients) => {
      // Try to focus existing window with same URL
      for (let client of windowClients) {
        // Check if this is our app and already has the target path
        if (client.url.includes('/admin/') && targetUrl.includes('/admin/')) {
          if ('focus' in client) {
            // Navigate to the specific chat/order
            client.postMessage({
              type: 'NAVIGATE_TO',
              url: targetUrl
            });
            return client.focus();
          }
        }
        if (client.url.includes('/user/') && targetUrl.includes('/user/')) {
          if ('focus' in client) {
            client.postMessage({
              type: 'NAVIGATE_TO',
              url: targetUrl
            });
            return client.focus();
          }
        }
      }
      
      // No matching window, open new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
    .catch(err => {
      console.error('[SW] Error handling notification click:', err);
      // Fallback: open URL directly
      if (clients.openWindow) {
        clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Handle push event directly (fallback)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  if (!event.data) return;
  
  try {
    const payload = event.data.json();
    console.log('[SW] Push payload:', payload);
  } catch (err) {
    console.error('[SW] Error parsing push payload:', err);
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  console.log('[SW] Message received:', type);
  
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (type === 'CLEAR_NOTIFICATIONS') {
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(n => n.close());
    });
  }
});

// Install handler
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

// Activate handler
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(clients.claim());
});
