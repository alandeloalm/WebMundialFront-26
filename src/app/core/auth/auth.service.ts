// src/app/core/auth/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  isLoggedIn = signal<boolean>(localStorage.getItem('is_logged') === 'true');
  userRole = signal<string | null>(localStorage.getItem('user_role'));

  constructor() {
    if (localStorage.getItem('is_logged') !== 'true') {
      this.logout();
    }
  }

  login(role: 'admin' | 'user') {
    localStorage.setItem('is_logged', 'true');
    localStorage.setItem('user_role', role);

    this.isLoggedIn.set(true);
    this.userRole.set(role);

    this.redirectByRole(role);
  }

  redirectByRole(role: string | null) {
    const routesByRole: Record<string, string> = {
      'admin': '/dashboard',
      'user': '/recompensas'
    };
    
    const target = routesByRole[role || ''] || '/login';
    this.router.navigate([target]);
  }

  logout() {
    localStorage.clear();
    this.isLoggedIn.set(false);
    this.userRole.set(null);
    this.router.navigate(['/login']);
  }
}