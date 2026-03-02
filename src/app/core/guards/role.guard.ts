import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRole = route.data['expectedRole'];
  const userRole = authService.userRole();

  if (authService.isLoggedIn() && userRole === expectedRole) {
    return true;
  }

  authService.redirectByRole(userRole);
  return false;
};