import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public auth = inject(AuthService);
  mobileOpen = signal(false);

  private allNavItems = [
    { path: '/recompensas', label: 'Recompensas', icon: 'trophy', adminOnly: false },
    { path: '/experiencias', label: 'Experiencias', icon: 'qr-code', adminOnly: false },
    { path: '/mapa', label: 'Mapa', icon: 'map', adminOnly: false },
    { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard', adminOnly: true },
  ];

  navItems = computed(() => {
    const role = this.auth.userRole();
    return this.allNavItems.filter(item => 
      !item.adminOnly || (item.adminOnly && role === 'admin')
    );
  });

  toggleMobileMenu() {
    this.mobileOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileOpen.set(false);
  }

  logout() {
    toast.info('Sesión cerrada', {
      description: 'Hasta pronto 👋'
    });
    this.auth.logout()
  }
}