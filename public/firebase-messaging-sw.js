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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  if (data && data.order_id) {
    // Open the chat
    event.waitUntil(
      clients.openWindow(`/orders/${data.order_id}/chat`)
    );
  }
});