import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

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

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
