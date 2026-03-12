import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { toast } from 'ngx-sonner';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  toast.warning('Necesitas una cuenta', {
    description: 'Inicia sesión para acceder a esta sección 🔐',
  });

  return router.createUrlTree(['/login']);
};