import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';
import { firebaseConfig } from 'src/app/firebase-config';
import moment from 'moment';
import 'moment/locale/es';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import {registerLocaleData} from '@angular/common';

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

const messaging = getMessaging(firebaseApp);
onMessage(messaging, (payload) => {
  console.log('Mensaje recibido en primer plano:', payload);
});

registerLocaleData(localeEs, 'es', localeEsExtra);
moment.locale('es');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
