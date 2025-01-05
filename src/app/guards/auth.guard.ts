import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '@services/auth.service';
import {inject} from '@angular/core';
import {map} from 'rxjs';
import {NotificationsService} from '@services/notifications.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const notificationsService = inject(NotificationsService);
  const router = inject(Router);

  return authService.getAuthState().pipe(
    map(user => {
      if (user) {
        if (user) {
          void notificationsService.initializeNotificationPermission();
        }
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
