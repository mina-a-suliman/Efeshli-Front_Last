
// src/app/core/guards/reverse-auth-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const reverseAuthGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated, redirect away from login/signup/forgot pages
  if (authService.isAuthenticated()) {
    return router.parseUrl('/home');
  }

  // Otherwise allow access
  return true;
};