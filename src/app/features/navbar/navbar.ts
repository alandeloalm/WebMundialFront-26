import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { toast } from 'ngx-sonner';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public auth = inject(AuthService);
  private router = inject(Router);
  mobileOpen = signal(false);

  private rutasOcultas = ['/login', '/completar-perfil'];

  currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
    ),
    { initialValue: null }
  );

  mostrarNavbar = computed(() => {
    this.currentUrl();
    return !this.rutasOcultas.some(r => this.router.url.startsWith(r));
  });

  private allNavItems = [
    { path: '/recompensas', label: 'Recompensas', icon: 'trophy',             requiresAuth: true,  adminOnly: false },
    { path: '/experiencias', label: 'Experiencias', icon: 'qr-code',          requiresAuth: true,  adminOnly: false },
    { path: '/mapa',         label: 'Mapa',         icon: 'map',              requiresAuth: false, adminOnly: false },
    { path: '/dashboard',    label: 'Dashboard',    icon: 'layout-dashboard', requiresAuth: true,  adminOnly: true  },
  ];

  navItems = computed(() => {
    const loggedIn = this.auth.isLoggedIn();
    const role = this.auth.userRole();

    return this.allNavItems.filter(item => {
      if (item.adminOnly) return loggedIn && role === 'admin';
      if (item.requiresAuth) return loggedIn && this.auth.perfilCompleto();
      return true;
    });
  });

  toggleMobileMenu() {
    this.mobileOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileOpen.set(false);
  }

  logout() {
    toast.info('Sesión cerrada', { description: 'Hasta pronto 👋' });
    this.auth.logout();
  }
}