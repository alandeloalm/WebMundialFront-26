import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { Login } from './pages/login/login';
import { Mapa } from './pages/mapa/mapa';
import { Experiencias } from './pages/experiencias/experiencias';
import { Recompensas } from './pages/recompensas/recompensas';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { CompletarPerfil } from './pages/completar-perfil/completar-perfil';
import { perfilGuard } from './core/guards/perfil.guard';
import { AuthService } from './core/auth/auth.service';

export const routes: Routes = [
  {
    path: '',
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (auth.isLoggedIn() && auth.perfilCompleto()) {
        return router.createUrlTree(['/recompensas']);
      }
      return router.createUrlTree(['/login']);
    }],
    component: Mapa,
  },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'completar-perfil', component: CompletarPerfil, canActivate: [authGuard] },
  { path: 'mapa', component: Mapa },
  { path: 'recompensas', component: Recompensas, canActivate: [authGuard, perfilGuard] },
  { path: 'experiencias', component: Experiencias, canActivate: [authGuard, perfilGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard, roleGuard] },
];