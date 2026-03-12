import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { toast } from 'ngx-sonner';

export const roleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.userRole() === 'admin') {
    return true;
  }

  toast.error('Acceso denegado', {
    description: 'No tienes permisos para ver esta sección.',
  });

  return router.createUrlTree(['/mapa']);
};