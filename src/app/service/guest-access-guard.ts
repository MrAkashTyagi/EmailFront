import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService
} from './service/auth-service';

export const guestAccessGuard:
  CanActivateFn = () => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);

    if (
      !authService.isLoggedIn()
    ) {

      return router.createUrlTree([
        '/login'
      ]);
    }

    authService.loadUser();

    if (
      authService.isGuest()
    ) {

      return router.createUrlTree([
        '/wall'
      ]);
    }

    return true;
  };
