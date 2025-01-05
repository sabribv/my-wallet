import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';
import { firebaseConfig } from 'src/app/firebase-config';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/ngsw-worker.js')
    .then((registration) => {
      console.log('Service Worker registrado con éxito:', registration);
    })
    .catch((error) => {
      console.error('Error al registrar el Service Worker:', error);
    });

  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Firebase Messaging Service Worker registrado con éxito:', registration);
    })
    .catch((error) => {
      console.error('Error al registrar el Firebase Messaging Service Worker:', error);
    });
}

const firebaseApp = initializeApp(firebaseConfig);
console.log('Firebase inicializado:', firebaseApp);

// Opcional: Configura Firebase Messaging
const messaging = getMessaging(firebaseApp);
onMessage(messaging, (payload) => {
  console.log('Mensaje recibido en primer plano:', payload);
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
