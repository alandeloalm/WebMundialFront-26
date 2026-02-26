import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Mapa } from './pages/mapa/mapa';
import { Experiencias } from './pages/experiencias/experiencias';
import { Recompensas } from './pages/recompensas/recompensas';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
    { path: '', redirectTo: 'recompensas', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'recompensas', component: Recompensas },
    { path: 'experiencias', component: Experiencias },
    { path: 'mapa', component: Mapa },
    { path: 'dashboard', component: Dashboard },
];
