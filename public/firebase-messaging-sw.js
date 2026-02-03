// Firebase Messaging Service Worker - v2.1
// Fixed: Single notification, no duplicates

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
  
  // If target_url is explicitly provided, use it
  if (data.target_url) {
    return `${DEFAULT_SITE_URL}${data.target_url}`;
  }
  
  const orderId = data.order_id;
  const type = data.type;
  
  // Build URL based on type
  if (type === 'chat_message' || type === 'chat_reply') {
    // For chat notifications - include orderId in URL
    return orderId 
      ? `${DEFAULT_SITE_URL}/user/chats?orderId=${orderId}`
      : `${DEFAULT_SITE_URL}/user/chats`;
  }
  
  if (type === 'new_order') {
    // For new orders - redirect to orders page
    return `${DEFAULT_SITE_URL}/admin/dashboard/orders`;
  }
  
  if (orderId) {
    // Default: redirect to user chats with orderId
    return `${DEFAULT_SITE_URL}/user/chats?orderId=${orderId}`;
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

// Handle background messages - ONLY handler for notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload.notification?.title);
  
  const data = payload.data || {};
  const type = data.type || 'default';
  
  // Create notification tag for deduplication
  const tag = getNotificationTag(data);
  
  // Check if we already displayed this notification
  const now = Date.now();
  const lastDisplay = displayedNotifications.get(tag);
  if (lastDisplay && (now - lastDisplay) < 5000) {
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
      { action: 'open', title: '🗨️ Ouvrir' }
    ],
    requireInteraction: type === 'new_order',
    silent: false,
    vibrate: [200, 100, 200]
  };
  
  // Show notification - single notification only
  self.registration.showNotification(title, notificationOptions)
    .then(() => {
      displayedNotifications.set(tag, now);
      console.log('[SW] Notification displayed:', tag);
    })
    .catch(err => {
      console.error('[SW] Error showing notification:', err);
    });
});

// Single notification click handler - FIXED to prevent duplicate navigation
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  // Prevent duplicate clicks
  if (event.isTrusted === false) return;
  
  // Close the notification
  event.notification.close();
  
  // Handle dismiss action
  if (event.action === 'dismiss') {
    return;
  }
  
  const data = event.notification.data || {};
  const targetUrl = getTargetUrl(data);
  
  console.log('[SW] Navigating to:', targetUrl);
  
  // Focus existing window or open new one - SINGLE navigation only
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then((windowClients) => {
      // Try to focus existing window
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // No matching window, open new one - SINGLE attempt
      return clients.openWindow(targetUrl);
    })
    .catch(err => {
      console.error('[SW] Error:', err);
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
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
  console.log('[SW] Service Worker activated - v2.1');
  event.waitUntil(clients.claim());
});
