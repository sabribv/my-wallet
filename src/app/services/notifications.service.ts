import {Injectable} from '@angular/core';
import { AuthService } from '@services/auth.service';
import { getMessaging, getToken } from 'firebase/messaging';
import {UserService} from '@services/user.service';
import {firebaseConfig} from '../firebase-config';

@Injectable({ providedIn: 'root' })
export class NotificationsService {

  constructor(private authService: AuthService, private userService: UserService) {}

  requestNotificationPermission(userId: string) {
    const messaging = getMessaging();

    // Solicitar permisos de notificación
    Notification.requestPermission().then(async (permission) => {
      if (permission === 'granted') {
        // Si el usuario da permisos, obtenemos el token
        const token = await getToken(messaging, {
          vapidKey: firebaseConfig.vapidKey,
        });

        await this.userService.updateToken(userId, token);
      }
    });
  }

  async initializeNotificationPermission() {
    const user = await this.authService.getCurrentUser();

    if (user) {
      this.requestNotificationPermission(user.uid);
    }
  }
}
