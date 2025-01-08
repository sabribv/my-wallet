importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: '__FIREBASE_API_KEY__',
  authDomain: '__FIREBASE_AUTH_DOMAIN__',
  projectId: '__FIREBASE_PROJECT_ID__',
  storageBucket: '__FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__FIREBASE_APP_ID__',
  measurementId: '__FIREBASE_MEASUREMENT_ID__',
  vapidKey: '__FIREBASE_VAPID_KEY__',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
});

messaging.onBackgroundMessage((payload) => {
  // mensaje en bg
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event.notification);

  // Aquí puedes hacer lo que desees, como abrir una URL o actualizar la interfaz
  event.notification.close();

  // Ejemplo de redirigir al usuario a una URL cuando la notificación es clickeada
  event.waitUntil(
    clients.openWindow('https://your-app-url.com')
  );
});
