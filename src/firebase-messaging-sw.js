// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

// Inicializa Firebase con tu configuración
firebase.initializeApp({
  apiKey: "AIzaSyDAu0Z3X5701sXn8T-UKFVq5umJsyo2QZs",
  authDomain: "escuela-170825.firebaseapp.com",
  projectId: "escuela-170825",
  storageBucket: "escuela-170825.firebasestorage.app",
  messagingSenderId: "809910245140",
  appId: "1:809910245140:web:eb623cb99f7a4572845401"
});

const messaging = firebase.messaging();

// Maneja notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);

  const notificationTitle = payload.notification?.title || 'Escuela';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: payload.notification?.icon || '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    tag: payload.data?.tag || 'notification-' + Date.now(),
    data: payload.data,
    vibrate: [200, 100, 200],
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Maneja el click en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Click en notificación:', event);

  event.notification.close();

  // Abre la app o enfoca la ventana existente
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfócala
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abre una nueva
        if (clients.openWindow) {
          const route = event.notification.data?.route || '/';
          return clients.openWindow(route);
        }
      })
  );
});
