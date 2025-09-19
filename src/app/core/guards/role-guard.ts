import { inject } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (requiredRoles: string[]): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  return authService.hasAnyRole(requiredRoles) ? true : router.parseUrl('/unauthorized');
};