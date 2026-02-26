import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  isLoggedIn = signal(false);

  login() {
    this.router.navigate(['/recompensas']).then(() => {
      this.isLoggedIn.set(true);
    });
  }

  logout() {
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}