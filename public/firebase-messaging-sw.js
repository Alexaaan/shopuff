// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

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

// Store for notification deduplication
const shownNotifications = new Set();
const NOTIFICATION_EXPIRY = 30000; // 30 seconds

// Clean up old notifications periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, timestamp] of shownNotifications.entries()) {
    if (now - timestamp > NOTIFICATION_EXPIRY) {
      shownNotifications.delete(id);
    }
  }
}, 10000); // Clean every 10 seconds

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  // Create unique notification ID for deduplication
  const notificationId = payload.data?.messageId || `${payload.data?.type || 'unknown'}-${Date.now()}`;

  // Check if notification was already shown recently
  if (shownNotifications.has(notificationId)) {
    console.log('Notification already shown, skipping duplicate:', notificationId);
    return;
  }

  // Check if user is currently viewing the relevant page
  const shouldShowNotification = checkIfShouldShowNotification(payload);

  if (!shouldShowNotification) {
    console.log('User is already on relevant page, skipping notification');
    return;
  }

  // Mark notification as shown
  shownNotifications.add(notificationId);

  const notificationTitle = payload.notification?.title || 'Shopuff';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { ...payload.data, notificationId },
    tag: notificationId, // Prevents duplicate notifications with same tag
    actions: [
      {
        action: 'open',
        title: 'Ouvrir'
      }
    ],
    requireInteraction: false, // Auto-dismiss after a few seconds
    silent: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Check if notification should be shown based on current page
function checkIfShouldShowNotification(payload) {
  const data = payload.data || {};

  // If no specific page context, always show
  if (!data.order_id && !data.url) {
    return true;
  }

  // Check if user is currently on the target page
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(clients => {
      for (const client of clients) {
        const clientUrl = new URL(client.url);

        // Check if user is on order chat page
        if (data.order_id && clientUrl.pathname.includes(`/user/chats`) && client.visible) {
          return false; // Don't show notification if user is already in chat
        }

        // Check if user is on specific URL
        if (data.url && client.url.includes(data.url) && client.visible) {
          return false; // Don't show notification if user is already on target page
        }
      }
      return true; // Show notification if user is not on relevant page
    })
    .catch(() => true); // Default to showing notification on error
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (data) {
    if (data.url) {
      url = data.url;
    } else if (data.order_id) {
      url = `/orders/${data.order_id}/chat`;
    }
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});