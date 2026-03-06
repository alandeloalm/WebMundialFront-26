// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Si hay token, clonar el request y agregar el header Authorization
  const reqConToken = token
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      })
    : req;

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {

      // Si el backend responde 401 (sin token) o 403 (token expirado/inválido)
      // cerramos la sesión automáticamente y mandamos al login
      if (error.status === 401 || error.status === 403) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};