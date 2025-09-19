import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Save the attempted URL for later redirect
    const currentUrl = router.url;
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: currentUrl }
    });
  }
};