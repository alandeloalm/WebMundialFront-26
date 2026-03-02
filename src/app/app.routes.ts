import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Mapa } from './pages/mapa/mapa';
import { Experiencias } from './pages/experiencias/experiencias';
import { Recompensas } from './pages/recompensas/recompensas';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login, canActivate: [guestGuard]},
    { path: 'recompensas', component: Recompensas, canActivate: [authGuard] },
    { path: 'experiencias', component: Experiencias, canActivate: [authGuard] },
    { path: 'mapa', component: Mapa, canActivate: [authGuard] },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard, roleGuard], data: { expectedRole: 'admin' } },
];
