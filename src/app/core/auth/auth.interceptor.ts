import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

const rutasPublicas = ['/api/lugares'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  const reqConToken = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      const esPublica = rutasPublicas.some(r => req.url.includes(r));

      if ((error.status === 401 || error.status === 403) && !esPublica) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};